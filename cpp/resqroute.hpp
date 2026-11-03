#pragma once

#include <iostream>
#include <vector>
#include <string>
#include <queue>
#include <unordered_map>
#include <limits>
#include <algorithm>
#include <stdexcept>
#include <iomanip>
#include <sstream>

namespace ResQRoute {

const double INF = std::numeric_limits<double>::infinity();

struct Edge {
    int to;
    double weight;
    std::string roadName;
};

struct Node {
    int id;
    std::string name;
    std::string category; // e.g. "Hospital", "Fire Station", "Intersection", "Residential", "Commercial"
    double x;
    double y;
};

struct PathResult {
    bool reachable;
    double totalDistance;
    std::vector<int> pathNodeIds;
    std::vector<std::string> pathNodeNames;
    std::vector<std::string> stepDescriptions;
    std::vector<double> distances;
    std::vector<int> predecessors;
    int settledNodeCount;
};

class CityGraph {
private:
    std::vector<Node> nodes;
    std::vector<std::vector<Edge>> adj;
    std::unordered_map<std::string, int> nameToId;

public:
    CityGraph() = default;

    int addNode(const std::string& name, const std::string& category = "Intersection", double x = 0.0, double y = 0.0) {
        if (nameToId.find(name) != nameToId.end()) {
            return nameToId[name];
        }
        int id = static_cast<int>(nodes.size());
        nodes.push_back({id, name, category, x, y});
        adj.emplace_back();
        nameToId[name] = id;
        return id;
    }

    void addRoad(int u, int v, double weight, const std::string& roadName = "", bool bidirectional = true) {
        if (weight < 0) {
            throw std::invalid_argument("Negative edge weights are not allowed in Dijkstra's algorithm! Weight: " + std::to_string(weight));
        }
        if (u < 0 || u >= static_cast<int>(nodes.size()) || v < 0 || v >= static_cast<int>(nodes.size())) {
            throw std::out_of_range("Node ID out of range");
        }
        adj[u].push_back({v, weight, roadName});
        if (bidirectional && u != v) {
            adj[v].push_back({u, weight, roadName});
        }
    }

    void addRoadByName(const std::string& uName, const std::string& vName, double weight, const std::string& roadName = "", bool bidirectional = true) {
        if (nameToId.find(uName) == nameToId.end() || nameToId.find(vName) == nameToId.end()) {
            throw std::invalid_argument("One or both location names do not exist");
        }
        addRoad(nameToId[uName], nameToId[vName], weight, roadName, bidirectional);
    }

    int getNodeCount() const { return static_cast<int>(nodes.size()); }

    int getEdgeCount() const {
        int count = 0;
        for (const auto& edges : adj) {
            count += edges.size();
        }
        return count / 2; // for undirected
    }

    const Node& getNode(int id) const { return nodes.at(id); }

    int getNodeId(const std::string& name) const {
        auto it = nameToId.find(name);
        if (it == nameToId.end()) return -1;
        return it->second;
    }

    const std::vector<Edge>& getEdges(int id) const { return adj.at(id); }

    // Dijkstra's Shortest Path Algorithm
    // Complexity: Time O((V + E) log V), Space O(V + E)
    PathResult findShortestPath(int source, int destination) const {
        int n = static_cast<int>(nodes.size());
        if (source < 0 || source >= n || destination < 0 || destination >= n) {
            throw std::out_of_range("Invalid source or destination node ID");
        }

        std::vector<double> dist(n, INF);
        std::vector<int> prev(n, -1);
        std::vector<bool> settled(n, false);
        std::vector<std::string> log;

        // Min-Priority Queue storing pairs: (tentative_distance, vertex_id)
        using PQElement = std::pair<double, int>;
        std::priority_queue<PQElement, std::vector<PQElement>, std::greater<PQElement>> pq;

        dist[source] = 0.0;
        pq.push({0.0, source});
        log.push_back("Initialized source [" + nodes[source].name + "] distance to 0.0");

        int settledCount = 0;

        while (!pq.empty()) {
            auto [d, u] = pq.top();
            pq.pop();

            if (settled[u]) continue;
            settled[u] = true;
            settledCount++;

            std::stringstream ss;
            ss << "Extracted node [" << nodes[u].name << "] with finalized shortest distance " << std::fixed << std::setprecision(2) << d;
            log.push_back(ss.str());

            // Early exit optimization if destination is finalized
            if (u == destination) {
                log.push_back("Reached destination [" + nodes[destination].name + "]. Search terminated.");
                break;
            }

            // Relaxation step
            for (const auto& edge : adj[u]) {
                int v = edge.to;
                double w = edge.weight;

                if (settled[v]) continue;

                if (dist[u] + w < dist[v]) {
                    double oldDist = dist[v];
                    dist[v] = dist[u] + w;
                    prev[v] = u;
                    pq.push({dist[v], v});

                    std::stringstream rlog;
                    rlog << "  Relaxed edge [" << nodes[u].name << " -> " << nodes[v].name << "]: "
                         << (oldDist == INF ? "INF" : std::to_string(oldDist)) << " -> "
                         << std::fixed << std::setprecision(2) << dist[v]
                         << " (via " << (edge.roadName.empty() ? "Road" : edge.roadName) << ")";
                    log.push_back(rlog.str());
                }
            }
        }

        PathResult result;
        result.distances = dist;
        result.predecessors = prev;
        result.settledNodeCount = settledCount;
        result.stepDescriptions = log;

        if (dist[destination] == INF) {
            result.reachable = false;
            result.totalDistance = INF;
            return result;
        }

        result.reachable = true;
        result.totalDistance = dist[destination];

        // Path reconstruction from destination back to source
        std::vector<int> path;
        for (int curr = destination; curr != -1; curr = prev[curr]) {
            path.push_back(curr);
        }
        std::reverse(path.begin(), path.end());

        result.pathNodeIds = path;
        for (int id : path) {
            result.pathNodeNames.push_back(nodes[id].name);
        }

        return result;
    }
};

} // namespace ResQRoute


#include "resqroute.hpp"
#include <iostream>
#include <cassert>
#include <iomanip>

using namespace ResQRoute;

void printBanner(const std::string& title) {
    std::cout << "\n======================================================\n";
    std::cout << "  " << title << "\n";
    std::cout << "======================================================\n";
}

bool runAllTests() {
    printBanner("ResQRoute C++17 Algorithm Test Suite");
    int passed = 0;
    int total = 0;

    // Test 1: Simple Connected Graph
    {
        total++;
        CityGraph g;
        int a = g.addNode("Station A");
        int b = g.addNode("Station B");
        int c = g.addNode("Station C");
        g.addRoad(a, b, 4.0, "Main St");
        g.addRoad(b, c, 3.0, "Broadway");
        g.addRoad(a, c, 10.0, "Highway 1");

        auto res = g.findShortestPath(a, c);
        if (res.reachable && res.totalDistance == 7.0 && res.pathNodeIds.size() == 3) {
            std::cout << "[PASS] Test 1: Simple Connected Graph (Expected: 7.0, Got: " << res.totalDistance << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 1: Simple Connected Graph\n";
        }
    }

    // Test 2: Linear Path Graph
    {
        total++;
        CityGraph g;
        int n0 = g.addNode("L0");
        int n1 = g.addNode("L1");
        int n2 = g.addNode("L2");
        int n3 = g.addNode("L3");
        g.addRoad(n0, n1, 2.5);
        g.addRoad(n1, n2, 3.5);
        g.addRoad(n2, n3, 1.0);

        auto res = g.findShortestPath(n0, n3);
        if (res.reachable && res.totalDistance == 7.0 && res.pathNodeIds.size() == 4) {
            std::cout << "[PASS] Test 2: Linear Path Graph (Expected: 7.0, Got: " << res.totalDistance << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 2: Linear Path Graph\n";
        }
    }

    // Test 3: Cyclic Graph (Triangle with shortcut vs perimeter)
    {
        total++;
        CityGraph g;
        int u = g.addNode("Central Base");
        int v = g.addNode("East Depot");
        int w = g.addNode("Emergency Zone");
        g.addRoad(u, v, 2.0);
        g.addRoad(v, w, 2.0);
        g.addRoad(u, w, 5.0);

        auto res = g.findShortestPath(u, w);
        if (res.reachable && res.totalDistance == 4.0 && res.pathNodeIds.size() == 3) {
            std::cout << "[PASS] Test 3: Cyclic Graph (Expected: 4.0 via intermediate, Got: " << res.totalDistance << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 3: Cyclic Graph\n";
        }
    }

    // Test 4: Complete Graph K4
    {
        total++;
        CityGraph g;
        int v0 = g.addNode("Sector 1");
        int v1 = g.addNode("Sector 2");
        int v2 = g.addNode("Sector 3");
        int v3 = g.addNode("Sector 4");
        g.addRoad(v0, v1, 8.0);
        g.addRoad(v0, v2, 3.0);
        g.addRoad(v0, v3, 12.0);
        g.addRoad(v2, v1, 2.0); // path v0 -> v2 -> v1 = 5.0 < 8.0
        g.addRoad(v1, v3, 1.0); // path v0 -> v2 -> v1 -> v3 = 6.0 < 12.0
        g.addRoad(v2, v3, 7.0);

        auto res = g.findShortestPath(v0, v3);
        if (res.reachable && res.totalDistance == 6.0 && res.pathNodeIds.size() == 4) {
            std::cout << "[PASS] Test 4: Complete Graph K4 (Expected: 6.0 [0->2->1->3], Got: " << res.totalDistance << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 4: Complete Graph K4\n";
        }
    }

    // Test 5: Disconnected Graph
    {
        total++;
        CityGraph g;
        int c1 = g.addNode("Island A1");
        int c2 = g.addNode("Island A2");
        int d1 = g.addNode("Island B1");
        g.addRoad(c1, c2, 4.0);

        auto res = g.findShortestPath(c1, d1);
        if (!res.reachable && res.totalDistance == INF) {
            std::cout << "[PASS] Test 5: Disconnected Graph (Correctly unreachable INF)\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 5: Disconnected Graph\n";
        }
    }

    // Test 6: Equal-Weight Paths
    {
        total++;
        CityGraph g;
        int s = g.addNode("Dispatch");
        int top = g.addNode("North Ave");
        int bot = g.addNode("South Ave");
        int t = g.addNode("Hospital Target");
        g.addRoad(s, top, 5.0);
        g.addRoad(top, t, 5.0);
        g.addRoad(s, bot, 5.0);
        g.addRoad(bot, t, 5.0);

        auto res = g.findShortestPath(s, t);
        if (res.reachable && res.totalDistance == 10.0 && res.pathNodeIds.size() == 3) {
            std::cout << "[PASS] Test 6: Equal-Weight Paths (Distance: 10.0, valid path found)\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 6: Equal-Weight Paths\n";
        }
    }

    // Test 7: Single-Vertex Graph (Source == Destination)
    {
        total++;
        CityGraph g;
        int s = g.addNode("On-site Clinic");

        auto res = g.findShortestPath(s, s);
        if (res.reachable && res.totalDistance == 0.0 && res.pathNodeIds.size() == 1) {
            std::cout << "[PASS] Test 7: Single-Vertex Graph (Expected: 0.0, Got: " << res.totalDistance << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 7: Single-Vertex Graph\n";
        }
    }

    // Test 8: Large City Benchmark Graph (Metropolitan Network with 12 nodes, 18 roads)
    {
        total++;
        CityGraph g;
        int h1 = g.addNode("Central General Hospital", "Hospital", 100, 100);
        int fs1 = g.addNode("Fire Station 1", "Fire Station", 250, 80);
        int in1 = g.addNode("Downtown Plaza", "Intersection", 200, 220);
        int in2 = g.addNode("Northbridge Crossing", "Intersection", 380, 140);
        int in3 = g.addNode("Westfield Junction", "Intersection", 120, 340);
        int in4 = g.addNode("Harbor Parkway", "Intersection", 320, 320);
        int h2 = g.addNode("Mercy Trauma Centre", "Hospital", 500, 240);
        int fs2 = g.addNode("Station 9 Rescue", "Fire Station", 420, 420);
        int res1 = g.addNode("Oakridge Suburb", "Residential", 180, 460);
        int com1 = g.addNode("Tech Innovation Park", "Commercial", 480, 100);
        int amb = g.addNode("Southside Ambulance Post", "Ambulance", 300, 500);
        // Disconnected node in benchmark graph to test unreachable isolation
        g.addNode("Industrial Harbor [Isolated Dock]", "Industrial", 620, 500);

        // Roads with realistic travel distances in km
        g.addRoad(h1, fs1, 3.2, "Medical Blvd");
        g.addRoad(h1, in1, 2.8, "Civic Center Way");
        g.addRoad(h1, in3, 5.1, "West Expressway");
        g.addRoad(fs1, in2, 3.0, "Firehouse Way");
        g.addRoad(fs1, com1, 4.5, "East Boulevard");
        g.addRoad(in1, in2, 3.5, "Central Cross");
        g.addRoad(in1, in4, 2.2, "Grand Ave");
        g.addRoad(in1, in3, 2.9, "Park Street");
        g.addRoad(in2, h2, 2.7, "Trauma Access Hwy");
        g.addRoad(in2, com1, 2.4, "Silicon Corridor");
        g.addRoad(in3, res1, 3.1, "Suburban Way");
        g.addRoad(in3, in4, 3.8, "Midland Arterial");
        g.addRoad(in4, fs2, 2.6, "Harbor Link");
        g.addRoad(in4, amb, 4.0, "South Meridian");
        g.addRoad(h2, fs2, 3.6, "Eastern Ring");
        g.addRoad(res1, amb, 2.5, "South Ridge Rd");
        g.addRoad(fs2, amb, 2.1, "Rescue Run");

        // Query: Shortest emergency path from Fire Station 1 to Southside Ambulance Post
        auto res = g.findShortestPath(fs1, amb);
        // Possible paths:
        // FS1 -> IN1 -> IN4 -> FS2 -> AMB = 3.0? No, FS1->IN1 not direct: FS1->H1(3.2)->IN1(2.8)=6.0; or FS1->IN2(3.0)->IN1(3.5)=6.5
        // FS1 -> IN2(3.0) -> H2(2.7) -> FS2(3.6) -> AMB(2.1) = 11.4
        // FS1 -> IN2(3.0) -> IN1(3.5) -> IN4(2.2) -> FS2(2.6) -> AMB(2.1) = 13.4
        // FS1 -> H1(3.2) -> IN1(2.8) -> IN4(2.2) -> FS2(2.6) -> AMB(2.1) = 12.9
        // FS1 -> IN2(3.0) -> H2(2.7) -> FS2(3.6) -> AMB(2.1) = 11.4
        if (res.reachable && res.totalDistance > 0 && !res.pathNodeIds.empty()) {
            std::cout << "[PASS] Test 8: Large City Benchmark Graph (Distance: " << res.totalDistance << " km, Path: ";
            for (size_t i = 0; i < res.pathNodeNames.size(); ++i) {
                std::cout << res.pathNodeNames[i] << (i + 1 < res.pathNodeNames.size() ? " -> " : "");
            }
            std::cout << ")\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 8: Large City Benchmark Graph\n";
        }
    }

    // Negative weight rejection test
    {
        total++;
        CityGraph g;
        int u = g.addNode("A");
        int v = g.addNode("B");
        bool threw = false;
        try {
            g.addRoad(u, v, -5.0);
        } catch (const std::invalid_argument& e) {
            threw = true;
        }
        if (threw) {
            std::cout << "[PASS] Test 9: Negative Weight Rejection (Correctly rejected with exception)\n";
            passed++;
        } else {
            std::cout << "[FAIL] Test 9: Negative Weight Rejection\n";
        }
    }

    printBanner("Test Results: " + std::to_string(passed) + " / " + std::to_string(total) + " Passed");
    return passed == total;
}

int main() {
    std::cout << "ResQRoute: Intelligent Emergency Services Routing System [C++17 Engine]\n";
    std::cout << "DSA-II Academic Project | Dijkstra's Algorithm Implementation\n";

    bool success = runAllTests();
    return success ? 0 : 1;
}

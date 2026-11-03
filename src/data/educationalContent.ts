export interface VivaQuestion {
  question: string;
  answer: string;
  category: 'Concepts' | 'Complexity' | 'Data Structures' | 'Edge Cases';
}

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    category: 'Concepts',
    question: 'Why is Dijkstra\'s algorithm classified as a "Greedy" algorithm?',
    answer: 'At every iteration, Dijkstra\'s algorithm makes the locally optimal choice by extracting the unsettled vertex with the minimum tentative distance from the source. Because all edge weights are strictly non-negative, no subsequent relaxation can ever discover a shorter path to this vertex. Thus, this local greedy choice is guaranteed to be globally optimal.'
  },
  {
    category: 'Edge Cases',
    question: 'Why does Dijkstra\'s algorithm fail when negative edge weights are present?',
    answer: 'Dijkstra\'s algorithm relies on the monotonic property of shortest paths: once a vertex u is extracted from the priority queue and marked "settled", its distance is permanently finalized. If negative weights exist, a longer positive path could later encounter a large negative edge and yield a smaller total distance, violating the greedy assumption. For negative weights, the Bellman-Ford algorithm O(V·E) or SPFA must be used instead.'
  },
  {
    category: 'Complexity',
    question: 'What is the time complexity of Dijkstra\'s algorithm using an Adjacency List and Min-Binary Heap?',
    answer: 'The time complexity is O((V + E) log V). Every vertex is inserted and extracted from the min-heap at most once (V · log V). Every edge (u, v) is relaxed at most once, which triggers a decrease-key/heap insert operation taking O(log V) time, contributing O(E · log V). Summing both gives O((V + E) log V). In connected graphs where E ≥ V - 1, this simplifies to O(E log V).'
  },
  {
    category: 'Data Structures',
    question: 'What is the theoretical advantage of using a Fibonacci Heap over a Binary Heap in Dijkstra?',
    answer: 'In a Fibonacci Heap, the decrease-key operation runs in amortized O(1) time, compared to O(log V) in a Binary Heap. Therefore, the E relaxations take O(E) total amortized time rather than O(E log V). This yields a total time complexity of O(E + V log V), which is asymptotically superior for dense graphs where E ≈ V².'
  },
  {
    category: 'Concepts',
    question: 'What is "Edge Relaxation" and what mathematical condition governs it?',
    answer: 'Relaxation tests whether traveling from the source to vertex v through vertex u improves the current best-known distance to v. The condition is: if dist[u] + weight(u, v) < dist[v], then dist[v] is updated to dist[u] + weight(u, v), and parent[v] is set to u. It tightens the upper bound on the shortest distance.'
  },
  {
    category: 'Concepts',
    question: 'How is the actual shortest path reconstructed after Dijkstra\'s algorithm completes?',
    answer: 'During relaxation, whenever dist[v] is updated via edge (u, v), we record parent[v] = u in a predecessor array. After execution, we backtrack from the destination vertex through parent pointers until reaching the source (where parent[source] == null), and then reverse the resulting sequence to produce the source-to-destination path.'
  },
  {
    category: 'Edge Cases',
    question: 'Can Dijkstra\'s algorithm handle graphs with cycles? What about zero-weight edges?',
    answer: 'Yes! Dijkstra\'s algorithm naturally handles positive directed or undirected cycles because once all vertices in the cycle have their shortest distance settled, they are not re-extracted. Zero-weight edges (weight = 0) are also correctly handled as long as there are no negative cycles, though multiple equal-cost paths may occur.'
  },
  {
    category: 'Complexity',
    question: 'Compare Dijkstra\'s algorithm with BFS and Bellman-Ford.',
    answer: '1. BFS operates on unweighted graphs in O(V + E) time. Dijkstra generalizes BFS to non-negative weighted graphs using a priority queue in O((V + E) log V).\n2. Bellman-Ford handles graphs with negative edge weights and detects negative cycles in O(V · E) time, which is slower than Dijkstra on non-negative graphs.'
  },
  {
    category: 'Data Structures',
    question: 'Why do we prefer an Adjacency List over an Adjacency Matrix for real-world road networks?',
    answer: 'City road networks are planar and sparse graphs where each intersection typically connects to only 3 to 4 roads (degree ≤ 4), meaning E = O(V). An Adjacency List consumes O(V + E) = O(V) memory, whereas an Adjacency Matrix requires O(V²) memory and forces every iteration to scan all V entries, degrading Dijkstra\'s complexity to O(V²).'
  },
  {
    category: 'Concepts',
    question: 'What is the early termination optimization in Dijkstra\'s single-pair shortest path?',
    answer: 'When we only need the shortest path between a specific source and destination (rather than all-pairs or single-source all-destinations), we can immediately terminate the algorithm as soon as the destination vertex is popped from the priority queue. By the greedy choice property, its tentative distance is already guaranteed to be minimal.'
  },
  {
    category: 'Edge Cases',
    question: 'What happens if the destination is in a disconnected component of the graph?',
    answer: 'If the destination belongs to a disconnected component, the priority queue will empty without ever extracting the destination. Its distance will remain at the initial sentinel value (dist[destination] == Infinity), and parent[destination] will be null, correctly indicating that the location is unreachable.'
  },
  {
    category: 'Complexity',
    question: 'What is the auxiliary space complexity of Dijkstra\'s algorithm and what arrays are needed?',
    answer: 'The auxiliary space complexity is O(V + E). It requires:\n1. Distance array: dist[] of size V (O(V))\n2. Predecessor/Parent array: parent[] of size V (O(V))\n3. Settled/Visited boolean set: size V (O(V))\n4. Min-Priority Queue: stores at most O(V) active vertices, or up to O(E) in duplicate-key implementations.\n5. Adjacency list representation: O(V + E).'
  }
];

export const PSEUDOCODE = `// Dijkstra's Shortest Path Algorithm
function Dijkstra(Graph G, Vertex source, Vertex target):
    dist = array of size |V| initialized to INFINITY
    parent = array of size |V| initialized to NULL
    visited = boolean array of size |V| initialized to FALSE
    PQ = MinPriorityQueue()

    dist[source] = 0
    PQ.push(source, 0)

    while PQ is not empty:
        u = PQ.extract_min()

        if visited[u]:
            continue
        visited[u] = TRUE

        if u == target:
            break // Target reached with minimal distance

        for each neighbor v of u with edge weight w:
            if not visited[v]:
                // Relaxation step
                if dist[u] + w < dist[v]:
                    dist[v] = dist[u] + w
                    parent[v] = u
                    PQ.push(v, dist[v])

    return ReconstructPath(parent, source, target), dist[target]`;

export const COMPARISON_MATRIX = [
  {
    algorithm: 'Breadth-First Search (BFS)',
    weights: 'Unweighted (equal weights)',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    negativeWeights: 'No (Assumes uniform edge cost = 1)',
    useCase: 'Fewest-hop paths, social networks, mazes'
  },
  {
    algorithm: 'Dijkstra (Binary Heap)',
    weights: 'Non-negative (w >= 0)',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V + E)',
    negativeWeights: 'NO (Produces incorrect distances)',
    useCase: 'Emergency routing, GPS navigation, OSPF/IS-IS network routing'
  },
  {
    algorithm: 'Dijkstra (Fibonacci Heap)',
    weights: 'Non-negative (w >= 0)',
    timeComplexity: 'O(E + V log V)',
    spaceComplexity: 'O(V + E)',
    negativeWeights: 'NO',
    useCase: 'Dense non-negative graphs (theoretical optimum)'
  },
  {
    algorithm: 'Bellman-Ford',
    weights: 'Arbitrary (Positive and Negative)',
    timeComplexity: 'O(V * E)',
    spaceComplexity: 'O(V)',
    negativeWeights: 'YES (Detects negative cycles)',
    useCase: 'Financial arbitrage detection, RIP routing protocol'
  },
  {
    algorithm: 'Floyd-Warshall',
    weights: 'Arbitrary (No negative cycles)',
    timeComplexity: 'O(V³)',
    spaceComplexity: 'O(V²)',
    negativeWeights: 'YES (All-Pairs shortest path)',
    useCase: 'All-Pairs distance matrix for small to mid graphs'
  },
  {
    algorithm: 'A* Search Algorithm',
    weights: 'Non-negative with Heuristic h(n)',
    timeComplexity: 'O(E) best, O(b^d) worst',
    spaceComplexity: 'O(V)',
    negativeWeights: 'NO',
    useCase: 'Video game AI pathfinding, robotics with Euclidean distance'
  }
];


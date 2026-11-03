# ResQRoute — Intelligent Emergency Services Routing System
## DSA-II Academic Case Study | Dijkstra's Shortest Path Algorithm

[![C++17](https://img.shields.io/badge/C%2B%2B-17-blue.svg)](https://isocpp.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Project Overview

**ResQRoute** is an intelligent, high-performance emergency vehicle dispatch and shortest-path routing system developed as an academic case study for **Data Structures & Algorithms II (DSA-II)**.

In emergency operations (EMS, Fire Rescue, Disaster Management), every second counts. Finding the quickest route across a complex city road network is fundamentally a **Single-Source Shortest Path (SSSP)** graph problem on a weighted, planar network:

- **Vertices ($V$)**: Represent emergency departments, hospitals, fire stations, ambulance posts, police precincts, and road intersections.
- **Edges ($E$)**: Represent physical roads, avenues, highways, and bypasses connecting adjacent locations.
- **Edge Weights ($w \ge 0$)**: Represent transit distance in kilometers ($\text{km}$) or travel time in minutes ($\text{min}$).
- **Core Algorithm**: **Dijkstra's Algorithm** with an optimized **Min-Binary Heap** priority queue and an **Adjacency List** graph representation.
- **Asymptotic Complexity**:
  $$\text{Time: } \mathcal{O}((V + E) \log V) \qquad \text{Space: } \mathcal{O}(V + E)$$

---

## 2. Core Modules & Architecture

### A. Overview Dashboard
- Live operational dashboard with real metrics calculated directly from the active graph:
  - Total locations ($|V|$), road segments ($|E|$), and connected components.
  - Active route distance, settled node count, and algorithm execution time ($\text{ms}$).
  - Interactive road network preview with click-to-route shortcuts.
  - Analytical charts: node category distribution (Pie) and arterial road weights (Bar) powered by Recharts.
  - Recent route calculation history log.

### B. City Network Manager
- Full CRUD graph management:
  - Add, edit, and delete locations with category badges, canvas coordinates, and notes.
  - Connect new roads, adjust weights (distance and estimated travel time), set speed limits, and toggle one-way directionality.
  - Cascading deletion: deleting a location automatically cleans up all associated incident roads.
  - Validation: Prevents negative weights, self-loops, duplicate edges, and invalid references.
  - Import/Export: JSON format and two-table CSV (`locations.csv` and `roads.csv`).

### C. Interactive Road Network Visualizer
- Large custom interactive SVG canvas:
  - Smooth pan and mouse-wheel zoom ($30\% - 250\%$) with zoom fit and reset view.
  - Interactive draggable nodes with live coordinate updating.
  - Road weight badges ($w$) rendered directly over edge centers.
  - Dynamic shortest path highlighting with animated glowing strokes.
  - Node role styling: Ambulance/Fire Origin (Blue/Red pulse), Target Incident (Crimson), Settled Nodes (Teal), and Inspected Neighbors (Gold).
  - Built-in map legend and inspector drawer.

### D. Emergency Route Planner
- Dedicated routing interface:
  - Select origin unit and destination incident with quick swap button.
  - Switch weight interpretation: **Physical Distance ($\text{km}$)** vs **Estimated Travel Time ($\text{min}$)**.
  - Turn-by-turn road manifest with cumulative travel weights.
  - Alternative route comparison: discovers and compares secondary viable routes against the primary shortest path.
  - Disconnected topology diagnosis: identifies unreachable destinations with topological explanations.

### E. Algorithm Lab — Interactive Dijkstra Visualizer
- True event-driven step-by-step execution trace:
  - Controls: Play, Pause, Step Next, Step Previous, Reset, Step Scrubber, and Speed slider ($0.5\times$ to $4\times$).
  - Real-time Min-Priority Queue (Binary Heap) visualizer showing root minimum and sorted queue items.
  - Tentative distance array ($\text{dist}[v]$) and predecessor table ($\text{parent}[v]$).
  - Detailed natural-language step explanations explaining **why** a vertex is extracted and **why** edge relaxation succeeded or was rejected.

### F. Testing & Topology Verification Lab
- 8 predefined graph topologies with automated assertion checking:
  1. *Simple Connected Graph* (Basic 3-node triangle relaxation)
  2. *Linear Path Graph* (Strict unbranched sequential chain)
  3. *Cyclic Graph* (Triangle with loop, verifying cycle handling)
  4. *Complete Graph ($K_4$)* (Multi-step cascaded relaxation)
  5. *Disconnected Graph* (Island cluster, verifying unreachable destination)
  6. *Equal-Weight Paths* (Symmetric diamond graph with multiple optimal paths)
  7. *Single-Vertex Graph* ($\text{source} == \text{destination}$, verifying distance = 0)
  8. *Metropolitan Benchmark Graph* (Realistic 12-location city network)
- **One-click "Run All 8 Verifications"** test suite runner reporting PASS/FAIL against ground truth.
- **Custom Graph Sandbox**: Define arbitrary vertices and edges to experiment with bespoke graphs.

### G. DSA-II Learning Centre
- Academic curriculum section:
  - Greedy choice property and optimal substructure proofs.
  - Mathematical edge relaxation formula: $\text{dist}[v] = \min(\text{dist}[v], \text{dist}[u] + w(u, v))$.
  - Formal time and space complexity derivations.
  - **Why Dijkstra fails with negative weights**: Concrete counterexample with visual walkthrough.
  - Taxonomy matrix comparing Dijkstra, BFS, Bellman-Ford, Floyd-Warshall, and A*.
  - Standard pseudocode (CLRS specification) with copy button.
  - **12 Accredited Viva Voce Questions & Answers** for university examination defense.

### H. Printable Academic Report
- Publication-quality academic project paper:
  - Formal problem statement and graph specifications.
  - Full route solution with turn-by-turn road manifests.
  - Algorithmic complexity proofs.
  - Automated test suite sign-off table.
  - Native print stylesheet (`window.print()`) and Markdown export.

---

## 3. Technology Stack

- **Frontend Framework**: React 18 with TypeScript 5.6
- **Build Tool**: Vite 5.4 (1.2s production build with code splitting)
- **Styling**: Tailwind CSS 3.4 (Emergency Operations palette)
- **Icons**: Lucide Icons
- **Visualizations**: Interactive SVG Canvas & Recharts
- **Storage**: LocalStorage persistence (`resqroute_city_graph_v1`)
- **Backend / Standalone Engine**: C++17 (`std::priority_queue`, `std::vector`, `std::unordered_map`)

---

## 4. Setup & Execution Instructions

### A. Frontend Application (React + Vite + TypeScript)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Run Production Build**:
   ```bash
   npm run build
   ```

4. **Preview Production Build**:
   ```bash
   npm run preview
   ```

---

### B. Standalone C++17 Implementation

A native, zero-dependency C++17 implementation is provided in the `cpp/` directory.

1. **Compile and Run Tests via Make**:
   ```bash
   make -C cpp test
   ```

2. **Or Compile Directly with Clang / GCC**:
   ```bash
   clang++ -std=c++17 -Wall -Wextra -O2 cpp/main.cpp -o cpp/resqroute
   ./cpp/resqroute
   ```

**Expected C++ Test Output**:
```
ResQRoute: Intelligent Emergency Services Routing System [C++17 Engine]
DSA-II Academic Project | Dijkstra's Algorithm Implementation

======================================================
  ResQRoute C++17 Algorithm Test Suite
======================================================
[PASS] Test 1: Simple Connected Graph (Expected: 7.0, Got: 7)
[PASS] Test 2: Linear Path Graph (Expected: 7.0, Got: 7)
[PASS] Test 3: Cyclic Graph (Expected: 4.0 via intermediate, Got: 4)
[PASS] Test 4: Complete Graph K4 (Expected: 6.0 [0->2->1->3], Got: 6)
[PASS] Test 5: Disconnected Graph (Correctly unreachable INF)
[PASS] Test 6: Equal-Weight Paths (Distance: 10.0, valid path found)
[PASS] Test 7: Single-Vertex Graph (Expected: 0.0, Got: 0)
[PASS] Test 8: Large City Benchmark Graph (Distance: 11.4 km, Path: Fire Station 1 -> Northbridge Crossing -> Mercy Trauma Centre -> Station 9 Rescue -> Southside Ambulance Post)
[PASS] Test 9: Negative Weight Rejection (Correctly rejected with exception)

======================================================
  Test Results: 9 / 9 Passed
======================================================
```

---

## 5. Sample Datasets

The repository includes pre-packaged datasets in `data/`:
- `data/sample_metropolitan_city.json`: Complete 12-node, 18-edge metropolitan road network.
- `data/sample_locations.csv`: City landmarks, hospitals, and stations.
- `data/sample_roads.csv`: Weighted road corridors with travel distances, speeds, and times.

---

## 6. Algorithmic Correctness & Integrity

- **Centralized Source of Truth**: All tabs (Dashboard, City Network, Planner, Lab, Testing, Reports) share the same underlying graph.
- **Pure Dijkstra**: Uses a genuine Min-Binary Heap with $\text{bubbleUp}$ and $\text{bubbleDown}$ logic.
- **Negative Weights**: Enforces $w \ge 0$. Any attempt to insert a negative weight throws an error immediately.
- **Disconnected Graphs**: Safely returns `reachable: false` and $\text{dist} = \infty$.


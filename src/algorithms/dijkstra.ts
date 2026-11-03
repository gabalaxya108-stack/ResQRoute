import { GraphData, GraphNode, GraphEdge, PathResult, DijkstraStep, PQItem } from '../types/graph';

/**
 * Genuine Min-Binary-Heap implementation for Dijkstra's Algorithm
 * Time Complexity: Insert O(log V), Extract-Min O(log V), Peek O(1)
 */
export class MinBinaryHeap<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  get size(): number {
    return this.heap.length;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  push(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): { item: T; priority: number } | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.bubbleDown(0);
    }
    return top;
  }

  peek(): { item: T; priority: number } | undefined {
    return this.heap[0];
  }

  toArray(): Array<{ item: T; priority: number }> {
    // Return sorted snapshot for visualization inspection
    return [...this.heap].sort((a, b) => a.priority - b.priority);
  }

  private bubbleUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      if (this.heap[current].priority < this.heap[parent].priority) {
        // Swap
        [this.heap[current], this.heap[parent]] = [this.heap[parent], this.heap[current]];
        current = parent;
      } else {
        break;
      }
    }
  }

  private bubbleDown(index: number): void {
    let current = index;
    const length = this.heap.length;
    while (true) {
      let left = 2 * current + 1;
      let right = 2 * current + 2;
      let smallest = current;

      if (left < length && this.heap[left].priority < this.heap[smallest].priority) {
        smallest = left;
      }
      if (right < length && this.heap[right].priority < this.heap[smallest].priority) {
        smallest = right;
      }
      if (smallest !== current) {
        [this.heap[current], this.heap[smallest]] = [this.heap[smallest], this.heap[current]];
        current = smallest;
      } else {
        break;
      }
    }
  }
}

/**
 * Build undirected/directed adjacency list from GraphData
 */
export interface AdjacencyEntry {
  neighborId: string;
  weight: number;
  edge: GraphEdge;
}

export function buildAdjacencyList(
  graph: GraphData,
  weightMode: 'distance' | 'travelTime'
): Map<string, AdjacencyEntry[]> {
  const adj = new Map<string, AdjacencyEntry[]>();
  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }

  for (const edge of graph.edges) {
    const weight = weightMode === 'distance' ? edge.distance : edge.travelTime;
    if (weight < 0) {
      throw new Error(`Negative edge weight detected on road "${edge.roadName}": ${weight}. Dijkstra algorithm requires non-negative weights.`);
    }

    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source)!.push({
        neighborId: edge.target,
        weight,
        edge,
      });

      if (!edge.isOneWay && edge.source !== edge.target) {
        adj.get(edge.target)!.push({
          neighborId: edge.source,
          weight,
          edge,
        });
      }
    }
  }

  return adj;
}

/**
 * Standard Production Dijkstra Run
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V + E)
 */
export function runDijkstra(
  graph: GraphData,
  sourceId: string,
  destinationId: string,
  weightMode: 'distance' | 'travelTime' = 'distance'
): PathResult {
  const t0 = performance.now();
  const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));

  if (!nodeMap.has(sourceId) || !nodeMap.has(destinationId)) {
    throw new Error('Source or Destination node does not exist in graph.');
  }

  const adj = buildAdjacencyList(graph, weightMode);
  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const settled = new Set<string>();

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  }

  const pq = new MinBinaryHeap<string>();
  distances[sourceId] = 0;
  pq.push(sourceId, 0);

  let totalRelaxations = 0;

  while (!pq.isEmpty()) {
    const top = pq.pop()!;
    const u = top.item;
    const d = top.priority;

    if (settled.has(u)) continue;
    settled.add(u);

    if (u === destinationId) {
      break;
    }

    const neighbors = adj.get(u) || [];
    for (const { neighborId: v, weight } of neighbors) {
      if (settled.has(v)) continue;

      totalRelaxations++;
      const candidateDist = d + weight;
      if (candidateDist < distances[v]) {
        distances[v] = candidateDist;
        predecessors[v] = u;
        pq.push(v, candidateDist);
      }
    }
  }

  const t1 = performance.now();
  const reachable = distances[destinationId] !== Infinity;

  // Path reconstruction
  const pathNodeIds: string[] = [];
  const pathEdgeIds: string[] = [];
  const itinerary: PathResult['itinerary'] = [];

  if (reachable) {
    let curr: string | null = destinationId;
    while (curr !== null) {
      pathNodeIds.push(curr);
      curr = predecessors[curr];
    }
    pathNodeIds.reverse();

    // Map segments to edges and calculate cumulative weights
    let runningWeight = 0;
    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const u = pathNodeIds[i];
      const v = pathNodeIds[i + 1];
      const edge = graph.edges.find(
        e =>
          (e.source === u && e.target === v) ||
          (!e.isOneWay && e.source === v && e.target === u)
      );

      if (edge) {
        pathEdgeIds.push(edge.id);
        const segWeight = weightMode === 'distance' ? edge.distance : edge.travelTime;
        runningWeight += segWeight;
        itinerary.push({
          fromNode: nodeMap.get(u)!,
          toNode: nodeMap.get(v)!,
          edge,
          segmentWeight: segWeight,
          cumulativeWeight: runningWeight,
        });
      }
    }
  }

  return {
    reachable,
    sourceId,
    destinationId,
    weightMode,
    totalWeight: reachable ? distances[destinationId] : Infinity,
    pathNodeIds,
    pathEdgeIds,
    settledNodesCount: settled.size,
    totalRelaxations,
    executionTimeMs: Math.max(0.01, +(t1 - t0).toFixed(2)),
    distances,
    predecessors,
    itinerary,
  };
}

/**
 * Step-by-Step Execution Trace Generator for the Algorithm Lab
 * Records every algorithm state transition, heap state, and relaxation logic.
 */
export function generateDijkstraTrace(
  graph: GraphData,
  sourceId: string,
  destinationId: string,
  weightMode: 'distance' | 'travelTime' = 'distance'
): { steps: DijkstraStep[]; finalResult: PathResult } {
  const steps: DijkstraStep[] = [];
  const nodeMap = new Map<string, GraphNode>(graph.nodes.map(n => [n.id, n]));
  const adj = buildAdjacencyList(graph, weightMode);

  const distances: Record<string, number> = {};
  const predecessors: Record<string, string | null> = {};
  const settled = new Set<string>();

  for (const node of graph.nodes) {
    distances[node.id] = Infinity;
    predecessors[node.id] = null;
  }

  const pq = new MinBinaryHeap<string>();
  distances[sourceId] = 0;
  pq.push(sourceId, 0);

  const formatPQ = (): PQItem[] =>
    pq.toArray().map(entry => ({
      nodeId: entry.item,
      nodeName: nodeMap.get(entry.item)?.name || entry.item,
      priority: entry.priority,
    }));

  // Step 0: Initialization
  steps.push({
    stepIndex: 0,
    type: 'INIT',
    currentNodeId: sourceId,
    neighborNodeId: null,
    activeEdgeId: null,
    priorityQueue: formatPQ(),
    distances: { ...distances },
    predecessors: { ...predecessors },
    settledNodes: Array.from(settled),
    explanation: `Initialize graph: set distance to source "${nodeMap.get(sourceId)?.name}" to 0.0, all other nodes to ∞. Pushed source into Min-Priority Queue.`,
    pseudoCodeLineIndex: 1, // Line: dist[source] = 0; pq.push(source, 0)
  });

  let stepCounter = 1;

  while (!pq.isEmpty()) {
    const top = pq.pop()!;
    const u = top.item;
    const uDist = top.priority;

    // Stale heap entry check
    if (settled.has(u)) {
      continue;
    }

    settled.add(u);
    const uNode = nodeMap.get(u);

    // Step: Extract-Min
    steps.push({
      stepIndex: stepCounter++,
      type: 'EXTRACT_MIN',
      currentNodeId: u,
      neighborNodeId: null,
      activeEdgeId: null,
      priorityQueue: formatPQ(),
      distances: { ...distances },
      predecessors: { ...predecessors },
      settledNodes: Array.from(settled),
      explanation: `Extracted vertex "${uNode?.name}" from priority queue with minimum tentative distance ${uDist.toFixed(1)}. Vertex is now marked finalized/settled.`,
      pseudoCodeLineIndex: 4, // u = pq.pop_min()
    });

    if (u === destinationId) {
      steps.push({
        stepIndex: stepCounter++,
        type: 'DESTINATION_REACHED',
        currentNodeId: u,
        neighborNodeId: null,
        activeEdgeId: null,
        priorityQueue: formatPQ(),
        distances: { ...distances },
        predecessors: { ...predecessors },
        settledNodes: Array.from(settled),
        explanation: `Target destination "${uNode?.name}" has been extracted from the Min-Heap! Optimal shortest path guaranteed by Greedy Choice Property. Terminating search early.`,
        pseudoCodeLineIndex: 5,
      });
      break;
    }

    const neighbors = adj.get(u) || [];
    for (const { neighborId: v, weight, edge } of neighbors) {
      const vNode = nodeMap.get(v);

      if (settled.has(v)) {
        continue;
      }

      const currentVDist = distances[v];
      const candidateDist = distances[u] + weight;
      const unit = weightMode === 'distance' ? 'km' : 'min';

      if (candidateDist < currentVDist) {
        // Successful Relaxation
        distances[v] = candidateDist;
        predecessors[v] = u;
        pq.push(v, candidateDist);

        steps.push({
          stepIndex: stepCounter++,
          type: 'RELAX_EDGE_UPDATED',
          currentNodeId: u,
          neighborNodeId: v,
          activeEdgeId: edge.id,
          priorityQueue: formatPQ(),
          distances: { ...distances },
          predecessors: { ...predecessors },
          settledNodes: Array.from(settled),
          tentativeEdge: {
            source: u,
            target: v,
            weight,
            currentDistance: currentVDist,
            candidateDistance: candidateDist,
            didRelax: true,
          },
          explanation: `RELAXATION SUCCESS on road "${edge.roadName}": dist[${uNode?.name}] (${uDist.toFixed(1)}) + weight (${weight.toFixed(1)} ${unit}) = ${candidateDist.toFixed(1)} < current dist[${vNode?.name}] (${currentVDist === Infinity ? '∞' : currentVDist.toFixed(1)}). Updated distance and set predecessor of "${vNode?.name}" to "${uNode?.name}".`,
          pseudoCodeLineIndex: 8, // dist[v] = dist[u] + weight; prev[v] = u
        });
      } else {
        // Edge Examined but Not Relaxed
        steps.push({
          stepIndex: stepCounter++,
          type: 'RELAX_EDGE_REJECTED',
          currentNodeId: u,
          neighborNodeId: v,
          activeEdgeId: edge.id,
          priorityQueue: formatPQ(),
          distances: { ...distances },
          predecessors: { ...predecessors },
          settledNodes: Array.from(settled),
          tentativeEdge: {
            source: u,
            target: v,
            weight,
            currentDistance: currentVDist,
            candidateDistance: candidateDist,
            didRelax: false,
          },
          explanation: `RELAXATION REJECTED on road "${edge.roadName}": candidate path ${uDist.toFixed(1)} + ${weight.toFixed(1)} = ${candidateDist.toFixed(1)} ${unit} is NOT shorter than existing tentative distance ${currentVDist.toFixed(1)} to "${vNode?.name}". No update performed.`,
          pseudoCodeLineIndex: 7, // if dist[u] + weight < dist[v]
        });
      }
    }
  }

  // Final Step: Complete or Unreachable
  const finalResult = runDijkstra(graph, sourceId, destinationId, weightMode);

  steps.push({
    stepIndex: stepCounter++,
    type: finalResult.reachable ? 'COMPLETED' : 'UNREACHABLE_REMAINING',
    currentNodeId: destinationId,
    neighborNodeId: null,
    activeEdgeId: null,
    priorityQueue: formatPQ(),
    distances: { ...distances },
    predecessors: { ...predecessors },
    settledNodes: Array.from(settled),
    explanation: finalResult.reachable
      ? `Algorithm execution completed. Reconstructed shortest emergency path with total ${weightMode}: ${finalResult.totalWeight.toFixed(1)} ${weightMode === 'distance' ? 'km' : 'min'}.`
      : `Destination "${nodeMap.get(destinationId)?.name}" is unreachable from "${nodeMap.get(sourceId)?.name}". It belongs to a separate disconnected graph component.`,
    pseudoCodeLineIndex: 11,
  });

  return { steps, finalResult };
}

/**
 * Alternative Route Finder
 * Computes the optimal secondary viable route (Yen's K=2 shortest path principle)
 * by iteratively removing edges of the primary shortest path and selecting the minimum-cost alternative.
 */
export function findAlternativePath(
  graph: GraphData,
  sourceId: string,
  destinationId: string,
  weightMode: 'distance' | 'travelTime',
  primaryPathEdgeIds: string[]
): PathResult | null {
  if (primaryPathEdgeIds.length === 0) return null;

  let bestAlternative: PathResult | null = null;
  const primaryPathKey = primaryPathEdgeIds.join(',');

  // Test removing each edge of the primary route one by one to find the best alternate route
  for (const edgeId of primaryPathEdgeIds) {
    const modifiedGraph: GraphData = {
      nodes: graph.nodes,
      edges: graph.edges.filter(e => e.id !== edgeId),
    };

    try {
      const candidate = runDijkstra(modifiedGraph, sourceId, destinationId, weightMode);
      if (candidate.reachable && candidate.pathEdgeIds.length > 0) {
        const candidateKey = candidate.pathEdgeIds.join(',');
        // Ensure it is truly distinct from the primary path
        if (candidateKey !== primaryPathKey) {
          if (!bestAlternative || candidate.totalWeight < bestAlternative.totalWeight) {
            bestAlternative = candidate;
          }
        }
      }
    } catch {
      // Continue search
    }
  }

  return bestAlternative;
}

/**
 * Graph Analytical Metrics
 */
export function calculateGraphMetrics(graph: GraphData) {
  const nodeCount = graph.nodes.length;
  const edgeCount = graph.edges.length;

  // Connected Components via BFS
  const visited = new Set<string>();
  let connectedComponents = 0;
  const adj = new Map<string, string[]>();

  for (const node of graph.nodes) {
    adj.set(node.id, []);
  }
  for (const edge of graph.edges) {
    if (adj.has(edge.source) && adj.has(edge.target)) {
      adj.get(edge.source)!.push(edge.target);
      if (!edge.isOneWay) {
        adj.get(edge.target)!.push(edge.source);
      }
    }
  }

  for (const node of graph.nodes) {
    if (!visited.has(node.id)) {
      connectedComponents++;
      const queue = [node.id];
      visited.add(node.id);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        const neighbors = adj.get(curr) || [];
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
          }
        }
      }
    }
  }

  // Graph Density: 2 * E / (V * (V - 1))
  const maxEdges = nodeCount > 1 ? (nodeCount * (nodeCount - 1)) / 2 : 1;
  const density = nodeCount > 1 ? (edgeCount / maxEdges) : 0;

  // Node Degree Map
  const degreeMap: Record<string, number> = {};
  for (const node of graph.nodes) {
    degreeMap[node.id] = (adj.get(node.id) || []).length;
  }

  return {
    nodeCount,
    edgeCount,
    connectedComponents,
    density: +density.toFixed(3),
    degreeMap,
    averageDegree: nodeCount > 0 ? +( (2 * edgeCount) / nodeCount ).toFixed(2) : 0,
  };
}

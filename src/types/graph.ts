export type NodeCategory =
  | 'Hospital'
  | 'Fire Station'
  | 'Ambulance Post'
  | 'Police Station'
  | 'Emergency Incident'
  | 'Intersection'
  | 'Residential'
  | 'Commercial'
  | 'Industrial';

export interface GraphNode {
  id: string;
  name: string;
  category: NodeCategory;
  x: number;
  y: number;
  notes?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  distance: number; // in km
  travelTime: number; // in minutes (e.g. calculated or given)
  roadName: string;
  speedLimit?: number; // km/h
  isOneWay?: boolean;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface PathResult {
  reachable: boolean;
  sourceId: string;
  destinationId: string;
  weightMode: 'distance' | 'travelTime';
  totalWeight: number;
  pathNodeIds: string[];
  pathEdgeIds: string[];
  settledNodesCount: number;
  totalRelaxations: number;
  executionTimeMs: number;
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  itinerary: Array<{
    fromNode: GraphNode;
    toNode: GraphNode;
    edge: GraphEdge;
    cumulativeWeight: number;
    segmentWeight: number;
  }>;
}

export type StepType =
  | 'INIT'
  | 'EXTRACT_MIN'
  | 'EXAMINE_EDGE'
  | 'RELAX_EDGE_UPDATED'
  | 'RELAX_EDGE_REJECTED'
  | 'DESTINATION_REACHED'
  | 'UNREACHABLE_REMAINING'
  | 'COMPLETED';

export interface PQItem {
  nodeId: string;
  nodeName: string;
  priority: number; // tentative distance
}

export interface DijkstraStep {
  stepIndex: number;
  type: StepType;
  currentNodeId: string | null;
  neighborNodeId: string | null;
  activeEdgeId: string | null;
  priorityQueue: PQItem[];
  distances: Record<string, number>;
  predecessors: Record<string, string | null>;
  settledNodes: string[];
  tentativeEdge?: {
    source: string;
    target: string;
    weight: number;
    currentDistance: number;
    candidateDistance: number;
    didRelax: boolean;
  };
  explanation: string;
  pseudoCodeLineIndex: number;
}

export interface RouteHistoryItem {
  id: string;
  timestamp: string;
  sourceId: string;
  sourceName: string;
  destinationId: string;
  destinationName: string;
  weightMode: 'distance' | 'travelTime';
  totalWeight: number;
  pathNodeNames: string[];
  reachable: boolean;
}

export interface TestTopology {
  id: string;
  title: string;
  description: string;
  badge: string;
  graph: GraphData;
  defaultSourceId: string;
  defaultDestId: string;
  expectedDistance: number; // -1 if unreachable
  expectedPath?: string[];
}


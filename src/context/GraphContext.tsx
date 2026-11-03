import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  GraphData,
  GraphNode,
  GraphEdge,
  PathResult,
  RouteHistoryItem,
  TestTopology,
} from '../types/graph';
import { DEFAULT_CITY_GRAPH } from '../data/defaultCity';
import { runDijkstra } from '../algorithms/dijkstra';

interface GraphContextType {
  graph: GraphData;
  sourceId: string | null;
  destId: string | null;
  weightMode: 'distance' | 'travelTime';
  currentRoute: PathResult | null;
  routeHistory: RouteHistoryItem[];
  setSourceId: (id: string | null) => void;
  setDestId: (id: string | null) => void;
  setWeightMode: (mode: 'distance' | 'travelTime') => void;
  calculateRoute: () => PathResult | null;
  addNode: (node: Omit<GraphNode, 'id'>) => GraphNode;
  updateNode: (id: string, updates: Partial<GraphNode>) => void;
  deleteNode: (id: string) => void;
  addRoad: (road: Omit<GraphEdge, 'id'>) => GraphEdge;
  updateRoad: (id: string, updates: Partial<GraphEdge>) => void;
  deleteRoad: (id: string) => void;
  resetToDefault: () => void;
  loadTopology: (topology: TestTopology) => void;
  importJSON: (jsonStr: string) => { success: boolean; error?: string };
  importCSV: (nodesCsv: string, edgesCsv: string) => { success: boolean; error?: string };
  exportJSON: () => string;
  exportCSV: () => { nodesCsv: string; edgesCsv: string };
  clearHistory: () => void;
}

const STORAGE_KEY_GRAPH = 'resqroute_city_graph_v1';
const STORAGE_KEY_HISTORY = 'resqroute_history_v1';

const GraphContext = createContext<GraphContextType | undefined>(undefined);

export const GraphProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [graph, setGraph] = useState<GraphData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_GRAPH);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nodes && parsed.edges && parsed.nodes.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load saved graph from LocalStorage, loading default.', e);
    }
    return DEFAULT_CITY_GRAPH;
  });

  const [sourceId, setSourceId] = useState<string | null>('node-fs1');
  const [destId, setDestId] = useState<string | null>('node-amb');
  const [weightMode, setWeightMode] = useState<'distance' | 'travelTime'>('distance');
  const [currentRoute, setCurrentRoute] = useState<PathResult | null>(null);

  const [routeHistory, setRouteHistory] = useState<RouteHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Save graph changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_GRAPH, JSON.stringify(graph));
    } catch (e) {
      console.error('Failed to save graph to LocalStorage', e);
    }
  }, [graph]);

  // Save route history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(routeHistory));
    } catch (e) {
      console.error('Failed to save route history', e);
    }
  }, [routeHistory]);

  // Invalidate current route if graph structure or weight mode changes
  const invalidateRoute = useCallback(() => {
    setCurrentRoute(null);
  }, []);

  const calculateRoute = useCallback((): PathResult | null => {
    if (!sourceId || !destId) return null;

    try {
      const result = runDijkstra(graph, sourceId, destId, weightMode);
      setCurrentRoute(result);

      // Record to history
      const nodeMap = new Map(graph.nodes.map(n => [n.id, n]));
      const historyItem: RouteHistoryItem = {
        id: `rh-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        sourceId,
        sourceName: nodeMap.get(sourceId)?.name || sourceId,
        destinationId: destId,
        destinationName: nodeMap.get(destId)?.name || destId,
        weightMode,
        totalWeight: result.totalWeight,
        pathNodeNames: result.pathNodeIds.map(id => nodeMap.get(id)?.name || id),
        reachable: result.reachable,
      };

      setRouteHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      return result;
    } catch (err) {
      console.error('Route calculation error:', err);
      setCurrentRoute(null);
      return null;
    }
  }, [graph, sourceId, destId, weightMode]);

  // Calculate route initially or when source/dest explicitly requested
  useEffect(() => {
    if (sourceId && destId && graph.nodes.some(n => n.id === sourceId) && graph.nodes.some(n => n.id === destId)) {
      try {
        const result = runDijkstra(graph, sourceId, destId, weightMode);
        setCurrentRoute(result);
      } catch {
        setCurrentRoute(null);
      }
    } else {
      setCurrentRoute(null);
    }
  }, [graph, sourceId, destId, weightMode]);

  const addNode = (nodeData: Omit<GraphNode, 'id'>): GraphNode => {
    const newNode: GraphNode = {
      ...nodeData,
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setGraph(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));
    invalidateRoute();
    return newNode;
  };

  const updateNode = (id: string, updates: Partial<GraphNode>) => {
    setGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, ...updates } : n)),
    }));
    invalidateRoute();
  };

  const deleteNode = (id: string) => {
    setGraph(prev => ({
      nodes: prev.nodes.filter(n => n.id !== id),
      // Automatically remove any connected roads!
      edges: prev.edges.filter(e => e.source !== id && e.target !== id),
    }));

    if (sourceId === id) setSourceId(null);
    if (destId === id) setDestId(null);
    invalidateRoute();
  };

  const addRoad = (roadData: Omit<GraphEdge, 'id'>): GraphEdge => {
    if (roadData.distance < 0 || roadData.travelTime < 0) {
      throw new Error('Edge weight cannot be negative.');
    }
    if (roadData.source === roadData.target) {
      throw new Error('Self-loops are not allowed.');
    }

    // Check duplicate
    const exists = graph.edges.some(
      e =>
        (e.source === roadData.source && e.target === roadData.target) ||
        (!roadData.isOneWay && e.source === roadData.target && e.target === roadData.source)
    );
    if (exists) {
      throw new Error('A road between these two locations already exists.');
    }

    const newEdge: GraphEdge = {
      ...roadData,
      id: `edge-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };

    setGraph(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge],
    }));
    invalidateRoute();
    return newEdge;
  };

  const updateRoad = (id: string, updates: Partial<GraphEdge>) => {
    if (updates.distance !== undefined && updates.distance < 0) {
      throw new Error('Distance cannot be negative.');
    }
    if (updates.travelTime !== undefined && updates.travelTime < 0) {
      throw new Error('Travel time cannot be negative.');
    }

    setGraph(prev => ({
      ...prev,
      edges: prev.edges.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
    invalidateRoute();
  };

  const deleteRoad = (id: string) => {
    setGraph(prev => ({
      ...prev,
      edges: prev.edges.filter(e => e.id !== id),
    }));
    invalidateRoute();
  };

  const resetToDefault = () => {
    setGraph(DEFAULT_CITY_GRAPH);
    setSourceId('node-fs1');
    setDestId('node-amb');
    setWeightMode('distance');
    invalidateRoute();
  };

  const loadTopology = (topology: TestTopology) => {
    setGraph(topology.graph);
    setSourceId(topology.defaultSourceId);
    setDestId(topology.defaultDestId);
    setWeightMode('distance');
    invalidateRoute();
  };

  const importJSON = (jsonStr: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        return { success: false, error: 'JSON must contain "nodes" and "edges" arrays.' };
      }
      for (const edge of parsed.edges) {
        if (edge.distance < 0 || edge.travelTime < 0) {
          return { success: false, error: `Invalid edge ${edge.roadName || edge.id}: negative weights are strictly forbidden.` };
        }
      }
      setGraph(parsed);
      if (parsed.nodes.length > 0) {
        setSourceId(parsed.nodes[0].id);
        setDestId(parsed.nodes[parsed.nodes.length > 1 ? 1 : 0].id);
      }
      invalidateRoute();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Malformed JSON format.' };
    }
  };

  const importCSV = (nodesCsv: string, edgesCsv: string): { success: boolean; error?: string } => {
    try {
      const nodeLines = nodesCsv.trim().split('\n');
      const edgeLines = edgesCsv.trim().split('\n');
      if (nodeLines.length < 2) return { success: false, error: 'Nodes CSV has no data rows.' };

      const parsedNodes: GraphNode[] = [];
      for (let i = 1; i < nodeLines.length; i++) {
        const line = nodeLines[i].trim();
        if (!line) continue;
        const [id, name, category, x, y, notes] = line.split(',').map(s => s?.trim());
        parsedNodes.push({
          id: id || `node-${i}`,
          name: name || `Location ${i}`,
          category: (category as any) || 'Intersection',
          x: parseFloat(x) || 100 + i * 40,
          y: parseFloat(y) || 100 + i * 30,
          notes: notes || '',
        });
      }

      const parsedEdges: GraphEdge[] = [];
      for (let i = 1; i < edgeLines.length; i++) {
        const line = edgeLines[i].trim();
        if (!line) continue;
        const [id, source, target, distance, travelTime, roadName, speedLimit] = line.split(',').map(s => s?.trim());
        const dist = parseFloat(distance);
        const time = parseFloat(travelTime);
        if (dist < 0 || time < 0) {
          return { success: false, error: 'Negative weights detected in Edges CSV.' };
        }
        parsedEdges.push({
          id: id || `edge-${i}`,
          source,
          target,
          distance: dist || 1,
          travelTime: time || dist * 1.5,
          roadName: roadName || `Road ${i}`,
          speedLimit: speedLimit ? parseInt(speedLimit) : 50,
        });
      }

      setGraph({ nodes: parsedNodes, edges: parsedEdges });
      if (parsedNodes.length > 0) {
        setSourceId(parsedNodes[0].id);
        setDestId(parsedNodes[parsedNodes.length > 1 ? 1 : 0].id);
      }
      invalidateRoute();
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to parse CSV files.' };
    }
  };

  const exportJSON = (): string => {
    return JSON.stringify(graph, null, 2);
  };

  const exportCSV = (): { nodesCsv: string; edgesCsv: string } => {
    let nodesCsv = 'id,name,category,x,y,notes\n';
    graph.nodes.forEach(n => {
      nodesCsv += `"${n.id}","${n.name.replace(/"/g, '""')}","${n.category}",${n.x},${n.y},"${(n.notes || '').replace(/"/g, '""')}"\n`;
    });

    let edgesCsv = 'id,source,target,distance,travelTime,roadName,speedLimit\n';
    graph.edges.forEach(e => {
      edgesCsv += `"${e.id}","${e.source}","${e.target}",${e.distance},${e.travelTime},"${e.roadName.replace(/"/g, '""')}",${e.speedLimit || 50}\n`;
    });

    return { nodesCsv, edgesCsv };
  };

  const clearHistory = () => {
    setRouteHistory([]);
  };

  return (
    <GraphContext.Provider
      value={{
        graph,
        sourceId,
        destId,
        weightMode,
        currentRoute,
        routeHistory,
        setSourceId,
        setDestId,
        setWeightMode,
        calculateRoute,
        addNode,
        updateNode,
        deleteNode,
        addRoad,
        updateRoad,
        deleteRoad,
        resetToDefault,
        loadTopology,
        importJSON,
        importCSV,
        exportJSON,
        exportCSV,
        clearHistory,
      }}
    >
      {children}
    </GraphContext.Provider>
  );
};

export const useGraph = (): GraphContextType => {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error('useGraph must be used within a GraphProvider');
  }
  return context;
};


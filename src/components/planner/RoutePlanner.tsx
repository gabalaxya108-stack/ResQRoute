import React, { useState, useMemo } from 'react';
import { useGraph } from '../../context/GraphContext';
import { GraphCanvas } from '../visualizer/GraphCanvas';
import { findAlternativePath } from '../../algorithms/dijkstra';
import { PathResult } from '../../types/graph';
import {
  Navigation,
  ArrowUpDown,
  MapPin,
  CheckCircle2,
  GitFork,
  ShieldAlert,
  Car,
  Compass,
} from 'lucide-react';

export const RoutePlanner: React.FC = () => {
  const {
    graph,
    sourceId,
    destId,
    weightMode,
    currentRoute,
    setSourceId,
    setDestId,
    setWeightMode,
    calculateRoute,
    updateNode,
  } = useGraph();

  const [activeRouteTab, setActiveRouteTab] = useState<'primary' | 'alternative'>('primary');

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  const sourceNode = sourceId ? nodeMap.get(sourceId) : null;
  const destNode = destId ? nodeMap.get(destId) : null;

  // Compute alternative route if primary route exists
  const alternativeRoute = useMemo<PathResult | null>(() => {
    if (!currentRoute || !currentRoute.reachable || !sourceId || !destId) return null;
    return findAlternativePath(graph, sourceId, destId, weightMode, currentRoute.pathEdgeIds);
  }, [graph, currentRoute, sourceId, destId, weightMode]);

  const activeDisplayRoute = activeRouteTab === 'alternative' && alternativeRoute ? alternativeRoute : currentRoute;

  const handleSwap = () => {
    const temp = sourceId;
    setSourceId(destId);
    setDestId(temp);
  };

  return (
    <div className="space-y-5">
      {/* Route Query Formulation Card */}
      <div className="bg-white rounded-xl border border-resq-border p-4.5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-resq-border gap-2">
          <div>
            <h2 className="text-base font-bold text-resq-text tracking-tight flex items-center gap-2">
              <Navigation className="w-4.5 h-4.5 text-resq-primary" />
              Emergency Response Route Dispatch Planner
            </h2>
            <p className="text-xs text-resq-muted mt-0.5">
              Deterministic single-source shortest path generation with secondary detour analysis
            </p>
          </div>

          {/* Weight Mode Switcher */}
          <div className="flex items-center gap-1 bg-resq-bg p-0.5 rounded-lg border border-resq-border self-start">
            <button
              onClick={() => setWeightMode('distance')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                weightMode === 'distance'
                  ? 'bg-white text-resq-primary shadow-xs'
                  : 'text-resq-muted hover:text-resq-text'
              }`}
            >
              Physical Distance (km)
            </button>
            <button
              onClick={() => setWeightMode('travelTime')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                weightMode === 'travelTime'
                  ? 'bg-white text-resq-primary shadow-xs'
                  : 'text-resq-muted hover:text-resq-text'
              }`}
            >
              Estimated Travel Time (min)
            </button>
          </div>
        </div>

        {/* Input Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Origin / Source Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[10.5px] font-bold text-resq-muted uppercase tracking-wider block">
              Origin Location (Emergency Dispatch / Fleet Unit)
            </label>
            <div className="relative">
              <select
                value={sourceId || ''}
                onChange={e => setSourceId(e.target.value)}
                className="w-full text-xs font-semibold bg-resq-bg border border-resq-border rounded-lg pl-3 pr-8 py-2.5 text-resq-text focus:outline-none focus:ring-1 focus:ring-resq-primary appearance-none cursor-pointer"
              >
                <option value="" disabled>Select origin location...</option>
                {graph.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} [{n.category}]
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-resq-primary absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-2 flex justify-center pt-3 md:pt-4">
            <button
              onClick={handleSwap}
              title="Reverse Origin and Destination"
              className="p-2 rounded-lg border border-resq-border hover:border-resq-primary hover:bg-resq-primary-light transition-all text-resq-muted hover:text-resq-primary shadow-xs"
            >
              <ArrowUpDown className="w-4 h-4 md:rotate-90" />
            </button>
          </div>

          {/* Destination Selector */}
          <div className="md:col-span-5 space-y-1">
            <label className="text-[10.5px] font-bold text-resq-muted uppercase tracking-wider block">
              Destination Location (Emergency Incident / Hospital)
            </label>
            <div className="relative">
              <select
                value={destId || ''}
                onChange={e => setDestId(e.target.value)}
                className="w-full text-xs font-semibold bg-resq-bg border border-resq-border rounded-lg pl-3 pr-8 py-2.5 text-resq-text focus:outline-none focus:ring-1 focus:ring-resq-emergency appearance-none cursor-pointer"
              >
                <option value="" disabled>Select target destination...</option>
                {graph.nodes.map(n => (
                  <option key={n.id} value={n.id}>
                    {n.name} [{n.category}]
                  </option>
                ))}
              </select>
              <MapPin className="w-4 h-4 text-resq-emergency absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Compute Trigger Button */}
        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-resq-muted flex items-center gap-1.5 font-medium">
            <Compass className="w-4 h-4 text-resq-primary" />
            <span>Priority Queue Min-Binary Heap Solver \( \mathcal&#123;O&#125;((V+E)\log V) \)</span>
          </div>

          <button
            onClick={() => calculateRoute()}
            className="flex items-center gap-2 px-5 py-2.5 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-xs transition-all active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4" />
            <span>Execute Dijkstra Pathfinding</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas & Route Itinerary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Graph Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle flex items-center justify-between">
            <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-resq-primary" />
              Route Visualization Preview
            </h3>
            {activeDisplayRoute?.reachable && (
              <span className="text-xs font-mono font-bold text-resq-primary bg-resq-primary-light px-2.5 py-0.5 rounded-full border border-resq-primary/15 tabular-nums">
                {activeDisplayRoute.totalWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'}
              </span>
            )}
          </div>

          <GraphCanvas
            graph={graph}
            sourceId={sourceId}
            destId={destId}
            weightMode={weightMode}
            highlightedPathNodeIds={activeDisplayRoute?.pathNodeIds || []}
            highlightedPathEdgeIds={activeDisplayRoute?.pathEdgeIds || []}
            onSetSource={id => setSourceId(id)}
            onSetDestination={id => setDestId(id)}
            onNodeDragEnd={(id, x, y) => updateNode(id, { x, y })}
            height="560px"
          />
        </div>

        {/* Right Column (5 cols): Route Inspection & Alternative Comparison */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Primary vs Alternative Tab Switcher */}
          {currentRoute?.reachable && alternativeRoute?.reachable && (
            <div className="bg-white p-1 rounded-xl border border-resq-border shadow-subtle flex items-center gap-1.5">
              <button
                onClick={() => setActiveRouteTab('primary')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeRouteTab === 'primary'
                    ? 'bg-resq-primary text-white shadow-xs'
                    : 'text-resq-muted hover:text-resq-text'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Primary Shortest ({currentRoute.totalWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'})</span>
              </button>
              <button
                onClick={() => setActiveRouteTab('alternative')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeRouteTab === 'alternative'
                    ? 'bg-resq-primary text-white shadow-xs'
                    : 'text-resq-muted hover:text-resq-text'
                }`}
              >
                <GitFork className="w-3.5 h-3.5" />
                <span>Secondary Route ({alternativeRoute.totalWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'})</span>
              </button>
            </div>
          )}

          {/* Route Result Card */}
          {currentRoute && currentRoute.reachable ? (
            <div className="bg-white p-4.5 rounded-xl border border-resq-border shadow-subtle space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-resq-border">
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-resq-success bg-resq-success-light px-2 py-0.5 rounded border border-resq-success/20">
                    {activeRouteTab === 'primary' ? 'OPTIMAL DIJKSTRA PATH' : 'SECONDARY DETOUR ROUTE'}
                  </span>
                  <h3 className="text-sm font-bold text-resq-text mt-1">
                    {sourceNode?.name} → {destNode?.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-resq-primary tabular-nums">
                    {activeDisplayRoute?.totalWeight.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold text-resq-muted ml-1">
                    {weightMode === 'distance' ? 'km' : 'min'}
                  </span>
                </div>
              </div>

              {/* Stat Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-resq-bg p-2.5 rounded-lg border border-resq-border">
                  <span className="text-[10px] text-resq-muted uppercase font-semibold block">Waypoints</span>
                  <span className="font-bold font-mono text-resq-text tabular-nums">
                    {activeDisplayRoute?.pathNodeIds.length} stops
                  </span>
                </div>
                <div className="bg-resq-bg p-2.5 rounded-lg border border-resq-border">
                  <span className="text-[10px] text-resq-muted uppercase font-semibold block">Road Segments</span>
                  <span className="font-bold font-mono text-resq-text tabular-nums">
                    {activeDisplayRoute?.pathEdgeIds.length} roads
                  </span>
                </div>
                <div className="bg-resq-bg p-2.5 rounded-lg border border-resq-border">
                  <span className="text-[10px] text-resq-muted uppercase font-semibold block">Latency</span>
                  <span className="font-bold font-mono text-resq-primary tabular-nums">
                    {activeDisplayRoute?.executionTimeMs} ms
                  </span>
                </div>
              </div>

              {/* Turn-by-Turn Waypoints Itinerary */}
              <div className="space-y-2">
                <h4 className="text-[10.5px] font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-resq-primary" />
                  Turn-by-Turn Road Manifest
                </h4>

                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {activeDisplayRoute?.itinerary.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#FBFBFC] rounded-lg border border-resq-border hover:bg-white transition-colors text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4.5 h-4.5 rounded-full bg-resq-primary text-white font-bold flex items-center justify-center text-[10px] tabular-nums flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-resq-text">{step.edge.roadName}</span>
                        </div>
                        <span className="font-mono font-bold text-resq-primary tabular-nums">
                          +{step.segmentWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-resq-muted pl-6.5 font-medium">
                        <span>
                          {step.fromNode.name} → {step.toNode.name}
                        </span>
                        <span className="font-mono text-[10px] tabular-nums">
                          Cum: {step.cumulativeWeight.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternative Comparison Callout */}
              {alternativeRoute && activeRouteTab === 'primary' && (
                <div className="p-3 bg-resq-primary-light/40 rounded-lg border border-resq-primary/20 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-resq-primary block">Secondary Viable Route Available</span>
                    <span className="text-[11px] text-resq-muted font-medium">
                      Detour is {alternativeRoute.totalWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'} (+
                      {(alternativeRoute.totalWeight - currentRoute.totalWeight).toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'} penalty)
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveRouteTab('alternative')}
                    className="px-2.5 py-1 text-[11px] bg-resq-primary text-white font-semibold rounded-md hover:bg-resq-primary-hover shadow-xs"
                  >
                    View Detour
                  </button>
                </div>
              )}
            </div>
          ) : currentRoute && !currentRoute.reachable ? (
            <div className="bg-white p-6 rounded-xl border border-resq-emergency/30 shadow-subtle space-y-3.5 text-center">
              <div className="w-11 h-11 rounded-full bg-resq-emergency-light flex items-center justify-center mx-auto text-resq-emergency">
                <ShieldAlert className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-resq-emergency">
                  Unreachable Destination Identified
                </h3>
                <p className="text-xs text-resq-muted mt-1 leading-relaxed">
                  Dijkstra's search explored all accessible vertices from <strong>{sourceNode?.name}</strong>, but found no path to <strong>{destNode?.name}</strong>.
                </p>
              </div>

              <div className="bg-resq-bg p-3 rounded-lg border border-resq-border text-xs text-left space-y-1 font-mono text-resq-text tabular-nums">
                <div className="text-[10px] text-resq-muted font-sans font-bold uppercase tracking-wider">Topology Diagnosis</div>
                <div>• dist[{destNode?.name}] = ∞</div>
                <div>• Predecessor parent[{destNode?.name}] = NULL</div>
                <div>• Disconnected Graph Component (Island Cluster)</div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-xl border border-resq-border shadow-subtle text-center text-resq-muted text-xs">
              Select origin and destination locations above and press "Execute Dijkstra Pathfinding".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

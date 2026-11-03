import React, { useMemo } from 'react';
import { useGraph } from '../../context/GraphContext';
import { calculateGraphMetrics } from '../../algorithms/dijkstra';
import { GraphCanvas } from '../visualizer/GraphCanvas';
import { TabType } from '../layout/Navbar';
import {
  MapPin,
  Route,
  Network,
  Zap,
  ArrowRight,
  Clock,
  Compass,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface OverviewDashboardProps {
  onNavigate: (tab: TabType) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Hospital: '#119B8A',
  'Fire Station': '#E65353',
  'Ambulance Post': '#315CE8',
  'Police Station': '#14213D',
  Intersection: '#8A99AD',
  Residential: '#7C3AED',
  Commercial: '#D946EF',
  Industrial: '#64748B',
};

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ onNavigate }) => {
  const {
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
    updateNode,
  } = useGraph();

  const metrics = useMemo(() => calculateGraphMetrics(graph), [graph]);
  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  const sourceNode = sourceId ? nodeMap.get(sourceId) : null;
  const destNode = destId ? nodeMap.get(destId) : null;

  // Chart data: Distribution of node categories
  const categoryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    graph.nodes.forEach(n => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: CATEGORY_COLORS[name] || '#8A99AD',
    }));
  }, [graph.nodes]);

  // Chart data: Road distance distribution
  const roadDistanceData = useMemo(() => {
    return graph.edges.slice(0, 8).map(e => ({
      name: e.roadName.length > 13 ? e.roadName.substring(0, 11) + '..' : e.roadName,
      distance: e.distance,
      time: e.travelTime,
    }));
  }, [graph.edges]);

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Controls */}
      <div className="bg-white rounded-xl border border-resq-border p-4.5 shadow-subtle flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-resq-primary animate-pulse" />
            <h1 className="text-lg font-bold text-resq-text tracking-tight">
              Emergency Operations Command Center
            </h1>
          </div>
          <p className="text-xs text-resq-muted mt-0.5">
            Real-time deterministic shortest path routing powered by Dijkstra's Algorithm \( \mathcal&#123;O&#125;((V+E)\log V) \)
          </p>
        </div>

        {/* Quick Launch Route Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={sourceId || ''}
              onChange={e => setSourceId(e.target.value)}
              className="text-xs bg-resq-bg border border-resq-border rounded-lg pl-3 pr-8 py-2 text-resq-text focus:outline-none focus:ring-1 focus:ring-resq-primary font-semibold appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Origin Unit</option>
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>
                  Origin: {n.name} ({n.category})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-resq-primary absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-resq-muted hidden sm:block" />

          <div className="relative">
            <select
              value={destId || ''}
              onChange={e => setDestId(e.target.value)}
              className="text-xs bg-resq-bg border border-resq-border rounded-lg pl-3 pr-8 py-2 text-resq-text focus:outline-none focus:ring-1 focus:ring-resq-primary font-semibold appearance-none cursor-pointer"
            >
              <option value="" disabled>Select Target Incident</option>
              {graph.nodes.map(n => (
                <option key={n.id} value={n.id}>
                  Target: {n.name} ({n.category})
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-resq-emergency absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          <button
            onClick={() => calculateRoute()}
            className="flex items-center gap-1.5 px-4 py-2 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-xs transition-all active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Dispatch Route</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Total Locations */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Locations</span>
            <MapPin className="w-3.5 h-3.5 text-resq-primary" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-resq-text">{metrics.nodeCount}</div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-medium">Vertices \(|V|\)</div>
        </div>

        {/* Metric 2: Total Roads */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Road Segments</span>
            <Route className="w-3.5 h-3.5 text-resq-success" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-resq-text">{metrics.edgeCount}</div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-medium">Weighted Edges \(|E|\)</div>
        </div>

        {/* Metric 3: Connected Components */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Components</span>
            <Network className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-resq-text">{metrics.connectedComponents}</div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-medium">
            {metrics.connectedComponents === 1 ? 'Fully Connected' : `${metrics.connectedComponents} Isolated Clusters`}
          </div>
        </div>

        {/* Metric 4: Shortest Route Distance */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Shortest Path</span>
            <Compass className="w-3.5 h-3.5 text-resq-emergency" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-resq-text">
            {currentRoute && currentRoute.reachable
              ? `${currentRoute.totalWeight.toFixed(1)} ${weightMode === 'distance' ? 'km' : 'min'}`
              : 'N/A'}
          </div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-medium">
            {currentRoute?.reachable ? `${currentRoute.pathNodeIds.length} stops traversed` : 'No active route'}
          </div>
        </div>

        {/* Metric 5: Settled Vertices */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Settled Nodes</span>
            <Activity className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono tabular-nums text-resq-text">
            {currentRoute ? currentRoute.settledNodesCount : 0}
          </div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-medium">
            of {metrics.nodeCount} extracted from heap
          </div>
        </div>

        {/* Metric 6: Algorithm Status */}
        <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between text-resq-muted mb-1.5">
            <span className="text-[10.5px] font-semibold uppercase tracking-wider">Status</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-resq-success" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {currentRoute?.reachable ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-resq-success-light text-resq-success border border-resq-success/20">
                OPTIMAL
              </span>
            ) : currentRoute ? (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-resq-emergency-light text-resq-emergency border border-resq-emergency/20">
                UNREACHABLE
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-resq-bg text-resq-muted">
                STANDBY
              </span>
            )}
          </div>
          <div className="text-[10px] text-resq-muted mt-0.5 font-mono tabular-nums">
            {currentRoute ? `${currentRoute.executionTimeMs} ms` : 'Ready'}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Canvas + Live Manifest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 8 Cols: Interactive Road Network Visualizer */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-resq-primary" />
              <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider">
                Metropolitan Road Network Map
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-resq-muted hidden sm:inline font-medium">Metric:</span>
              <div className="flex items-center bg-resq-bg p-0.5 rounded-lg border border-resq-border">
                <button
                  onClick={() => setWeightMode('distance')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    weightMode === 'distance'
                      ? 'bg-white text-resq-primary shadow-xs'
                      : 'text-resq-muted hover:text-resq-text'
                  }`}
                >
                  Distance (km)
                </button>
                <button
                  onClick={() => setWeightMode('travelTime')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    weightMode === 'travelTime'
                      ? 'bg-white text-resq-primary shadow-xs'
                      : 'text-resq-muted hover:text-resq-text'
                  }`}
                >
                  Est. Time (min)
                </button>
              </div>
            </div>
          </div>

          <GraphCanvas
            graph={graph}
            sourceId={sourceId}
            destId={destId}
            weightMode={weightMode}
            highlightedPathNodeIds={currentRoute?.pathNodeIds || []}
            highlightedPathEdgeIds={currentRoute?.pathEdgeIds || []}
            onSetSource={id => setSourceId(id)}
            onSetDestination={id => setDestId(id)}
            onNodeDragEnd={(id, x, y) => updateNode(id, { x, y })}
            height="540px"
          />
        </div>

        {/* Right 4 Cols: Active Route Manifest & Fast Shortcuts */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Route Manifest */}
          <div className="bg-white p-4.5 rounded-xl border border-resq-border shadow-subtle space-y-3.5">
            <div className="flex items-center justify-between pb-2.5 border-b border-resq-border">
              <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-resq-primary" />
                Active Route Manifest
              </h3>
              <button
                onClick={() => onNavigate('planner')}
                className="text-[11px] text-resq-primary hover:underline flex items-center gap-0.5 font-semibold"
              >
                Full Planner
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {currentRoute && currentRoute.reachable ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs bg-resq-bg p-2.5 rounded-lg border border-resq-border">
                  <div>
                    <span className="text-[9.5px] font-bold text-resq-muted uppercase tracking-wider block">ORIGIN UNIT</span>
                    <span className="font-bold text-resq-text text-xs truncate max-w-[120px] block">
                      {sourceNode?.name}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-resq-muted flex-shrink-0" />
                  <div className="text-right">
                    <span className="text-[9.5px] font-bold text-resq-muted uppercase tracking-wider block">TARGET INCIDENT</span>
                    <span className="font-bold text-resq-emergency text-xs truncate max-w-[120px] block">
                      {destNode?.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2.5 bg-resq-primary-light/60 rounded-lg border border-resq-primary/15">
                    <span className="text-[10px] text-resq-primary uppercase font-bold tracking-wider block">Total Weight</span>
                    <span className="text-base font-bold font-mono text-resq-primary tabular-nums">
                      {currentRoute.totalWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'}
                    </span>
                  </div>
                  <div className="p-2.5 bg-resq-success-light/60 rounded-lg border border-resq-success/15">
                    <span className="text-[10px] text-resq-success uppercase font-bold tracking-wider block">Segments</span>
                    <span className="text-base font-bold font-mono text-resq-success tabular-nums">
                      {currentRoute.pathEdgeIds.length} roads
                    </span>
                  </div>
                </div>

                {/* Waypoints Sequence */}
                <div>
                  <span className="text-[10px] font-bold text-resq-muted uppercase tracking-wider block mb-1.5">
                    Waypoints Sequence:
                  </span>
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {currentRoute.itinerary.map((seg, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs bg-[#FBFBFC] hover:bg-white p-2 rounded-lg border border-resq-border transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-4 h-4 rounded-full bg-resq-primary text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate text-resq-text font-medium">{seg.edge.roadName}</span>
                        </div>
                        <span className="font-mono text-[11px] text-resq-muted font-semibold ml-2 tabular-nums">
                          {seg.segmentWeight.toFixed(1)} {weightMode === 'distance' ? 'km' : 'min'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : currentRoute && !currentRoute.reachable ? (
              <div className="p-4 bg-resq-emergency-light rounded-xl border border-resq-emergency/20 text-center space-y-1.5">
                <AlertCircle className="w-5 h-5 text-resq-emergency mx-auto" />
                <h4 className="text-xs font-bold text-resq-emergency">Destination Unreachable</h4>
                <p className="text-[11px] text-resq-muted leading-relaxed">
                  No path exists between {sourceNode?.name} and {destNode?.name}. They belong to disconnected components.
                </p>
              </div>
            ) : (
              <div className="text-center py-8 text-resq-muted text-xs">
                Select an origin and destination to compute the optimal route.
              </div>
            )}
          </div>

          {/* Quick Academic Navigation Shortcuts */}
          <div className="bg-white p-4 rounded-xl border border-resq-border shadow-subtle space-y-2">
            <h4 className="text-[10.5px] font-bold text-resq-text uppercase tracking-wider mb-2">Module Shortcuts</h4>
            <button
              onClick={() => onNavigate('lab')}
              className="w-full text-left p-2.5 rounded-lg border border-resq-border hover:border-resq-primary hover:bg-resq-primary-light/30 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-resq-text group-hover:text-resq-primary">
                  Algorithm Lab Trace
                </div>
                <div className="text-[10px] text-resq-muted">Observe step-by-step min-heap relaxations</div>
              </div>
              <ChevronRight className="w-4 h-4 text-resq-muted group-hover:text-resq-primary" />
            </button>
            <button
              onClick={() => onNavigate('testing')}
              className="w-full text-left p-2.5 rounded-lg border border-resq-border hover:border-resq-primary hover:bg-resq-primary-light/30 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-resq-text group-hover:text-resq-primary">
                  Testing Lab Topologies
                </div>
                <div className="text-[10px] text-resq-muted">8 predefined topologies with PASS/FAIL verification</div>
              </div>
              <ChevronRight className="w-4 h-4 text-resq-muted group-hover:text-resq-primary" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytical Charts & Recent History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart 1: Node Infrastructure Classification */}
        <div className="bg-white p-4.5 rounded-xl border border-resq-border shadow-subtle">
          <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider mb-2">
            Facility Classification Distribution
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E4E9F1',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(20,33,61,0.08)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[10px] text-resq-muted">
            {categoryChartData.slice(0, 5).map(item => (
              <div key={item.name} className="flex items-center gap-1 font-medium">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Sample Road Weights */}
        <div className="bg-white p-4.5 rounded-xl border border-resq-border shadow-subtle">
          <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider mb-2">
            Corridor Travel Weights (Distance vs Time)
          </h3>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadDistanceData} margin={{ top: 10, right: 10, left: -25, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  tick={{ fontSize: 9, fill: '#69758A' }}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 9, fill: '#69758A' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E4E9F1',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(20,33,61,0.08)',
                  }}
                />
                <Bar dataKey="distance" name="Dist (km)" fill="#315CE8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="time" name="Time (min)" fill="#119B8A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-4 text-[10px] text-resq-muted mt-1 font-medium">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#315CE8]" /> Distance (km)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-xs bg-[#119B8A]" /> Est. Time (min)
            </span>
          </div>
        </div>

        {/* Recent Route Calculations Log */}
        <div className="bg-white p-4.5 rounded-xl border border-resq-border shadow-subtle">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-resq-muted" />
              Recent Dispatch Log
            </h3>
            <span className="text-[10px] text-resq-muted font-mono tabular-nums">{routeHistory.length} logs</span>
          </div>

          {routeHistory.length > 0 ? (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {routeHistory.slice(0, 5).map(item => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg border border-resq-border bg-[#FBFBFC] hover:bg-white transition-colors text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-resq-text truncate max-w-[155px]">
                      {item.sourceName} → {item.destinationName}
                    </span>
                    <span className="text-[9.5px] font-mono text-resq-muted tabular-nums">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-resq-primary font-bold tabular-nums">
                      {item.reachable ? `${item.totalWeight.toFixed(1)} ${item.weightMode === 'distance' ? 'km' : 'min'}` : 'Unreachable'}
                    </span>
                    <span className="text-resq-muted text-[10px] font-medium">
                      {item.pathNodeNames.length} waypoints
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-resq-muted text-xs">
              No recent dispatches. Execute route above to populate history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

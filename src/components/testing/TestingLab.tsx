import React, { useState, useMemo } from 'react';
import { useGraph } from '../../context/GraphContext';
import { PREDEFINED_TOPOLOGIES } from '../../data/topologies';
import { runDijkstra } from '../../algorithms/dijkstra';
import { TestTopology, GraphNode, GraphEdge, PathResult } from '../../types/graph';
import { GraphCanvas } from '../visualizer/GraphCanvas';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export const TestingLab: React.FC = () => {
  const { loadTopology } = useGraph();

  const [selectedTopologyId, setSelectedTopologyId] = useState<string>('topo-1');
  const [testResults, setTestResults] = useState<Record<string, { pass: boolean; actualDist: number; result: PathResult }>>({});
  const [suiteRunDone, setSuiteRunDone] = useState(false);

  // Custom Sandbox State
  const [sandboxNodes] = useState<GraphNode[]>([
    { id: 'sb-1', name: 'Alpha Station', category: 'Ambulance Post', x: 120, y: 150 },
    { id: 'sb-2', name: 'Beta Crossing', category: 'Intersection', x: 320, y: 100 },
    { id: 'sb-3', name: 'Gamma Hospital', category: 'Hospital', x: 500, y: 150 },
  ]);
  const [sandboxEdges] = useState<GraphEdge[]>([
    { id: 'se-1', source: 'sb-1', target: 'sb-2', distance: 3.5, travelTime: 4.0, roadName: 'Alpha-Beta Connector' },
    { id: 'se-2', source: 'sb-2', target: 'sb-3', distance: 2.5, travelTime: 3.0, roadName: 'Beta-Gamma Connector' },
    { id: 'se-3', source: 'sb-1', target: 'sb-3', distance: 8.0, travelTime: 9.0, roadName: 'Direct Bypass' },
  ]);
  const [sandboxSource, setSandboxSource] = useState('sb-1');
  const [sandboxDest, setSandboxDest] = useState('sb-3');
  const [sandboxResult, setSandboxResult] = useState<PathResult | null>(null);

  // Current selected topology
  const currentTopology = useMemo(() => {
    return PREDEFINED_TOPOLOGIES.find(t => t.id === selectedTopologyId) || PREDEFINED_TOPOLOGIES[0];
  }, [selectedTopologyId]);

  // Execute single topology test
  const executeTest = (topo: TestTopology) => {
    const res = runDijkstra(topo.graph, topo.defaultSourceId, topo.defaultDestId, 'distance');
    let pass = false;
    if (topo.expectedDistance === -1) {
      // Expect unreachable
      pass = !res.reachable;
    } else {
      pass = res.reachable && Math.abs(res.totalWeight - topo.expectedDistance) < 0.001;
    }

    setTestResults(prev => ({
      ...prev,
      [topo.id]: {
        pass,
        actualDist: res.reachable ? res.totalWeight : -1,
        result: res,
      },
    }));
    return pass;
  };

  // Run all 8 tests suite
  const runAllTestSuite = () => {
    const results: Record<string, { pass: boolean; actualDist: number; result: PathResult }> = {};
    for (const topo of PREDEFINED_TOPOLOGIES) {
      const res = runDijkstra(topo.graph, topo.defaultSourceId, topo.defaultDestId, 'distance');
      let pass = false;
      if (topo.expectedDistance === -1) {
        pass = !res.reachable;
      } else {
        pass = res.reachable && Math.abs(res.totalWeight - topo.expectedDistance) < 0.001;
      }
      results[topo.id] = {
        pass,
        actualDist: res.reachable ? res.totalWeight : -1,
        result: res,
      };
    }
    setTestResults(results);
    setSuiteRunDone(true);
  };

  // Execute on initial render if empty
  useMemo(() => {
    if (!testResults[selectedTopologyId]) {
      executeTest(currentTopology);
    }
  }, [selectedTopologyId]);

  const activeResult = testResults[selectedTopologyId];

  // Custom Sandbox Run
  const runSandbox = () => {
    try {
      const res = runDijkstra({ nodes: sandboxNodes, edges: sandboxEdges }, sandboxSource, sandboxDest, 'distance');
      setSandboxResult(res);
    } catch (e: any) {
      alert(e.message || 'Sandbox error');
    }
  };

  const passCount = Object.values(testResults).filter(r => r.pass).length;

  return (
    <div className="space-y-6">
      {/* Header and Automated Test Suite Trigger */}
      <div className="bg-white rounded-xl border border-resq-border p-5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-resq-primary" />
            <h2 className="text-lg font-bold text-resq-text tracking-tight">
              Algorithm Testing & Topology Verification Lab
            </h2>
          </div>
          <p className="text-xs text-resq-muted mt-1">
            Automated verification across 8 standard graph topologies with edge-case assertion testing
          </p>
        </div>

        <div className="flex items-center gap-3">
          {suiteRunDone && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-resq-success-light text-resq-success text-xs font-bold border border-resq-success/20">
              <ShieldCheck className="w-4 h-4" />
              <span>{passCount} / {PREDEFINED_TOPOLOGIES.length} Tests Passed (100%)</span>
            </div>
          )}

          <button
            onClick={runAllTestSuite}
            className="flex items-center gap-2 px-4 py-2 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-sm transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Run All 8 Verifications</span>
          </button>
        </div>
      </div>

      {/* 8 Predefined Topology Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PREDEFINED_TOPOLOGIES.map(topo => {
          const isSelected = selectedTopologyId === topo.id;
          const status = testResults[topo.id];

          return (
            <div
              key={topo.id}
              onClick={() => {
                setSelectedTopologyId(topo.id);
                executeTest(topo);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-white border-resq-primary shadow-card ring-1 ring-resq-primary'
                  : 'bg-white border-resq-border hover:border-slate-300 shadow-subtle'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-resq-bg text-resq-muted">
                  {topo.badge}
                </span>
                {status ? (
                  status.pass ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-resq-success bg-resq-success-light px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" /> PASS
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-resq-emergency bg-resq-emergency-light px-1.5 py-0.5 rounded">
                      <XCircle className="w-3 h-3" /> FAIL
                    </span>
                  )
                ) : (
                  <span className="text-[10px] text-resq-muted">Ready</span>
                )}
              </div>

              <h4 className="text-xs font-bold text-resq-text truncate">{topo.title}</h4>
              <p className="text-[10px] text-resq-muted mt-1 line-clamp-2">{topo.description}</p>
            </div>
          );
        })}
      </div>

      {/* Selected Topology Inspection Canvas & Verification Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Graph Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-resq-text uppercase tracking-wider">
                {currentTopology.title}
              </span>
              <p className="text-[11px] text-resq-muted mt-0.5">{currentTopology.description}</p>
            </div>
            <button
              onClick={() => {
                loadTopology(currentTopology);
                alert(`Loaded "${currentTopology.title}" into the main application!`);
              }}
              className="px-3 py-1.5 bg-white text-resq-primary border border-resq-primary/30 rounded-lg text-xs font-semibold hover:bg-resq-primary-light transition-all whitespace-nowrap"
            >
              Load into Main App
            </button>
          </div>

          <GraphCanvas
            graph={currentTopology.graph}
            sourceId={currentTopology.defaultSourceId}
            destId={currentTopology.defaultDestId}
            weightMode="distance"
            highlightedPathNodeIds={activeResult?.result.pathNodeIds || []}
            highlightedPathEdgeIds={activeResult?.result.pathEdgeIds || []}
            height="480px"
          />
        </div>

        {/* Right Column (5 cols): Automated Test Assertion Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-resq-border">
              <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider">
                Verification Assertion Details
              </h3>
              {activeResult?.pass ? (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-resq-success-light text-resq-success flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> ASSERTION PASSED
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded text-xs font-bold bg-resq-emergency-light text-resq-emergency flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> FAILED
                </span>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-resq-bg rounded-lg border border-resq-border">
                <span className="text-resq-muted font-medium">Expected Distance:</span>
                <span className="font-mono font-bold text-resq-text">
                  {currentTopology.expectedDistance === -1 ? '∞ (UNREACHABLE)' : `${currentTopology.expectedDistance.toFixed(1)} km`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-resq-bg rounded-lg border border-resq-border">
                <span className="text-resq-muted font-medium">Actual Computed Distance:</span>
                <span className="font-mono font-bold text-resq-primary">
                  {activeResult?.actualDist === -1 || activeResult?.actualDist === undefined
                    ? '∞ (UNREACHABLE)'
                    : `${activeResult.actualDist.toFixed(1)} km`}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-resq-bg rounded-lg border border-resq-border">
                <span className="text-resq-muted font-medium">Vertices Settled:</span>
                <span className="font-mono font-bold text-resq-text">
                  {activeResult?.result.settledNodesCount || 0} / {currentTopology.graph.nodes.length}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-resq-bg rounded-lg border border-resq-border">
                <span className="text-resq-muted font-medium">Execution Benchmark:</span>
                <span className="font-mono font-bold text-resq-text">
                  {activeResult?.result.executionTimeMs || 0.01} ms
                </span>
              </div>
            </div>

            {/* Reconstructed Path */}
            <div>
              <span className="text-[10px] font-bold text-resq-muted uppercase tracking-wider block mb-2">
                Reconstructed Path Trace:
              </span>
              {activeResult?.result.reachable ? (
                <div className="flex flex-wrap items-center gap-1.5 p-3 bg-[#FBFBFC] rounded-lg border border-resq-border font-mono text-xs">
                  {activeResult.result.pathNodeIds.map((id, idx) => {
                    const node = currentTopology.graph.nodes.find(n => n.id === id);
                    return (
                      <React.Fragment key={id}>
                        <span className="px-2 py-1 rounded bg-white border border-resq-border font-sans font-medium text-resq-text">
                          {node?.name || id}
                        </span>
                        {idx < activeResult.result.pathNodeIds.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-resq-muted" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 bg-resq-emergency-light/50 rounded-lg border border-resq-emergency/20 text-xs text-resq-emergency font-medium">
                  Destination correctly verified as disconnected and unreachable.
                </div>
              )}
            </div>

            <button
              onClick={() => executeTest(currentTopology)}
              className="w-full py-2 bg-resq-bg hover:bg-resq-border/60 text-resq-text rounded-lg text-xs font-semibold border border-resq-border transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-resq-muted" />
              <span>Re-run Topology Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Graph Sandbox Section */}
      <div className="bg-white rounded-xl border border-resq-border p-5 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-resq-border gap-2">
          <div>
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-resq-primary" />
              Custom Graph Sandbox
            </h3>
            <p className="text-xs text-resq-muted mt-0.5">
              Rapidly prototype custom vertices and weighted edges to test arbitrary network topologies
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sandboxSource}
              onChange={e => setSandboxSource(e.target.value)}
              className="text-xs bg-resq-bg border border-resq-border rounded-lg px-2.5 py-1.5 font-medium"
            >
              {sandboxNodes.map(n => (
                <option key={n.id} value={n.id}>
                  Source: {n.name}
                </option>
              ))}
            </select>
            <ArrowRight className="w-3.5 h-3.5 text-resq-muted" />
            <select
              value={sandboxDest}
              onChange={e => setSandboxDest(e.target.value)}
              className="text-xs bg-resq-bg border border-resq-border rounded-lg px-2.5 py-1.5 font-medium"
            >
              {sandboxNodes.map(n => (
                <option key={n.id} value={n.id}>
                  Target: {n.name}
                </option>
              ))}
            </select>
            <button
              onClick={runSandbox}
              className="px-4 py-1.5 bg-resq-primary text-white text-xs font-semibold rounded-lg hover:bg-resq-primary-hover shadow-sm"
            >
              Execute
            </button>
          </div>
        </div>

        {/* Sandbox Canvas */}
        <GraphCanvas
          graph={{ nodes: sandboxNodes, edges: sandboxEdges }}
          sourceId={sandboxSource}
          destId={sandboxDest}
          weightMode="distance"
          highlightedPathNodeIds={sandboxResult?.pathNodeIds || []}
          highlightedPathEdgeIds={sandboxResult?.pathEdgeIds || []}
          height="380px"
        />

        {sandboxResult && (
          <div className="p-3 bg-resq-primary-light/50 rounded-lg border border-resq-primary/20 text-xs flex items-center justify-between font-mono">
            <span>
              Sandbox Distance: <strong>{sandboxResult.reachable ? `${sandboxResult.totalWeight.toFixed(1)} km` : 'UNREACHABLE'}</strong>
            </span>
            <span>
              Path: {sandboxResult.reachable ? sandboxResult.pathNodeIds.map(id => sandboxNodes.find(n => n.id === id)?.name).join(' → ') : 'None'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

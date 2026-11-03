import React, { useState, useEffect, useMemo } from 'react';
import { useGraph } from '../../context/GraphContext';
import { generateDijkstraTrace } from '../../algorithms/dijkstra';
import { GraphCanvas } from '../visualizer/GraphCanvas';
import { DijkstraStep } from '../../types/graph';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Gauge,
  CheckCircle,
  XCircle,
  Layers,
  ArrowRight,
  ListOrdered,
  Cpu,
  Info,
  TableProperties,
} from 'lucide-react';

export const AlgorithmLab: React.FC = () => {
  const { graph, sourceId, destId, weightMode, setSourceId, setDestId, updateNode } = useGraph();

  // Execution Speed in milliseconds (interval between auto-advance)
  const [speedMs, setSpeedMs] = useState<number>(800);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Trace Generation
  const trace = useMemo(() => {
    if (!sourceId || !destId || !graph.nodes.some(n => n.id === sourceId) || !graph.nodes.some(n => n.id === destId)) {
      return null;
    }
    return generateDijkstraTrace(graph, sourceId, destId, weightMode);
  }, [graph, sourceId, destId, weightMode]);

  const steps: DijkstraStep[] = trace ? trace.steps : [];
  const currentStep: DijkstraStep | undefined = steps[currentStepIndex];

  // Shortest Tree Edge IDs for the current step (predecessor tree)
  const shortestTreeEdgeIds = useMemo(() => {
    if (!currentStep) return [];
    const edgeIds: string[] = [];
    Object.entries(currentStep.predecessors).forEach(([targetId, sourceNodeId]) => {
      if (sourceNodeId) {
        const edge = graph.edges.find(
          e =>
            (e.source === sourceNodeId && e.target === targetId) ||
            (!e.isOneWay && e.source === targetId && e.target === sourceNodeId)
        );
        if (edge) edgeIds.push(edge.id);
      }
    });
    return edgeIds;
  }, [currentStep, graph.edges]);

  // Active path formed so far at this step
  const { activePathNodeIds, activePathEdgeIds } = useMemo(() => {
    if (!currentStep || !sourceId) return { activePathNodeIds: [], activePathEdgeIds: [] };

    const targetForPath =
      currentStep.type === 'DESTINATION_REACHED' || currentStep.type === 'COMPLETED'
        ? destId
        : currentStep.currentNodeId;

    if (!targetForPath || currentStep.distances[targetForPath] === undefined || currentStep.distances[targetForPath] === Infinity) {
      return { activePathNodeIds: [], activePathEdgeIds: [] };
    }

    const nodeIds: string[] = [];
    const edgeIds: string[] = [];
    let curr: string | null = targetForPath;
    const visited = new Set<string>();

    while (curr && !visited.has(curr)) {
      visited.add(curr);
      nodeIds.push(curr);
      const prev: string | null = currentStep.predecessors[curr];
      if (prev) {
        const edge = graph.edges.find(
          e =>
            (e.source === prev && e.target === curr) ||
            (!e.isOneWay && e.source === curr && e.target === prev)
        );
        if (edge) edgeIds.push(edge.id);
      }
      curr = prev;
    }

    return {
      activePathNodeIds: nodeIds.reverse(),
      activePathEdgeIds: edgeIds.reverse(),
    };
  }, [currentStep, sourceId, destId, graph.edges]);

  // Auto-play interval timer
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && steps.length > 0) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speedMs, steps.length]);

  // Reset to step 0 when source/dest/graph changes
  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [trace]);

  const handlePlayPause = () => {
    if (currentStepIndex >= steps.length - 1) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false);
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentStepIndex(parseInt(e.target.value, 10));
  };

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  return (
    <div className="space-y-5">
      {/* Top Controls Header */}
      <div className="bg-white rounded-xl border border-resq-border p-4.5 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4.5 h-4.5 text-resq-primary" />
            <h2 className="text-base font-bold text-resq-text tracking-tight">
              Algorithm Lab — Step-by-Step Dijkstra Trace Workspace
            </h2>
          </div>
          <p className="text-xs text-resq-muted mt-0.5">
            Deterministic execution events: Min-Binary Heap pops, distance array relaxations, and predecessor tree updates
          </p>
        </div>

        {/* Origin / Target Selection for Trace */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sourceId || ''}
            onChange={e => setSourceId(e.target.value)}
            className="text-xs bg-resq-bg border border-resq-border rounded-lg px-2.5 py-1.5 text-resq-text font-semibold cursor-pointer"
          >
            {graph.nodes.map(n => (
              <option key={n.id} value={n.id}>
                From: {n.name}
              </option>
            ))}
          </select>

          <ArrowRight className="w-3.5 h-3.5 text-resq-muted" />

          <select
            value={destId || ''}
            onChange={e => setDestId(e.target.value)}
            className="text-xs bg-resq-bg border border-resq-border rounded-lg px-2.5 py-1.5 text-resq-text font-semibold cursor-pointer"
          >
            {graph.nodes.map(n => (
              <option key={n.id} value={n.id}>
                To: {n.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Execution Control Bar */}
      <div className="bg-white rounded-xl border border-resq-border p-4 shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Playback Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              disabled={currentStepIndex === 0}
              className="p-2 text-resq-text bg-resq-bg hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed rounded-lg border border-resq-border transition-all"
              title="Previous Step"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={steps.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-xs transition-all active:scale-[0.98]"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause' : 'Play Trace'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIndex >= steps.length - 1}
              className="p-2 text-resq-text bg-resq-bg hover:bg-slate-200 disabled:opacity-35 disabled:cursor-not-allowed rounded-lg border border-resq-border transition-all"
              title="Next Step"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleReset}
              className="p-2 text-resq-muted hover:text-resq-text bg-resq-bg rounded-lg border border-resq-border transition-all"
              title="Reset Execution to Step 0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs text-resq-muted font-medium">
            <Gauge className="w-3.5 h-3.5 text-resq-primary" />
            <span>Speed:</span>
            <div className="flex items-center bg-resq-bg p-0.5 rounded-lg border border-resq-border">
              {[
                { label: '0.5x', ms: 1400 },
                { label: '1x', ms: 800 },
                { label: '2x', ms: 400 },
                { label: '4x', ms: 180 },
              ].map(s => (
                <button
                  key={s.label}
                  onClick={() => setSpeedMs(s.ms)}
                  className={`px-2 py-0.5 rounded text-[10.5px] font-bold transition-all ${
                    speedMs === s.ms
                      ? 'bg-white text-resq-primary shadow-xs'
                      : 'text-resq-muted hover:text-resq-text'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step Counter Badge */}
          <div className="text-xs font-mono font-bold text-resq-muted tabular-nums">
            Step <span className="text-resq-primary text-sm font-extrabold">{currentStepIndex + 1}</span> / {steps.length}
          </div>
        </div>

        {/* Step Scrubber Slider */}
        <div className="pt-1">
          <input
            type="range"
            min={0}
            max={Math.max(0, steps.length - 1)}
            value={currentStepIndex}
            onChange={handleSliderChange}
            className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-resq-primary"
          />
        </div>
      </div>

      {/* Real-Time Step Explanation Alert Callout */}
      {currentStep && (
        <div
          className={`p-3.5 rounded-xl border transition-all text-xs flex items-start gap-3 shadow-subtle ${
            currentStep.type === 'RELAX_EDGE_UPDATED'
              ? 'bg-resq-success-light/70 border-resq-success/30 text-[#0E625B]'
              : currentStep.type === 'RELAX_EDGE_REJECTED'
              ? 'bg-amber-50/70 border-amber-200 text-amber-900'
              : currentStep.type === 'DESTINATION_REACHED' || currentStep.type === 'COMPLETED'
              ? 'bg-resq-primary-light/70 border-resq-primary/30 text-resq-primary'
              : 'bg-white border-resq-border text-resq-text'
          }`}
        >
          <div className="mt-0.5 flex-shrink-0">
            {currentStep.type === 'RELAX_EDGE_UPDATED' ? (
              <CheckCircle className="w-4.5 h-4.5 text-resq-success" />
            ) : currentStep.type === 'RELAX_EDGE_REJECTED' ? (
              <XCircle className="w-4.5 h-4.5 text-amber-600" />
            ) : (
              <Info className="w-4.5 h-4.5 text-resq-primary" />
            )}
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-[10.5px] uppercase tracking-wider">
              {currentStep.type.replace(/_/g, ' ')}
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {currentStep.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Interactive Canvas + Live Data Structures */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Algorithm Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle flex items-center justify-between">
            <span className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-resq-primary" />
              Synchronized Graph Visual State
            </span>
            <div className="flex items-center gap-3 text-[11px] text-resq-muted font-medium">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Current Min
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#119B8A]" /> Settled Set
              </span>
            </div>
          </div>

          <GraphCanvas
            graph={graph}
            sourceId={sourceId}
            destId={destId}
            weightMode={weightMode}
            highlightedPathNodeIds={activePathNodeIds}
            highlightedPathEdgeIds={activePathEdgeIds}
            shortestTreeEdgeIds={shortestTreeEdgeIds}
            activeCurrentNodeId={currentStep?.currentNodeId}
            activeNeighborNodeId={currentStep?.neighborNodeId}
            activeEdgeId={currentStep?.activeEdgeId}
            activeEdgeRelaxed={currentStep?.tentativeEdge?.didRelax}
            settledNodeIds={currentStep?.settledNodes || []}
            tentativeDistances={currentStep?.distances || {}}
            onSetSource={id => setSourceId(id)}
            onSetDestination={id => setDestId(id)}
            onNodeDragEnd={(id, x, y) => updateNode(id, { x, y })}
            height="560px"
          />
        </div>

        {/* Right Column (5 cols): Priority Queue & Distance Table */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Min-Priority Queue Visual State */}
          <div className="bg-white p-4 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-resq-border">
              <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-resq-primary" />
                Min-Priority Queue (Binary Heap)
              </h3>
              <span className="text-[10px] font-mono text-resq-muted tabular-nums font-semibold">
                {currentStep?.priorityQueue.length || 0} items in heap
              </span>
            </div>

            {currentStep && currentStep.priorityQueue.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {currentStep.priorityQueue.map((item, idx) => (
                  <div
                    key={`${item.nodeId}-${idx}`}
                    className={`px-2.5 py-1.5 rounded-lg border text-xs flex items-center gap-2 font-mono ${
                      idx === 0
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs'
                        : 'bg-resq-bg border-resq-border text-resq-text'
                    }`}
                  >
                    <span className="text-[9.5px] text-resq-muted font-sans font-bold">
                      {idx === 0 ? 'TOP (MIN)' : `#${idx + 1}`}
                    </span>
                    <span className="truncate max-w-[110px] font-sans font-semibold">{item.nodeName}</span>
                    <span className="bg-white px-1.5 py-0.2 rounded border border-resq-border text-[10.5px] font-bold tabular-nums">
                      {item.priority.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-resq-muted">
                Priority Queue is empty (all reachable vertices settled).
              </div>
            )}
          </div>

          {/* Tentative Distance Array & Predecessor Table */}
          <div className="bg-white rounded-xl border border-resq-border shadow-subtle overflow-hidden">
            <div className="p-3 bg-[#F8FAFC] border-b border-resq-border flex items-center justify-between">
              <h3 className="text-xs font-bold text-resq-text uppercase tracking-wider flex items-center gap-1.5">
                <TableProperties className="w-3.5 h-3.5 text-resq-primary" />
                Distance & Predecessor Array
              </h3>
              <span className="text-[10px] font-mono text-resq-muted tabular-nums font-semibold">
                {currentStep?.settledNodes.length || 0} / {graph.nodes.length} Settled
              </span>
            </div>

            <div className="max-h-78 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white border-b border-resq-border text-resq-muted text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="py-2 px-3">Vertex (v)</th>
                    <th className="py-2 px-3">dist[v]</th>
                    <th className="py-2 px-3">parent[v]</th>
                    <th className="py-2 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-resq-border font-mono text-[11px] tabular-nums">
                  {graph.nodes.map(node => {
                    const dist = currentStep?.distances[node.id];
                    const predId = currentStep?.predecessors[node.id];
                    const predNode = predId ? nodeMap.get(predId) : null;
                    const isSettled = currentStep?.settledNodes.includes(node.id);
                    const isCurrent = currentStep?.currentNodeId === node.id;

                    return (
                      <tr
                        key={node.id}
                        className={`transition-colors ${
                          isCurrent
                            ? 'bg-amber-50/70 font-semibold'
                            : isSettled
                            ? 'bg-resq-success-light/35'
                            : 'hover:bg-resq-bg'
                        }`}
                      >
                        <td className="py-2 px-3 font-sans font-semibold text-resq-text">
                          {node.name}
                        </td>
                        <td className="py-2 px-3 font-bold text-resq-primary">
                          {dist === undefined || dist === Infinity ? '∞' : dist.toFixed(1)}
                        </td>
                        <td className="py-2 px-3 font-sans text-resq-muted font-medium">
                          {predNode ? predNode.name : '—'}
                        </td>
                        <td className="py-2 px-3 text-right font-sans">
                          {isSettled ? (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-resq-success-light text-resq-success border border-resq-success/20">
                              SETTLED
                            </span>
                          ) : (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-resq-bg text-resq-muted">
                              UNSETTLED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GraphData, GraphNode, NodeCategory } from '../../types/graph';
import { calculateGraphBounds, computeFitTransform, TransformState } from '../../utils/graphLayout';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Crosshair,
  Building2,
  Flame,
  Truck,
  Shield,
  AlertTriangle,
  MapPin,
  Home,
  Briefcase,
  Factory,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface GraphCanvasProps {
  graph: GraphData;
  sourceId?: string | null;
  destId?: string | null;
  weightMode?: 'distance' | 'travelTime';
  highlightedPathNodeIds?: string[];
  highlightedPathEdgeIds?: string[];
  shortestTreeEdgeIds?: string[];
  // Algorithm Lab overrides
  activeCurrentNodeId?: string | null;
  activeNeighborNodeId?: string | null;
  activeEdgeId?: string | null;
  activeEdgeRelaxed?: boolean;
  settledNodeIds?: string[];
  tentativeDistances?: Record<string, number>;
  onNodeClick?: (node: GraphNode) => void;
  onSetSource?: (nodeId: string) => void;
  onSetDestination?: (nodeId: string) => void;
  onNodeDragEnd?: (nodeId: string, x: number, y: number) => void;
  height?: string;
  showLegend?: boolean;
}

export const getCategoryIcon = (category: NodeCategory) => {
  switch (category) {
    case 'Hospital':
      return Building2;
    case 'Fire Station':
      return Flame;
    case 'Ambulance Post':
      return Truck;
    case 'Police Station':
      return Shield;
    case 'Emergency Incident':
      return AlertTriangle;
    case 'Residential':
      return Home;
    case 'Commercial':
      return Briefcase;
    case 'Industrial':
      return Factory;
    default:
      return MapPin;
  }
};

export const getCategoryColor = (category: NodeCategory): { bg: string; border: string; text: string; fill: string } => {
  switch (category) {
    case 'Hospital':
      return { bg: '#EBF7F6', border: '#159C91', text: '#0E625B', fill: '#159C91' };
    case 'Fire Station':
      return { bg: '#FDF2F2', border: '#E45B52', text: '#9B231B', fill: '#E45B52' };
    case 'Ambulance Post':
      return { bg: '#EEF2FF', border: '#3457D5', text: '#1E368F', fill: '#3457D5' };
    case 'Police Station':
      return { bg: '#F0F4FF', border: '#2563EB', text: '#1D4ED8', fill: '#2563EB' };
    case 'Emergency Incident':
      return { bg: '#FEF3C7', border: '#D97706', text: '#92400E', fill: '#D97706' };
    case 'Industrial':
      return { bg: '#F3F4F6', border: '#6B7280', text: '#374151', fill: '#6B7280' };
    default:
      return { bg: '#F8FAFC', border: '#94A3B8', text: '#475569', fill: '#64748B' };
  }
};

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  sourceId,
  destId,
  weightMode = 'distance',
  highlightedPathNodeIds = [],
  highlightedPathEdgeIds = [],
  shortestTreeEdgeIds = [],
  activeCurrentNodeId,
  activeNeighborNodeId,
  activeEdgeId,
  activeEdgeRelaxed,
  settledNodeIds = [],
  tentativeDistances = {},
  onNodeClick,
  onSetSource,
  onSetDestination,
  onNodeDragEnd,
  height = '540px',
  showLegend = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform state: pan (x, y) and zoom scale
  const [transform, setTransform] = useState<TransformState>({ x: 50, y: 40, scale: 0.8 });
  const [isUserTransformed, setIsUserTransformed] = useState<boolean>(false);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 800, height: 540 });

  // Panning & dragging state
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(true);

  // Sync positions when graph nodes change
  useEffect(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    graph.nodes.forEach(n => {
      pos[n.id] = { x: n.x, y: n.y };
    });
    setNodePositions(pos);
  }, [graph.nodes]);

  const pathNodeSet = useMemo(() => new Set(highlightedPathNodeIds), [highlightedPathNodeIds]);
  const pathEdgeSet = useMemo(() => new Set(highlightedPathEdgeIds), [highlightedPathEdgeIds]);
  const shortestTreeEdgeSet = useMemo(() => new Set(shortestTreeEdgeIds), [shortestTreeEdgeIds]);
  const settledSet = useMemo(() => new Set(settledNodeIds), [settledNodeIds]);

  // Safe position retriever
  const getNodePos = useCallback((id: string) => {
    if (nodePositions[id]) return nodePositions[id];
    const found = graph.nodes.find(n => n.id === id);
    return found ? { x: found.x, y: found.y } : { x: 0, y: 0 };
  }, [nodePositions, graph.nodes]);

  // Perform fit to screen calculation
  const fitGraphToViewport = useCallback((width: number, height: number) => {
    if (graph.nodes.length === 0 || width <= 0 || height <= 0) return;
    const bounds = calculateGraphBounds(graph.nodes, graph.edges, nodePositions);
    const optimalTransform = computeFitTransform(bounds, width, height, {
      top: 55,
      right: showLegend ? 85 : 70,
      bottom: showLegend ? 85 : 55,
      left: 70,
    });
    setTransform(optimalTransform);
  }, [graph.nodes, graph.edges, nodePositions, showLegend]);

  // Track container dimensions and auto-fit on mount & resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateDimensions = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ width: rect.width, height: rect.height });
        if (!isUserTransformed) {
          fitGraphToViewport(rect.width, rect.height);
        }
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
    };
  }, [fitGraphToViewport, isUserTransformed]);

  // Recalculate auto-fit when graph topology changes
  useEffect(() => {
    setIsUserTransformed(false);
    if (containerSize.width > 0 && containerSize.height > 0) {
      fitGraphToViewport(containerSize.width, containerSize.height);
    }
  }, [graph.nodes.length, graph.edges.length]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setIsUserTransformed(true);
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(2.5, +(prev.scale * zoomFactor).toFixed(3))),
    }));
  };

  // Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).tagName === 'rect') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsUserTransformed(true);
      setTransform(prev => ({
        ...prev,
        x: Math.round(e.clientX - panStart.x),
        y: Math.round(e.clientY - panStart.y),
      }));
    } else if (draggingNodeId) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const svgX = (e.clientX - rect.left - transform.x) / transform.scale;
      const svgY = (e.clientY - rect.top - transform.y) / transform.scale;

      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: { x: Math.round(svgX), y: Math.round(svgY) },
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      const finalPos = nodePositions[draggingNodeId];
      if (finalPos && onNodeDragEnd) {
        onNodeDragEnd(draggingNodeId, finalPos.x, finalPos.y);
      }
      setDraggingNodeId(null);
    }
    setIsPanning(false);
  };

  const handleZoom = (factor: number) => {
    setIsUserTransformed(true);
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(2.5, +(prev.scale * factor).toFixed(3))),
    }));
  };

  const handleFitToScreenClick = () => {
    setIsUserTransformed(false);
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width || containerSize.width;
    const h = rect?.height || containerSize.height;
    fitGraphToViewport(w, h);
  };

  const handleResetViewClick = () => {
    setIsUserTransformed(false);
    const rect = containerRef.current?.getBoundingClientRect();
    const w = rect?.width || containerSize.width;
    const h = rect?.height || containerSize.height;
    fitGraphToViewport(w, h);
  };

  const selectedNode = useMemo(() => {
    return graph.nodes.find(n => n.id === selectedNodeId) || null;
  }, [graph.nodes, selectedNodeId]);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-xl border border-resq-border bg-[#FBFBFC] overflow-hidden select-none"
      style={{ height }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* City Grid Blueprint Background */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.45]">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E6E9EF" strokeWidth="0.8" />
          </pattern>
          <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#DCE1EA" strokeWidth="1.2" />
          </pattern>
          {/* Arrowhead marker for one-way roads */}
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#64748B" />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#3457D5" />
          </marker>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Floating Canvas Controls (Top Right) */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg border border-resq-border shadow-subtle">
        <button
          onClick={() => handleZoom(1.18)}
          className="p-1.5 text-resq-muted hover:text-resq-text hover:bg-resq-bg rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.85)}
          className="p-1.5 text-resq-muted hover:text-resq-text hover:bg-resq-bg rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-resq-border my-auto" />
        <button
          onClick={handleFitToScreenClick}
          className="p-1.5 text-resq-muted hover:text-resq-primary hover:bg-resq-primary-light rounded transition-colors"
          title="Fit Network to Screen (Auto Center)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetViewClick}
          className="p-1.5 text-resq-muted hover:text-resq-text hover:bg-resq-bg rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Canvas Viewport Coordinates Badge (Top Left) */}
      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-resq-border shadow-subtle text-xs font-mono text-resq-muted">
          <Crosshair className="w-3.5 h-3.5 text-resq-primary" />
          <span>Zoom: {Math.round(transform.scale * 100)}%</span>
          <span>•</span>
          <span>Nodes: {graph.nodes.length}</span>
          <span>•</span>
          <span>Roads: {graph.edges.length}</span>
          <span>•</span>
          <span className="font-semibold text-resq-primary">
            Mode: {weightMode === 'travelTime' ? 'Time (min)' : 'Dist (km)'}
          </span>
        </div>
      </div>

      {/* Main SVG Graph Layer (Fixed 100% dimensions, transform placed on inner <g>) */}
      <svg className="w-full h-full block cursor-grab active:cursor-grabbing">
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
          {/* EDGES LAYER */}
          <g id="edges-layer">
            {graph.edges.map(edge => {
              const sourcePos = getNodePos(edge.source);
              const targetPos = getNodePos(edge.target);
              const isPathEdge = pathEdgeSet.has(edge.id);
              const isTreeEdge = shortestTreeEdgeSet.has(edge.id);
              const isActiveEdge = activeEdgeId === edge.id;

              const midX = (sourcePos.x + targetPos.x) / 2;
              const midY = (sourcePos.y + targetPos.y) / 2;

              // Display correct weight value and unit
              const weightVal = weightMode === 'travelTime' ? edge.travelTime : edge.distance;
              const unitStr = weightMode === 'travelTime' ? 'min' : 'km';

              return (
                <g key={edge.id} className="transition-all duration-200">
                  {/* Background halo for active shortest path */}
                  {isPathEdge && (
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke="#3457D5"
                      strokeWidth={9}
                      strokeOpacity={0.22}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Shortest tree edge background in Algorithm Lab */}
                  {isTreeEdge && !isPathEdge && (
                    <line
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke="#159C91"
                      strokeWidth={4.5}
                      strokeOpacity={0.2}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Main Road Line */}
                  <line
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={
                      isActiveEdge
                        ? activeEdgeRelaxed
                          ? '#159C91'
                          : '#E59A18'
                        : isPathEdge
                        ? '#3457D5'
                        : isTreeEdge
                        ? '#159C91'
                        : '#CBD5E1'
                    }
                    strokeWidth={isActiveEdge ? 3.8 : isPathEdge ? 3.2 : isTreeEdge ? 2.5 : 2}
                    strokeDasharray={isPathEdge ? '8 4' : isActiveEdge && !activeEdgeRelaxed ? '5 3' : undefined}
                    strokeLinecap="round"
                    markerEnd={edge.isOneWay ? (isPathEdge ? 'url(#arrowhead-active)' : 'url(#arrowhead)') : undefined}
                  />

                  {/* Road Weight Badge Pill */}
                  <g transform={`translate(${midX}, ${midY})`} className="cursor-pointer pointer-events-auto">
                    <title>{`${edge.roadName}: ${edge.distance.toFixed(1)} km • ${edge.travelTime.toFixed(1)} min`}</title>
                    <rect
                      x="-28"
                      y="-11"
                      width="56"
                      height="22"
                      rx="11"
                      fill={
                        isPathEdge
                          ? '#3457D5'
                          : isActiveEdge
                          ? activeEdgeRelaxed
                            ? '#EBF7F6'
                            : '#FEF9EE'
                          : '#FFFFFF'
                      }
                      stroke={
                        isPathEdge
                          ? '#3457D5'
                          : isActiveEdge
                          ? activeEdgeRelaxed
                            ? '#159C91'
                            : '#E59A18'
                          : isTreeEdge
                          ? '#159C91'
                          : '#D1D5DB'
                      }
                      strokeWidth={isActiveEdge || isPathEdge ? 1.5 : 1}
                      className="shadow-sm drop-shadow-xs"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill={
                        isPathEdge
                          ? '#FFFFFF'
                          : isActiveEdge
                          ? activeEdgeRelaxed
                            ? '#0E625B'
                            : '#92400E'
                          : isTreeEdge
                          ? '#0E625B'
                          : '#334155'
                      }
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="600"
                    >
                      {weightVal.toFixed(1)} {unitStr}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* NODES LAYER */}
          <g id="nodes-layer">
            {graph.nodes.map(node => {
              const pos = getNodePos(node.id);
              const isSource = sourceId === node.id;
              const isDest = destId === node.id;
              const isPathNode = pathNodeSet.has(node.id);
              const isCurrentInAlgo = activeCurrentNodeId === node.id;
              const isNeighborInAlgo = activeNeighborNodeId === node.id;
              const isSettled = settledSet.has(node.id);
              const catColors = getCategoryColor(node.category);
              const tentativeDist = tentativeDistances[node.id];

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className="cursor-pointer group"
                  onMouseDown={e => {
                    e.stopPropagation();
                    setDraggingNodeId(node.id);
                    setSelectedNodeId(node.id);
                    if (onNodeClick) onNodeClick(node);
                  }}
                >
                  <title>{`${node.name} (${node.category})`}</title>

                  {/* Active algorithm scanning halo ring */}
                  {isCurrentInAlgo && (
                    <circle
                      r="29"
                      fill="none"
                      stroke="#E59A18"
                      strokeWidth="2.5"
                      strokeDasharray="5 3"
                      className="animate-spin"
                      style={{ transformOrigin: '0 0', animationDuration: '3s' }}
                    />
                  )}

                  {/* Source or Dest pulsing outer halo */}
                  {(isSource || isDest) && (
                    <circle
                      r="27"
                      fill={isSource ? '#3457D5' : '#E45B52'}
                      fillOpacity="0.18"
                      stroke={isSource ? '#3457D5' : '#E45B52'}
                      strokeWidth="1.5"
                      className="animate-pulse"
                    />
                  )}

                  {/* Main Node Circle */}
                  <circle
                    r={isSource || isDest || isCurrentInAlgo ? 20 : 17}
                    fill={
                      isSource
                        ? '#3457D5'
                        : isDest
                        ? '#E45B52'
                        : isCurrentInAlgo
                        ? '#FEF9EE'
                        : isNeighborInAlgo
                        ? '#EEF2FF'
                        : isPathNode
                        ? '#EEF2FF'
                        : isSettled
                        ? '#EBF7F6'
                        : '#FFFFFF'
                    }
                    stroke={
                      isSource
                        ? '#1E368F'
                        : isDest
                        ? '#9B231B'
                        : isCurrentInAlgo
                        ? '#E59A18'
                        : isNeighborInAlgo
                        ? '#3457D5'
                        : isPathNode
                        ? '#3457D5'
                        : isSettled
                        ? '#159C91'
                        : catColors.border
                    }
                    strokeWidth={isSource || isDest || isPathNode || isCurrentInAlgo ? 2.5 : 1.8}
                    className="transition-all duration-150 drop-shadow-sm group-hover:stroke-resq-primary"
                  />

                  {/* Center Dot Mark */}
                  <circle
                    r="5"
                    fill={
                      isSource || isDest
                        ? '#FFFFFF'
                        : isSettled
                        ? '#159C91'
                        : isCurrentInAlgo
                        ? '#E59A18'
                        : catColors.fill
                    }
                  />

                  {/* Location Name Label with White Halo to prevent clipping & background collisions */}
                  <text
                    x="0"
                    y={isSource || isDest ? 34 : 31}
                    textAnchor="middle"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    fontSize={isSource || isDest ? '12' : '11'}
                    fontWeight={isSource || isDest || isPathNode ? '700' : '600'}
                    fontFamily="Inter, system-ui, sans-serif"
                    className="pointer-events-none opacity-95 select-none"
                  >
                    {node.name}
                  </text>
                  <text
                    x="0"
                    y={isSource || isDest ? 34 : 31}
                    textAnchor="middle"
                    fill={isSource ? '#1E368F' : isDest ? '#9B231B' : '#171B26'}
                    fontSize={isSource || isDest ? '12' : '11'}
                    fontWeight={isSource || isDest || isPathNode ? '700' : '600'}
                    fontFamily="Inter, system-ui, sans-serif"
                    className="pointer-events-none select-none"
                  >
                    {node.name}
                  </text>

                  {/* Upper Tentative Distance Badge in Algorithm Lab */}
                  {tentativeDist !== undefined && (
                    <g transform="translate(0, -26)">
                      <rect
                        x="-26"
                        y="-10"
                        width="52"
                        height="17"
                        rx="8.5"
                        fill={isSettled ? '#159C91' : '#334155'}
                        className="drop-shadow-sm"
                      />
                      <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="600"
                      >
                        {tentativeDist === Infinity ? '∞' : `${tentativeDist.toFixed(1)}${weightMode === 'travelTime' ? 'm' : 'k'}`}
                      </text>
                    </g>
                  )}

                  {/* Upper Role Pill when not in Algorithm Lab */}
                  {tentativeDist === undefined && (isSource || isDest) && (
                    <g transform="translate(0, -26)">
                      <rect
                        x={isSource ? '-36' : '-36'}
                        y="-10"
                        width="72"
                        height="17"
                        rx="8.5"
                        fill={isSource ? '#3457D5' : '#E45B52'}
                        className="drop-shadow-sm"
                      />
                      <text
                        x="0"
                        y="1.5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="8.5"
                        fontWeight="700"
                        letterSpacing="0.04em"
                      >
                        {isSource ? 'DISPATCH ORIGIN' : 'TARGET INCIDENT'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Selected Node Inspector Drawer (Bottom Left) */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 z-20 max-w-sm bg-white/95 backdrop-blur-md p-3.5 rounded-xl border border-resq-border shadow-card text-xs">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-resq-primary-light text-resq-primary mb-1">
                {selectedNode.category}
              </span>
              <h4 className="font-semibold text-resq-text text-sm">{selectedNode.name}</h4>
            </div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="text-resq-muted hover:text-resq-text p-1 text-base leading-none"
            >
              ×
            </button>
          </div>
          {selectedNode.notes && (
            <p className="text-resq-muted text-[11px] mb-3 leading-relaxed">{selectedNode.notes}</p>
          )}
          <div className="flex items-center gap-2 pt-2 border-t border-resq-border">
            {onSetSource && (
              <button
                onClick={() => onSetSource(selectedNode.id)}
                className="flex-1 py-1.5 px-2 bg-resq-primary text-white rounded font-medium hover:bg-resq-primary-hover transition-colors text-center text-xs"
              >
                Set as Source
              </button>
            )}
            {onSetDestination && (
              <button
                onClick={() => onSetDestination(selectedNode.id)}
                className="flex-1 py-1.5 px-2 bg-resq-emergency text-white rounded font-medium hover:bg-red-600 transition-colors text-center text-xs"
              >
                Set as Target
              </button>
            )}
          </div>
        </div>
      )}

      {/* Visualizer Legend (Bottom Right, Collapsible) */}
      {showLegend && (
        <div className="absolute bottom-3.5 right-3.5 z-20 bg-white/95 backdrop-blur-sm rounded-xl border border-resq-border shadow-subtle text-[11px] text-resq-muted overflow-hidden transition-all">
          <div
            onClick={() => setIsLegendExpanded(!isLegendExpanded)}
            className="flex items-center justify-between gap-3 px-3 py-1.5 bg-[#F8FAFC] border-b border-resq-border/60 cursor-pointer hover:bg-slate-100 transition-colors"
          >
            <span className="font-semibold text-resq-text text-[10px] uppercase tracking-wider">Map Legend</span>
            {isLegendExpanded ? <ChevronDown className="w-3.5 h-3.5 text-resq-muted" /> : <ChevronUp className="w-3.5 h-3.5 text-resq-muted" />}
          </div>

          {isLegendExpanded && (
            <div className="p-3 space-y-1.5 bg-white">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#3457D5] border-2 border-white shadow-xs" />
                <span>Emergency Source (Origin)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#E45B52] border-2 border-white shadow-xs" />
                <span>Target Incident / Hospital</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-1.5 bg-[#3457D5] rounded-full" />
                <span>Optimal Shortest Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#159C91] border-2 border-white shadow-xs" />
                <span>Settled / Finalized Node</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

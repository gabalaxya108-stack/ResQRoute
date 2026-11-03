import { GraphNode, GraphEdge } from '../types/graph';

export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

export interface TransformState {
  x: number;
  y: number;
  scale: number;
}

export interface FitPadding {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/**
 * Calculates the exact bounding box of the graph including node circles,
 * upper tentative distance badges, lower label text, and edge midpoints.
 */
export function calculateGraphBounds(
  nodes: GraphNode[],
  edges: GraphEdge[] = [],
  nodePositions?: Record<string, { x: number; y: number }>
): BoundingBox {
  if (!nodes || nodes.length === 0) {
    return {
      minX: 0,
      maxX: 800,
      minY: 0,
      maxY: 600,
      width: 800,
      height: 600,
      centerX: 400,
      centerY: 300,
    };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const pos = nodePositions && nodePositions[node.id] ? nodePositions[node.id] : { x: node.x, y: node.y };
    
    // Half width of label text (estimate ~7px per character, min 50px)
    const labelHalfWidth = Math.max(50, (node.name.length * 7.2) / 2);
    
    // Node bounds including label and halo
    const nodeLeft = pos.x - Math.max(26, labelHalfWidth);
    const nodeRight = pos.x + Math.max(26, labelHalfWidth);
    
    // Top bounds (upper badge at y - 25, height 16px -> top is y - 35, plus 8px margin)
    const nodeTop = pos.y - 42;
    // Bottom bounds (label baseline at y + 34, font size 12px, descenders + margin -> y + 52)
    const nodeBottom = pos.y + 54;

    minX = Math.min(minX, nodeLeft);
    maxX = Math.max(maxX, nodeRight);
    minY = Math.min(minY, nodeTop);
    maxY = Math.max(maxY, nodeBottom);
  });

  // Also include edge label midpoints
  if (edges && edges.length > 0) {
    edges.forEach(edge => {
      const sPos = nodePositions && nodePositions[edge.source] ? nodePositions[edge.source] : nodes.find(n => n.id === edge.source);
      const tPos = nodePositions && nodePositions[edge.target] ? nodePositions[edge.target] : nodes.find(n => n.id === edge.target);
      if (sPos && tPos) {
        const midX = (sPos.x + tPos.x) / 2;
        const midY = (sPos.y + tPos.y) / 2;
        minX = Math.min(minX, midX - 30);
        maxX = Math.max(maxX, midX + 30);
        minY = Math.min(minY, midY - 15);
        maxY = Math.max(maxY, midY + 15);
      }
    });
  }

  const width = Math.max(120, maxX - minX);
  const height = Math.max(120, maxY - minY);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    centerX,
    centerY,
  };
}

/**
 * Computes the optimal scale and translation (x, y) to perfectly center and fit
 * the entire graph inside the given container dimensions with generous padding.
 */
export function computeFitTransform(
  bounds: BoundingBox,
  containerWidth: number,
  containerHeight: number,
  customPadding?: Partial<FitPadding>,
  options?: { minScale?: number; maxScale?: number }
): TransformState {
  // Default padding to account for top-left telemetry, top-right zoom controls,
  // bottom-right legend pill, and outer margins
  const padding: FitPadding = {
    top: customPadding?.top ?? 50,
    right: customPadding?.right ?? 65,
    bottom: customPadding?.bottom ?? 65,
    left: customPadding?.left ?? 65,
  };

  const availableWidth = Math.max(100, containerWidth - (padding.left + padding.right));
  const availableHeight = Math.max(100, containerHeight - (padding.top + padding.bottom));

  // Determine scale that fits both dimensions
  const scaleX = availableWidth / bounds.width;
  const scaleY = availableHeight / bounds.height;
  let targetScale = Math.min(scaleX, scaleY);

  const minScale = options?.minScale ?? 0.35;
  const maxScale = options?.maxScale ?? 1.5;
  targetScale = Math.max(minScale, Math.min(maxScale, targetScale));

  // Target screen center
  const targetScreenCenterX = padding.left + availableWidth / 2;
  const targetScreenCenterY = padding.top + availableHeight / 2;

  // Translation needed so (bounds.centerX * scale + tx = targetScreenCenterX)
  const tx = Math.round(targetScreenCenterX - bounds.centerX * targetScale);
  const ty = Math.round(targetScreenCenterY - bounds.centerY * targetScale);

  return {
    x: tx,
    y: ty,
    scale: parseFloat(targetScale.toFixed(3)),
  };
}


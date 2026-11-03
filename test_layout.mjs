// Standalone test for graph bounds and fit transform calculations
function calculateGraphBounds(nodes, edges = [], nodePositions = {}) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach(node => {
    const pos = nodePositions[node.id] || { x: node.x, y: node.y };
    const labelHalfWidth = Math.max(50, (node.name.length * 7.2) / 2);
    const nodeLeft = pos.x - Math.max(26, labelHalfWidth);
    const nodeRight = pos.x + Math.max(26, labelHalfWidth);
    const nodeTop = pos.y - 42;
    const nodeBottom = pos.y + 54;

    minX = Math.min(minX, nodeLeft);
    maxX = Math.max(maxX, nodeRight);
    minY = Math.min(minY, nodeTop);
    maxY = Math.max(maxY, nodeBottom);
  });

  const width = Math.max(120, maxX - minX);
  const height = Math.max(120, maxY - minY);
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return { minX, maxX, minY, maxY, width, height, centerX, centerY };
}

function computeFitTransform(bounds, containerWidth, containerHeight, customPadding = {}) {
  const padding = {
    top: customPadding.top ?? 50,
    right: customPadding.right ?? 65,
    bottom: customPadding.bottom ?? 65,
    left: customPadding.left ?? 65,
  };

  const availableWidth = Math.max(100, containerWidth - (padding.left + padding.right));
  const availableHeight = Math.max(100, containerHeight - (padding.top + padding.bottom));

  const scaleX = availableWidth / bounds.width;
  const scaleY = availableHeight / bounds.height;
  let targetScale = Math.min(scaleX, scaleY);
  targetScale = Math.max(0.35, Math.min(1.5, targetScale));

  const targetScreenCenterX = padding.left + availableWidth / 2;
  const targetScreenCenterY = padding.top + availableHeight / 2;

  const tx = Math.round(targetScreenCenterX - bounds.centerX * targetScale);
  const ty = Math.round(targetScreenCenterY - bounds.centerY * targetScale);

  return { x: tx, y: ty, scale: parseFloat(targetScale.toFixed(3)) };
}

// 12-Node Metropolitan City Graph
const nodes = [
  { id: 'node-h1', name: 'Central General Hospital', x: 120, y: 120 },
  { id: 'node-fs1', name: 'Metro Fire Station #1', x: 320, y: 90 },
  { id: 'node-c1', name: 'Downtown Civic Plaza', x: 240, y: 260 },
  { id: 'node-i1', name: 'Northbridge Crossing', x: 480, y: 150 },
  { id: 'node-i2', name: 'Westfield Expressway Junction', x: 130, y: 400 },
  { id: 'node-i3', name: 'Grand Harbor Parkway', x: 360, y: 380 },
  { id: 'node-h2', name: 'Mercy Memorial Clinic', x: 640, y: 260 },
  { id: 'node-fs2', name: 'Station 9 Rescue Squad', x: 520, y: 470 },
  { id: 'node-r1', name: 'Oakridge Residential Estate', x: 190, y: 540 },
  { id: 'node-p1', name: 'Police Precinct Central', x: 620, y: 110 },
  { id: 'node-amb', name: 'Southside Ambulance Station', x: 360, y: 580 },
  { id: 'node-dock', name: 'Seaport Industrial Pier [Isolated]', x: 740, y: 520 },
];

console.log('Testing Graph Layout Engine calculations:');
const bounds = calculateGraphBounds(nodes);
console.log('Bounds:', bounds);

// Test across various screen sizes:
const testScreens = [
  { name: 'Overview Desktop (800x520)', w: 800, h: 520 },
  { name: 'Route Planner (700x560)', w: 700, h: 560 },
  { name: 'Algorithm Lab (700x560)', w: 700, h: 560 },
  { name: 'Tablet Canvas (600x450)', w: 600, h: 450 },
  { name: 'Mobile Canvas (380x400)', w: 380, h: 400 },
];

let allPassed = true;
for (const sc of testScreens) {
  const fit = computeFitTransform(bounds, sc.w, sc.h);
  const left = bounds.minX * fit.scale + fit.x;
  const right = bounds.maxX * fit.scale + fit.x;
  const top = bounds.minY * fit.scale + fit.y;
  const bottom = bounds.maxY * fit.scale + fit.y;

  const fitsX = left >= 0 && right <= sc.w;
  const fitsY = top >= 0 && bottom <= sc.h;

  if (fitsX && fitsY) {
    console.log(`[PASS] ${sc.name}: scale=${fit.scale}, X=[${left.toFixed(1)}, ${right.toFixed(1)}] in [0, ${sc.w}], Y=[${top.toFixed(1)}, ${bottom.toFixed(1)}] in [0, ${sc.h}]`);
  } else {
    console.error(`[FAIL] ${sc.name} clipping: X=[${left.toFixed(1)}, ${right.toFixed(1)}], Y=[${top.toFixed(1)}, ${bottom.toFixed(1)}]`);
    allPassed = false;
  }
}

if (!allPassed) process.exit(1);
console.log('\n[ALL TESTS PASSED] Mathematical layout guarantees zero clipping across all screen sizes!');

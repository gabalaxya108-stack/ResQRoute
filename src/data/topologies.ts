import { TestTopology } from '../types/graph';
import { DEFAULT_CITY_GRAPH } from './defaultCity';

export const PREDEFINED_TOPOLOGIES: TestTopology[] = [
  {
    id: 'topo-1',
    title: '1. Simple Connected Graph',
    description: '3-node triangle demonstrating basic Dijkstra relaxation: direct edge (10 km) vs 2-hop path (4 + 3 = 7 km).',
    badge: 'Fundamental',
    defaultSourceId: 't1-a',
    defaultDestId: 't1-c',
    expectedDistance: 7.0,
    expectedPath: ['Station A', 'Station B', 'Station C'],
    graph: {
      nodes: [
        { id: 't1-a', name: 'Station A', category: 'Ambulance Post', x: 100, y: 150 },
        { id: 't1-b', name: 'Station B', category: 'Intersection', x: 300, y: 80 },
        { id: 't1-c', name: 'Station C', category: 'Hospital', x: 500, y: 150 },
      ],
      edges: [
        { id: 'e1-1', source: 't1-a', target: 't1-b', distance: 4.0, travelTime: 4.8, roadName: 'Main St' },
        { id: 'e1-2', source: 't1-b', target: 't1-c', distance: 3.0, travelTime: 3.6, roadName: 'Broadway' },
        { id: 'e1-3', source: 't1-a', target: 't1-c', distance: 10.0, travelTime: 12.0, roadName: 'Highway 1' },
      ],
    },
  },
  {
    id: 'topo-2',
    title: '2. Linear Path Graph',
    description: 'Strict chain graph testing sequential relaxation without branching (A -> B -> C -> D).',
    badge: 'Sequential',
    defaultSourceId: 't2-l0',
    defaultDestId: 't2-l3',
    expectedDistance: 7.0,
    expectedPath: ['Sector 0', 'Sector 1', 'Sector 2', 'Sector 3'],
    graph: {
      nodes: [
        { id: 't2-l0', name: 'Sector 0', category: 'Fire Station', x: 80, y: 150 },
        { id: 't2-l1', name: 'Sector 1', category: 'Intersection', x: 220, y: 150 },
        { id: 't2-l2', name: 'Sector 2', category: 'Intersection', x: 360, y: 150 },
        { id: 't2-l3', name: 'Sector 3', category: 'Hospital', x: 500, y: 150 },
      ],
      edges: [
        { id: 'e2-1', source: 't2-l0', target: 't2-l1', distance: 2.5, travelTime: 3.0, roadName: 'Link 0-1' },
        { id: 'e2-2', source: 't2-l1', target: 't2-l2', distance: 3.5, travelTime: 4.2, roadName: 'Link 1-2' },
        { id: 'e2-3', source: 't2-l2', target: 't2-l3', distance: 1.0, travelTime: 1.2, roadName: 'Link 2-3' },
      ],
    },
  },
  {
    id: 'topo-3',
    title: '3. Cyclic Graph',
    description: 'Loop network with cycles. Tests visited-set check to prevent infinite loops in cyclic topologies.',
    badge: 'Cycles',
    defaultSourceId: 't3-u',
    defaultDestId: 't3-w',
    expectedDistance: 4.0,
    expectedPath: ['Central Base', 'East Depot', 'Emergency Zone'],
    graph: {
      nodes: [
        { id: 't3-u', name: 'Central Base', category: 'Fire Station', x: 120, y: 100 },
        { id: 't3-v', name: 'East Depot', category: 'Commercial', x: 400, y: 100 },
        { id: 't3-w', name: 'Emergency Zone', category: 'Emergency Incident', x: 260, y: 260 },
      ],
      edges: [
        { id: 'e3-1', source: 't3-u', target: 't3-v', distance: 2.0, travelTime: 2.5, roadName: 'North Arterial' },
        { id: 'e3-2', source: 't3-v', target: 't3-w', distance: 2.0, travelTime: 2.5, roadName: 'East Avenue' },
        { id: 'e3-3', source: 't3-u', target: 't3-w', distance: 5.0, travelTime: 6.0, roadName: 'Direct Bypass' },
      ],
    },
  },
  {
    id: 'topo-4',
    title: '4. Complete Graph (K4)',
    description: 'Fully connected 4-clique where every pair is connected. Multi-step relaxation cascaded chain.',
    badge: 'Dense Clique',
    defaultSourceId: 't4-v0',
    defaultDestId: 't4-v3',
    expectedDistance: 6.0,
    expectedPath: ['District 0', 'District 2', 'District 1', 'District 3'],
    graph: {
      nodes: [
        { id: 't4-v0', name: 'District 0', category: 'Ambulance Post', x: 120, y: 90 },
        { id: 't4-v1', name: 'District 1', category: 'Intersection', x: 420, y: 90 },
        { id: 't4-v2', name: 'District 2', category: 'Intersection', x: 120, y: 280 },
        { id: 't4-v3', name: 'District 3', category: 'Hospital', x: 420, y: 280 },
      ],
      edges: [
        { id: 'e4-1', source: 't4-v0', target: 't4-v1', distance: 8.0, travelTime: 9.6, roadName: 'Trans-01' },
        { id: 'e4-2', source: 't4-v0', target: 't4-v2', distance: 3.0, travelTime: 3.6, roadName: 'Trans-02' },
        { id: 'e4-3', source: 't4-v0', target: 't4-v3', distance: 12.0, travelTime: 14.4, roadName: 'Trans-03' },
        { id: 'e4-4', source: 't4-v2', target: 't4-v1', distance: 2.0, travelTime: 2.4, roadName: 'Trans-21' },
        { id: 'e4-5', source: 't4-v1', target: 't4-v3', distance: 1.0, travelTime: 1.2, roadName: 'Trans-13' },
        { id: 'e4-6', source: 't4-v2', target: 't4-v3', distance: 7.0, travelTime: 8.4, roadName: 'Trans-23' },
      ],
    },
  },
  {
    id: 'topo-5',
    title: '5. Disconnected Graph',
    description: 'Island cluster disconnected from mainland. Algorithm must correctly identify unreachable destination.',
    badge: 'Unreachable',
    defaultSourceId: 't5-m1',
    defaultDestId: 't5-i1',
    expectedDistance: -1, // Unreachable
    graph: {
      nodes: [
        { id: 't5-m1', name: 'Mainland Station', category: 'Fire Station', x: 120, y: 150 },
        { id: 't5-m2', name: 'Mainland Hospital', category: 'Hospital', x: 260, y: 150 },
        { id: 't5-i1', name: 'Offshore Facility', category: 'Industrial', x: 480, y: 150 },
      ],
      edges: [
        { id: 'e5-1', source: 't5-m1', target: 't5-m2', distance: 4.0, travelTime: 5.0, roadName: 'Mainland Corridor' },
      ],
    },
  },
  {
    id: 'topo-6',
    title: '6. Equal-Weight Alternative Paths',
    description: 'Diamond graph with dual symmetric paths: North Route (5+5=10) and South Route (5+5=10).',
    badge: 'Ties / Equivalence',
    defaultSourceId: 't6-s',
    defaultDestId: 't6-t',
    expectedDistance: 10.0,
    graph: {
      nodes: [
        { id: 't6-s', name: 'Dispatch Center', category: 'Ambulance Post', x: 100, y: 180 },
        { id: 't6-top', name: 'North Ridgeway', category: 'Intersection', x: 300, y: 80 },
        { id: 't6-bot', name: 'South Parkway', category: 'Intersection', x: 300, y: 280 },
        { id: 't6-t', name: 'Emergency Target', category: 'Emergency Incident', x: 500, y: 180 },
      ],
      edges: [
        { id: 'e6-1', source: 't6-s', target: 't6-top', distance: 5.0, travelTime: 6.0, roadName: 'Northway Alpha' },
        { id: 'e6-2', source: 't6-top', target: 't6-t', distance: 5.0, travelTime: 6.0, roadName: 'Northway Beta' },
        { id: 'e6-3', source: 't6-s', target: 't6-bot', distance: 5.0, travelTime: 6.0, roadName: 'Southway Alpha' },
        { id: 'e6-4', source: 't6-bot', target: 't6-t', distance: 5.0, travelTime: 6.0, roadName: 'Southway Beta' },
      ],
    },
  },
  {
    id: 'topo-7',
    title: '7. Single-Vertex Graph',
    description: 'Edge case where source == destination. Distance must strictly be 0.0 with 0 relaxations needed.',
    badge: 'Trivial Base',
    defaultSourceId: 't7-s',
    defaultDestId: 't7-s',
    expectedDistance: 0.0,
    expectedPath: ['On-site Clinic'],
    graph: {
      nodes: [
        { id: 't7-s', name: 'On-site Clinic', category: 'Hospital', x: 300, y: 180 },
      ],
      edges: [],
    },
  },
  {
    id: 'topo-8',
    title: '8. Metropolitan Benchmark Graph',
    description: 'Realistic 12-location metropolitan road network with 18 weighted edges and disconnected island.',
    badge: 'Benchmark',
    defaultSourceId: 'node-fs1',
    defaultDestId: 'node-amb',
    expectedDistance: 11.4,
    expectedPath: [
      'Metro Fire Station #1',
      'Northbridge Crossing',
      'Mercy Memorial Clinic',
      'Station 9 Rescue Squad',
      'Southside Ambulance Station',
    ],
    graph: DEFAULT_CITY_GRAPH,
  },
];


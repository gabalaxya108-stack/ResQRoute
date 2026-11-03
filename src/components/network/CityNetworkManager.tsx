import React, { useState, useMemo } from 'react';
import { useGraph } from '../../context/GraphContext';
import { NodeCategory } from '../../types/graph';
import {
  Plus,
  Trash2,
  Edit2,
  Search,
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  MapPin,
  Route,
  FileJson,
  FileSpreadsheet,
  X,
} from 'lucide-react';

const CATEGORIES: NodeCategory[] = [
  'Hospital',
  'Fire Station',
  'Ambulance Post',
  'Police Station',
  'Emergency Incident',
  'Intersection',
  'Residential',
  'Commercial',
  'Industrial',
];

export const CityNetworkManager: React.FC = () => {
  const {
    graph,
    addNode,
    updateNode,
    deleteNode,
    addRoad,
    updateRoad,
    deleteRoad,
    importJSON,
    exportJSON,
    exportCSV,
  } = useGraph();

  // Search and Filter State
  const [nodeSearch, setNodeSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'nodes' | 'roads' | 'io'>('nodes');

  // Form Modals / Drawers
  const [showAddNodeModal, setShowAddNodeModal] = useState(false);
  const [showAddRoadModal, setShowAddRoadModal] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingRoadId, setEditingRoadId] = useState<string | null>(null);

  // New Node State
  const [newNodeName, setNewNodeName] = useState('');
  const [newNodeCategory, setNewNodeCategory] = useState<NodeCategory>('Intersection');
  const [newNodeNotes, setNewNodeNotes] = useState('');
  const [newNodeX, setNewNodeX] = useState<number>(300);
  const [newNodeY, setNewNodeY] = useState<number>(200);

  // New Road State
  const [newRoadSource, setNewRoadSource] = useState('');
  const [newRoadTarget, setNewRoadTarget] = useState('');
  const [newRoadName, setNewRoadName] = useState('');
  const [newRoadDistance, setNewRoadDistance] = useState<number>(3.0);
  const [newRoadTime, setNewRoadTime] = useState<number>(4.5);
  const [newRoadSpeed, setNewRoadSpeed] = useState<number>(50);
  const [newRoadOneWay, setNewRoadOneWay] = useState<boolean>(false);

  // Status/Alert Feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // File Upload State
  const [jsonInput, setJsonInput] = useState('');

  const nodeMap = useMemo(() => new Map(graph.nodes.map(n => [n.id, n])), [graph.nodes]);

  // Filtered Nodes
  const filteredNodes = useMemo(() => {
    return graph.nodes.filter(node => {
      const matchesSearch = node.name.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        node.category.toLowerCase().includes(nodeSearch.toLowerCase()) ||
        (node.notes && node.notes.toLowerCase().includes(nodeSearch.toLowerCase()));
      const matchesCat = categoryFilter === 'ALL' || node.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [graph.nodes, nodeSearch, categoryFilter]);

  // Handle Add Node
  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName.trim()) {
      setStatusMessage({ type: 'error', text: 'Location name is required.' });
      return;
    }
    try {
      addNode({
        name: newNodeName.trim(),
        category: newNodeCategory,
        notes: newNodeNotes.trim(),
        x: Number(newNodeX) || 200,
        y: Number(newNodeY) || 200,
      });
      setShowAddNodeModal(false);
      setNewNodeName('');
      setNewNodeNotes('');
      setStatusMessage({ type: 'success', text: `Location "${newNodeName}" created successfully.` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create location.' });
    }
  };

  // Handle Add Road
  const handleCreateRoad = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoadSource || !newRoadTarget) {
      setStatusMessage({ type: 'error', text: 'Select both origin and destination locations for the road.' });
      return;
    }
    if (newRoadSource === newRoadTarget) {
      setStatusMessage({ type: 'error', text: 'Self-loops are not allowed (origin cannot equal destination).' });
      return;
    }
    if (newRoadDistance < 0 || newRoadTime < 0) {
      setStatusMessage({ type: 'error', text: 'Negative weights are strictly prohibited in Dijkstra networks.' });
      return;
    }

    try {
      addRoad({
        source: newRoadSource,
        target: newRoadTarget,
        roadName: newRoadName.trim() || `${nodeMap.get(newRoadSource)?.name} - ${nodeMap.get(newRoadTarget)?.name} Link`,
        distance: Number(newRoadDistance),
        travelTime: Number(newRoadTime),
        speedLimit: Number(newRoadSpeed) || 50,
        isOneWay: newRoadOneWay,
      });
      setShowAddRoadModal(false);
      setNewRoadName('');
      setStatusMessage({ type: 'success', text: 'Road created and integrated into graph.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create road.' });
    }
  };

  // Export handlers
  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(exportJSON());
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'resqroute_city_graph.json');
    dlAnchor.click();
  };

  const handleDownloadCSV = () => {
    const { nodesCsv, edgesCsv } = exportCSV();
    // Download nodes
    const dl1 = document.createElement('a');
    dl1.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(nodesCsv));
    dl1.setAttribute('download', 'resqroute_locations.csv');
    dl1.click();

    // Download edges
    setTimeout(() => {
      const dl2 = document.createElement('a');
      dl2.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(edgesCsv));
      dl2.setAttribute('download', 'resqroute_roads.csv');
      dl2.click();
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="bg-white rounded-xl border border-resq-border p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-resq-text tracking-tight flex items-center gap-2">
            <MapPin className="w-5 h-5 text-resq-primary" />
            City Road Network Manager
          </h2>
          <p className="text-xs text-resq-muted mt-1">
            Configure locations, manage bidirectional/one-way arterial connections, and set road weights
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddNodeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
          <button
            onClick={() => setShowAddRoadModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-resq-text border border-resq-border rounded-lg text-xs font-semibold hover:bg-resq-bg shadow-sm transition-all"
          >
            <Route className="w-4 h-4 text-resq-primary" />
            <span>Add Road</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
            statusMessage.type === 'success'
              ? 'bg-resq-success-light border-resq-success/30 text-resq-success'
              : 'bg-resq-emergency-light border-resq-emergency/30 text-resq-emergency'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
            )}
            <span className="font-medium">{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="p-1 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Sub-Tabs: Locations Table, Roads Table, Import/Export */}
      <div className="flex items-center gap-2 border-b border-resq-border pb-2">
        <button
          onClick={() => setActiveTab('nodes')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'nodes'
              ? 'bg-white border border-resq-border text-resq-primary shadow-subtle'
              : 'text-resq-muted hover:text-resq-text'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Locations ({graph.nodes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roads')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'roads'
              ? 'bg-white border border-resq-border text-resq-primary shadow-subtle'
              : 'text-resq-muted hover:text-resq-text'
          }`}
        >
          <Route className="w-4 h-4" />
          <span>Roads ({graph.edges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('io')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === 'io'
              ? 'bg-white border border-resq-border text-resq-primary shadow-subtle'
              : 'text-resq-muted hover:text-resq-text'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Import / Export</span>
        </button>
      </div>

      {/* TAB 1: LOCATIONS TABLE */}
      {activeTab === 'nodes' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-resq-border shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-resq-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search location by name or note..."
                value={nodeSearch}
                onChange={e => setNodeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-resq-bg border border-resq-border rounded-lg text-resq-text focus:outline-none focus:ring-1 focus:ring-resq-primary"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-resq-muted">Category:</span>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="text-xs bg-resq-bg border border-resq-border rounded-lg px-2.5 py-1.5 text-resq-text focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Locations Table */}
          <div className="bg-white rounded-xl border border-resq-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-resq-border text-resq-muted font-medium uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Location Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Coordinates (X, Y)</th>
                    <th className="py-3 px-4">Connected Roads</th>
                    <th className="py-3 px-4">Notes / Details</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-resq-border">
                  {filteredNodes.map(node => {
                    const connectedRoadsCount = graph.edges.filter(
                      e => e.source === node.id || e.target === node.id
                    ).length;

                    const isEditing = editingNodeId === node.id;

                    return (
                      <tr key={node.id} className="hover:bg-resq-bg/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-resq-text">
                          {isEditing ? (
                            <input
                              type="text"
                              defaultValue={node.name}
                              onBlur={e => {
                                updateNode(node.id, { name: e.target.value });
                                setEditingNodeId(null);
                              }}
                              className="px-2 py-1 border border-resq-primary rounded text-xs bg-white w-full"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingNodeId(node.id)}
                              className="cursor-pointer hover:text-resq-primary"
                              title="Click to inline edit"
                            >
                              {node.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-resq-primary-light text-resq-primary">
                            {node.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-resq-muted">
                          ({node.x}, {node.y})
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-resq-text">
                          {connectedRoadsCount} connections
                        </td>
                        <td className="py-3 px-4 text-resq-muted max-w-xs truncate">
                          {node.notes || '—'}
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setEditingNodeId(node.id)}
                            className="p-1.5 text-resq-muted hover:text-resq-primary rounded hover:bg-resq-bg"
                            title="Edit Location Name"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete location "${node.name}" and all its connected roads?`)) {
                                deleteNode(node.id);
                                setStatusMessage({ type: 'success', text: `Removed "${node.name}" and cleaned up roads.` });
                              }
                            }}
                            className="p-1.5 text-resq-muted hover:text-resq-emergency rounded hover:bg-resq-emergency-light"
                            title="Delete Location"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredNodes.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-resq-muted">
                        No locations matched your search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROADS TABLE */}
      {activeTab === 'roads' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-resq-border shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-resq-border text-resq-muted font-medium uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Road Name</th>
                    <th className="py-3 px-4">From Location</th>
                    <th className="py-3 px-4">To Location</th>
                    <th className="py-3 px-4">Distance (Weight 1)</th>
                    <th className="py-3 px-4">Travel Time (Weight 2)</th>
                    <th className="py-3 px-4">Speed Limit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-resq-border">
                  {graph.edges.map(edge => {
                    const fromNode = nodeMap.get(edge.source);
                    const toNode = nodeMap.get(edge.target);
                    const isEditing = editingRoadId === edge.id;

                    return (
                      <tr key={edge.id} className="hover:bg-resq-bg/60 transition-colors">
                        <td className="py-3 px-4 font-semibold text-resq-text">
                          {edge.roadName}
                        </td>
                        <td className="py-3 px-4 font-medium text-resq-primary">
                          {fromNode?.name || edge.source}
                        </td>
                        <td className="py-3 px-4 font-medium text-resq-primary">
                          {toNode?.name || edge.target}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              defaultValue={edge.distance}
                              onBlur={e => {
                                const val = parseFloat(e.target.value);
                                if (val >= 0) {
                                  updateRoad(edge.id, { distance: val });
                                }
                                setEditingRoadId(null);
                              }}
                              className="w-20 px-1 py-0.5 border border-resq-primary rounded text-xs bg-white"
                              autoFocus
                            />
                          ) : (
                            <span
                              onClick={() => setEditingRoadId(edge.id)}
                              className="cursor-pointer hover:underline text-resq-text font-bold"
                              title="Click to edit distance"
                            >
                              {edge.distance.toFixed(1)} km
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-resq-muted">
                          {edge.travelTime.toFixed(1)} min
                        </td>
                        <td className="py-3 px-4 font-mono text-resq-muted">
                          {edge.speedLimit || 50} km/h
                        </td>
                        <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => setEditingRoadId(edge.id)}
                            className="p-1.5 text-resq-muted hover:text-resq-primary rounded hover:bg-resq-bg"
                            title="Edit Road Distance"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove road "${edge.roadName}"?`)) {
                                deleteRoad(edge.id);
                                setStatusMessage({ type: 'success', text: `Removed road "${edge.roadName}".` });
                              }
                            }}
                            className="p-1.5 text-resq-muted hover:text-resq-emergency rounded hover:bg-resq-emergency-light"
                            title="Delete Road"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {graph.edges.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-resq-muted">
                        No roads exist in the graph. Click "Add Road" above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: IMPORT & EXPORT */}
      {activeTab === 'io' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-4">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <Download className="w-4 h-4 text-resq-primary" />
              Export Network Dataset
            </h3>
            <p className="text-xs text-resq-muted">
              Download the active weighted graph configuration for offline backup, analysis in Python/NetworkX, or academic evaluation.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={handleDownloadJSON}
                className="flex items-center gap-2 px-4 py-2.5 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover shadow-sm transition-all"
              >
                <FileJson className="w-4 h-4" />
                <span>Download JSON Graph</span>
              </button>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white text-resq-text border border-resq-border rounded-lg text-xs font-semibold hover:bg-resq-bg shadow-sm transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Download CSV Datasets</span>
              </button>
            </div>
          </div>

          {/* Import JSON Section */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <Upload className="w-4 h-4 text-resq-primary" />
              Import Graph (JSON Format)
            </h3>
            <p className="text-xs text-resq-muted">
              Paste a valid JSON graph representation containing `nodes` and `edges` arrays. Negative weights will be rejected.
            </p>

            <textarea
              rows={4}
              placeholder='{"nodes": [...], "edges": [...]}'
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
              className="w-full p-2.5 text-xs font-mono bg-resq-bg border border-resq-border rounded-lg focus:outline-none focus:ring-1 focus:ring-resq-primary"
            />

            <button
              onClick={() => {
                if (!jsonInput.trim()) {
                  setStatusMessage({ type: 'error', text: 'Paste JSON content before submitting.' });
                  return;
                }
                const res = importJSON(jsonInput);
                if (res.success) {
                  setStatusMessage({ type: 'success', text: 'JSON graph successfully imported and rendered.' });
                  setJsonInput('');
                } else {
                  setStatusMessage({ type: 'error', text: res.error || 'Import failed.' });
                }
              }}
              className="px-4 py-2 bg-resq-primary text-white rounded-lg text-xs font-semibold hover:bg-resq-primary-hover transition-all"
            >
              Parse & Load Graph
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD LOCATION */}
      {showAddNodeModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-resq-border shadow-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-resq-border">
              <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
                <MapPin className="w-4 h-4 text-resq-primary" />
                Create New Location
              </h3>
              <button onClick={() => setShowAddNodeModal(false)} className="text-resq-muted hover:text-resq-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNode} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-resq-text block mb-1">Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North Triage Center"
                  value={newNodeName}
                  onChange={e => setNewNodeName(e.target.value)}
                  className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg focus:outline-none focus:ring-1 focus:ring-resq-primary"
                />
              </div>

              <div>
                <label className="font-medium text-resq-text block mb-1">Category</label>
                <select
                  value={newNodeCategory}
                  onChange={e => setNewNodeCategory(e.target.value as NodeCategory)}
                  className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg focus:outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-resq-text block mb-1">Canvas X Coordinate</label>
                  <input
                    type="number"
                    value={newNodeX}
                    onChange={e => setNewNodeX(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-medium text-resq-text block mb-1">Canvas Y Coordinate</label>
                  <input
                    type="number"
                    value={newNodeY}
                    onChange={e => setNewNodeY(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-resq-text block mb-1">Operational Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Emergency triage bay with oxygen supply"
                  value={newNodeNotes}
                  onChange={e => setNewNodeNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-resq-border">
                <button
                  type="button"
                  onClick={() => setShowAddNodeModal(false)}
                  className="px-3 py-2 text-resq-muted hover:text-resq-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-resq-primary text-white rounded-lg font-semibold hover:bg-resq-primary-hover shadow-sm"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ROAD */}
      {showAddRoadModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-resq-border shadow-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-resq-border">
              <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
                <Route className="w-4 h-4 text-resq-primary" />
                Connect New Road
              </h3>
              <button onClick={() => setShowAddRoadModal(false)} className="text-resq-muted hover:text-resq-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoad} className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-resq-text block mb-1">Road / Corridor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Grand Parkway"
                  value={newRoadName}
                  onChange={e => setNewRoadName(e.target.value)}
                  className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-resq-text block mb-1">Origin Location *</label>
                  <select
                    required
                    value={newRoadSource}
                    onChange={e => setNewRoadSource(e.target.value)}
                    className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  >
                    <option value="">Select origin...</option>
                    {graph.nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-medium text-resq-text block mb-1">Destination Location *</label>
                  <select
                    required
                    value={newRoadTarget}
                    onChange={e => setNewRoadTarget(e.target.value)}
                    className="w-full px-3 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  >
                    <option value="">Select destination...</option>
                    {graph.nodes.map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-resq-text block mb-1">Distance (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={newRoadDistance}
                    onChange={e => setNewRoadDistance(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-medium text-resq-text block mb-1">Time (min) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={newRoadTime}
                    onChange={e => setNewRoadTime(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-medium text-resq-text block mb-1">Speed (km/h)</label>
                  <input
                    type="number"
                    step="5"
                    min="10"
                    value={newRoadSpeed}
                    onChange={e => setNewRoadSpeed(parseInt(e.target.value) || 50)}
                    className="w-full px-2.5 py-2 bg-resq-bg border border-resq-border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="oneway-check"
                  checked={newRoadOneWay}
                  onChange={e => setNewRoadOneWay(e.target.checked)}
                  className="rounded text-resq-primary"
                />
                <label htmlFor="oneway-check" className="text-resq-text text-xs cursor-pointer">
                  One-way directional road (strict Source → Target)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-resq-border">
                <button
                  type="button"
                  onClick={() => setShowAddRoadModal(false)}
                  className="px-3 py-2 text-resq-muted hover:text-resq-text"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-resq-primary text-white rounded-lg font-semibold hover:bg-resq-primary-hover shadow-sm"
                >
                  Add Road to Graph
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

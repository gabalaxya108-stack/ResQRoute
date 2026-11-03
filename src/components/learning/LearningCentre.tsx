import React, { useState } from 'react';
import {
  VIVA_QUESTIONS,
  PSEUDOCODE,
  COMPARISON_MATRIX,
} from '../../data/educationalContent';
import {
  GraduationCap,
  BookOpen,
  HelpCircle,
  Code,
  Table,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Binary,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const LearningCentre: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'theory' | 'viva' | 'code' | 'comparison' | 'negative'>('theory');
  const [expandedViva, setExpandedViva] = useState<Record<number, boolean>>({ 0: true, 1: true });
  const [copiedCode, setCopiedCode] = useState(false);

  const toggleViva = (index: number) => {
    setExpandedViva(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyPseudocode = () => {
    navigator.clipboard.writeText(PSEUDOCODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-resq-border p-5 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-resq-primary" />
            <h2 className="text-lg font-bold text-resq-text tracking-tight">
              DSA-II Academic Learning Centre
            </h2>
          </div>
          <p className="text-xs text-resq-muted mt-1">
            Comprehensive curriculum, mathematical relaxation proofs, complexity analysis, and Viva Voce preparation
          </p>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 bg-resq-bg p-1 rounded-lg border border-resq-border overflow-x-auto">
          {[
            { id: 'theory', label: 'Theory & Proofs', icon: BookOpen },
            { id: 'negative', label: 'Negative Weights Flaw', icon: AlertTriangle },
            { id: 'comparison', label: 'Algorithm Comparison', icon: Table },
            { id: 'code', label: 'Pseudocode & C++', icon: Code },
            { id: 'viva', label: 'Viva Voce (12 Q&A)', icon: HelpCircle },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-resq-primary shadow-subtle'
                    : 'text-resq-muted hover:text-resq-text'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: THEORY & CORE CONCEPTS */}
      {activeTab === 'theory' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Greedy Strategy & Optimal Substructure */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <Binary className="w-4 h-4 text-resq-primary" />
              1. Greedy Choice Property & Optimal Substructure
            </h3>
            <p className="text-xs text-resq-muted leading-relaxed">
              Dijkstra's Algorithm operates on the fundamental principle that any subpath of a shortest path between two vertices is itself a shortest path between those intermediate vertices (<strong>Optimal Substructure</strong>).
            </p>
            <div className="p-3 bg-resq-bg rounded-lg border border-resq-border text-xs space-y-2">
              <div className="font-semibold text-resq-text">The Greedy Invariant:</div>
              <p className="text-resq-muted leading-relaxed">
                At each step, we extract the vertex <code className="text-resq-primary font-mono font-bold">u</code> with minimum tentative distance from the Min-Heap. Because all edge weights are non-negative (<code className="font-mono">w(u, v) ≥ 0</code>), no subsequent path can ever arrive at <code className="font-mono">u</code> with a lower cost. Thus, its tentative distance becomes permanent.
              </p>
            </div>
          </div>

          {/* Card 2: Edge Relaxation Principle */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <Layers className="w-4 h-4 text-resq-primary" />
              2. Edge Relaxation Mathematical Formulation
            </h3>
            <p className="text-xs text-resq-muted leading-relaxed">
              Relaxing an edge <code className="font-mono">(u, v)</code> with weight <code className="font-mono">w</code> tests whether traveling from source to <code className="font-mono">v</code> via <code className="font-mono">u</code> yields a shorter path than the current known distance to <code className="font-mono">v</code>:
            </p>
            <div className="p-3 bg-resq-primary-light/50 rounded-lg border border-resq-primary/20 text-xs font-mono space-y-1 text-resq-primary">
              <div className="font-bold text-resq-text">Relaxation Equation:</div>
              <div>if dist[u] + w(u, v) &lt; dist[v]:</div>
              <div className="pl-4">dist[v] = dist[u] + w(u, v)</div>
              <div className="pl-4">parent[v] = u</div>
              <div className="pl-4">PQ.push(v, dist[v])</div>
            </div>
            <p className="text-[11px] text-resq-muted">
              Upper bound tightening: <code className="font-mono">dist[v]</code> is monotonically non-increasing and eventually converges to <code className="font-mono">δ(source, v)</code>.
            </p>
          </div>

          {/* Card 3: Time & Space Complexity Derivation */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <Table className="w-4 h-4 text-resq-primary" />
              3. Time and Space Complexity Proof
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-resq-bg border border-resq-border">
                <span className="font-medium text-resq-text">Heap Insertions (Push):</span>
                <span className="font-mono font-bold text-resq-primary">O(V log V)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-resq-bg border border-resq-border">
                <span className="font-medium text-resq-text">Heap Extractions (Pop Min):</span>
                <span className="font-mono font-bold text-resq-primary">O(V log V)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-resq-bg border border-resq-border">
                <span className="font-medium text-resq-text">Edge Relaxations (Decrease-Key):</span>
                <span className="font-mono font-bold text-resq-primary">O(E log V)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-resq-primary-light font-bold text-resq-primary border border-resq-primary/20">
                <span>Total Time Complexity:</span>
                <span className="font-mono text-sm">O((V + E) log V)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded bg-resq-bg font-semibold text-resq-text border border-resq-border">
                <span>Auxiliary Space Complexity:</span>
                <span className="font-mono">O(V + E)</span>
              </div>
            </div>
          </div>

          {/* Card 4: Path Reconstruction */}
          <div className="bg-white p-5 rounded-xl border border-resq-border shadow-subtle space-y-3">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-resq-primary" />
              4. Path Reconstruction via Parent Backtracking
            </h3>
            <p className="text-xs text-resq-muted leading-relaxed">
              Dijkstra calculates shortest distance values, but emergency responders require the explicit turn-by-turn road itinerary. This is achieved by maintaining a <strong>predecessor array</strong> <code className="font-mono">parent[]</code>:
            </p>
            <ol className="list-decimal list-inside text-xs text-resq-muted space-y-1.5 pl-1">
              <li>Start at destination vertex: <code className="font-mono text-resq-text">curr = target</code></li>
              <li>Push <code className="font-mono text-resq-text">curr</code> to path vector while <code className="font-mono text-resq-text">curr ≠ source</code></li>
              <li>Traverse backwards: <code className="font-mono text-resq-text">curr = parent[curr]</code></li>
              <li>Reverse the vector to yield <code className="font-mono text-resq-text">[source → ... → target]</code> in <code className="font-mono text-resq-primary font-bold">O(V)</code> time.</li>
            </ol>
          </div>
        </div>
      )}

      {/* TAB 2: NEGATIVE WEIGHTS FLAW */}
      {activeTab === 'negative' && (
        <div className="bg-white p-6 rounded-xl border border-resq-border shadow-subtle space-y-5">
          <div>
            <h3 className="text-base font-bold text-resq-emergency flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-resq-emergency" />
              Why Dijkstra's Algorithm Fails with Negative Edge Weights
            </h3>
            <p className="text-xs text-resq-muted mt-1 leading-relaxed">
              Dijkstra makes an irrevocable greedy assumption: once a vertex is settled, its shortest path is permanently fixed. Negative weights violate this assumption!
            </p>
          </div>

          {/* Concrete Counterexample Diagram */}
          <div className="p-4 bg-resq-bg rounded-xl border border-resq-border space-y-3">
            <div className="text-xs font-bold text-resq-text uppercase tracking-wider">
              Concrete Counterexample Graph:
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3 bg-white rounded-lg border border-resq-border">
                <div className="font-bold text-resq-primary mb-1">Graph Structure:</div>
                <div>A → B (weight: 5)</div>
                <div>A → C (weight: 2)</div>
                <div>C → B (weight: -4)</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-resq-border">
                <div className="font-bold text-resq-emergency mb-1">What Dijkstra Does:</div>
                <div>1. Settles C with dist[C] = 2</div>
                <div>2. Settles B with dist[B] = 5 (Greedy choice!)</div>
                <div>3. Never re-examines B because B is marked settled!</div>
                <div className="text-resq-emergency font-bold mt-1">Dijkstra Output: dist[B] = 5 ❌</div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-resq-border">
                <div className="font-bold text-resq-success mb-1">True Shortest Path:</div>
                <div>Path: A → C → B</div>
                <div>Cost: 2 + (-4) = -2</div>
                <div>-2 &lt; 5</div>
                <div className="text-resq-success font-bold mt-1">True Optimal: dist[B] = -2 ✅</div>
              </div>
            </div>
          </div>

          {/* Academic Conclusion */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold">Academic Conclusion:</div>
            <p className="leading-relaxed">
              If a graph has negative edge weights, Dijkstra's algorithm cannot be used even if there are no negative cycles. Instead, the <strong>Bellman-Ford Algorithm</strong> (<code className="font-mono">O(V · E)</code>) or the Floyd-Warshall algorithm (<code className="font-mono">O(V³)</code>) must be employed.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ALGORITHM COMPARISON MATRIX */}
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-xl border border-resq-border shadow-subtle overflow-hidden">
          <div className="p-4 bg-[#F8FAFC] border-b border-resq-border">
            <h3 className="text-sm font-bold text-resq-text uppercase tracking-wider">
              Shortest Path Algorithm Taxonomy & Comparison
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] border-b border-resq-border text-resq-muted text-[10px] uppercase font-medium">
                <tr>
                  <th className="py-3 px-4">Algorithm</th>
                  <th className="py-3 px-4">Edge Weights</th>
                  <th className="py-3 px-4">Time Complexity</th>
                  <th className="py-3 px-4">Space Complexity</th>
                  <th className="py-3 px-4">Handles Negative?</th>
                  <th className="py-3 px-4">Primary Application</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-resq-border text-resq-text">
                {COMPARISON_MATRIX.map((row, idx) => (
                  <tr key={idx} className={row.algorithm.includes('Dijkstra') ? 'bg-resq-primary-light/30' : 'hover:bg-resq-bg'}>
                    <td className="py-3 px-4 font-bold text-resq-primary">{row.algorithm}</td>
                    <td className="py-3 px-4 text-resq-muted">{row.weights}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{row.timeComplexity}</td>
                    <td className="py-3 px-4 font-mono text-resq-muted">{row.spaceComplexity}</td>
                    <td className="py-3 px-4 font-semibold">
                      <span className={row.negativeWeights.startsWith('YES') ? 'text-resq-success font-bold' : 'text-resq-emergency'}>
                        {row.negativeWeights}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-resq-muted text-[11px]">{row.useCase}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PSEUDOCODE & C++17 IMPLEMENTATION */}
      {activeTab === 'code' && (
        <div className="bg-white rounded-xl border border-resq-border shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-resq-border">
            <div>
              <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
                <Code className="w-4 h-4 text-resq-primary" />
                Standard Dijkstra Pseudocode (CLRS Specification)
              </h3>
              <p className="text-xs text-resq-muted mt-0.5">
                Exact algorithmic definition matching our C++17 and TypeScript implementations
              </p>
            </div>
            <button
              onClick={copyPseudocode}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-resq-bg hover:bg-resq-border text-resq-text rounded-lg text-xs font-semibold border border-resq-border transition-all"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-resq-success" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <pre className="p-4 bg-[#0F121C] text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed shadow-inner">
            {PSEUDOCODE}
          </pre>

          <div className="p-3 bg-resq-bg rounded-lg border border-resq-border text-xs text-resq-muted flex items-center justify-between">
            <span>Standalone C++17 implementation located at: <code className="text-resq-primary font-mono font-semibold">cpp/main.cpp</code></span>
            <span className="font-mono text-[11px]">Compile with: clang++ -std=c++17 cpp/main.cpp -o resqroute</span>
          </div>
        </div>
      )}

      {/* TAB 5: VIVA VOCE QUESTIONS (12 ACCREDITED QUESTIONS) */}
      {activeTab === 'viva' && (
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-resq-border shadow-subtle mb-4">
            <h3 className="text-sm font-bold text-resq-text flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-resq-primary" />
              DSA-II Viva Voce Oral Defense Bank (12 Core Questions)
            </h3>
            <p className="text-xs text-resq-muted mt-1">
              Curated examination questions and answers evaluating theoretical depth, edge cases, and algorithmic complexity.
            </p>
          </div>

          {VIVA_QUESTIONS.map((q, idx) => {
            const isExpanded = !!expandedViva[idx];
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-resq-border shadow-subtle overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleViva(idx)}
                  className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-resq-bg/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-resq-primary-light text-resq-primary font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-resq-text">{q.question}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-resq-bg text-resq-muted uppercase">
                      {q.category}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-resq-muted" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-resq-muted" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-resq-muted leading-relaxed border-t border-resq-border/60 bg-[#FAFAFC]">
                    <div className="whitespace-pre-line pl-7 text-resq-text">
                      {q.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


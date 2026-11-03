import React from 'react';
import {
  LayoutDashboard,
  Network,
  Navigation,
  Cpu,
  FlaskConical,
  GraduationCap,
  FileText,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { useGraph } from '../../context/GraphContext';

export type TabType =
  | 'overview'
  | 'network'
  | 'planner'
  | 'lab'
  | 'testing'
  | 'learning'
  | 'reports';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { graph, currentRoute, resetToDefault } = useGraph();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'network', label: 'City Network', icon: Network },
    { id: 'planner', label: 'Route Planner', icon: Navigation },
    { id: 'lab', label: 'Algorithm Lab', icon: Cpu },
    { id: 'testing', label: 'Testing Lab', icon: FlaskConical },
    { id: 'learning', label: 'Learning Centre', icon: GraduationCap },
    { id: 'reports', label: 'Reports', icon: FileText },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-md border-b border-resq-border transition-all shadow-[0_1px_3px_0_rgba(20,33,61,0.02)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Identity */}
          <div
            onClick={() => setActiveTab('overview')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="flex items-center justify-center w-8.5 h-8.5 rounded-lg bg-resq-navy text-white shadow-xs group-hover:bg-resq-primary transition-colors">
              <Navigation className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[15px] tracking-tight text-resq-text">
                  ResQ<span className="text-resq-primary">Route</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-resq-primary-light text-resq-primary uppercase tracking-wider border border-resq-primary/15">
                  OPERATIONS
                </span>
              </div>
              <p className="text-[10.5px] text-resq-muted hidden xl:block font-medium">
                Intelligent Emergency Services Routing System
              </p>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all ${
                    isActive
                      ? 'bg-resq-primary text-white shadow-xs'
                      : 'text-resq-muted hover:text-resq-text hover:bg-resq-bg'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status / Telemetry Badges */}
          <div className="flex items-center gap-2">
            {/* Live Operational Status */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-resq-bg border border-resq-border text-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-resq-muted font-mono text-[11px] tabular-nums font-medium">
                {graph.nodes.length} nodes • {graph.edges.length} roads
              </span>
            </div>

            {currentRoute && currentRoute.reachable && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-resq-success-light text-resq-success text-[11px] font-bold border border-resq-success/20 tabular-nums">
                <Activity className="w-3 h-3" />
                <span>
                  {currentRoute.totalWeight.toFixed(1)} {currentRoute.weightMode === 'distance' ? 'km' : 'min'}
                </span>
              </div>
            )}

            <button
              onClick={resetToDefault}
              title="Reset to Default City Road Network"
              className="p-1.5 px-2.5 text-resq-muted hover:text-resq-text bg-white hover:bg-resq-bg rounded-lg border border-resq-border transition-all text-xs flex items-center gap-1.5 font-medium shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-resq-muted" />
              <span className="hidden sm:inline text-[11px]">Reset</span>
            </button>
          </div>
        </div>

        {/* Medium and Mobile Horizontal Nav Scroll */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-resq-border/60 no-scrollbar">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-resq-primary text-white shadow-xs'
                    : 'text-resq-muted hover:text-resq-text bg-resq-bg/60'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

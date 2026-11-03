import React, { useState } from 'react';
import { GraphProvider } from './context/GraphContext';
import { Navbar, TabType } from './components/layout/Navbar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { CityNetworkManager } from './components/network/CityNetworkManager';
import { RoutePlanner } from './components/planner/RoutePlanner';
import { AlgorithmLab } from './components/algorithm/AlgorithmLab';
import { TestingLab } from './components/testing/TestingLab';
import { LearningCentre } from './components/learning/LearningCentre';
import { AcademicReport } from './components/reports/AcademicReport';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const hash = window.location.hash.replace('#', '') as TabType;
    const validTabs: TabType[] = ['overview', 'network', 'planner', 'lab', 'testing', 'learning', 'reports'];
    return validTabs.includes(hash) ? hash : 'overview';
  });

  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      const validTabs: TabType[] = ['overview', 'network', 'planner', 'lab', 'testing', 'learning', 'reports'];
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="min-h-screen bg-resq-bg flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <OverviewDashboard onNavigate={handleTabChange} />}
        {activeTab === 'network' && <CityNetworkManager />}
        {activeTab === 'planner' && <RoutePlanner />}
        {activeTab === 'lab' && <AlgorithmLab />}
        {activeTab === 'testing' && <TestingLab />}
        {activeTab === 'learning' && <LearningCentre />}
        {activeTab === 'reports' && <AcademicReport />}
      </main>

      {/* Persistent Academic Footer */}
      <footer className="bg-white border-t border-resq-border py-4 mt-auto no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-resq-muted gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-resq-text">ResQRoute</span>
            <span>•</span>
            <span>Intelligent Emergency Services Routing System</span>
            <span>•</span>
            <span className="font-mono text-[11px] bg-resq-bg px-2 py-0.5 rounded border border-resq-border">
              DSA-II Academic Project
            </span>
          </div>
          <div className="font-mono text-[11px]">
            Dijkstra's Algorithm \(O((V + E) \log V)\) • C++17 & React TypeScript
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GraphProvider>
      <AppContent />
    </GraphProvider>
  );
};

export default App;


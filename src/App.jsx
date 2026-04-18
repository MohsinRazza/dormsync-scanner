import { useState, useCallback } from 'react';
import { clearSession } from './utils/auth';
import { toast } from './components/ui/toast';
import { useAuthSession } from './hooks/useAuthSession';
import { useMobileLayout } from './hooks/useMobileLayout';
import { useScanDataset } from './hooks/useScanDataset';
import { AppShell } from './components/layout/AppShell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Reports from './pages/Reports';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUnique, setShowUnique] = useState(false);

  const { isAuthenticated, setIsAuthenticated } = useAuthSession(
    activeTab,
    setActiveTab
  );

  const {
    isMobile,
    sidebarCollapsed,
    setSidebarCollapsed,
    viewMode,
    setViewMode,
  } = useMobileLayout();

  const { logs, allotments, lastScan, loading } =
    useScanDataset(isAuthenticated);

  const handleLogin = useCallback(() => {
    setIsAuthenticated(true);
  }, [setIsAuthenticated]);

  const handleLogout = useCallback(() => {
    clearSession();
    setIsAuthenticated(false);
    setActiveTab('dashboard');
    toast.success('Logged out successfully');
  }, [setIsAuthenticated]);

  const toggleUnique = useCallback(() => {
    setShowUnique((v) => !v);
    toast.success(
      showUnique ? 'Showing all entries' : 'Showing unique entries'
    );
  }, [showUnique]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  if (activeTab !== 'dashboard') {
    return (
      <AppShell
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
      >
        {activeTab === 'students' && (
          <Students allotments={allotments} isMobile={isMobile} />
        )}
        {activeTab === 'reports' && (
          <Reports
            logs={logs}
            allotments={allotments}
            isMobile={isMobile}
            showUnique={showUnique}
            toggleUnique={toggleUnique}
          />
        )}
      </AppShell>
    );
  }

  return (
    <AppShell
      isMobile={isMobile}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
      onLogout={handleLogout}
    >
      <Dashboard
        logs={logs}
        allotments={allotments}
        lastScan={lastScan}
        loading={loading}
        isMobile={isMobile}
        showUnique={showUnique}
        onToggleUnique={toggleUnique}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
    </AppShell>
  );
};

export default App;

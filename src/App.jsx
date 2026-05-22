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
import { fetchLiveArrears, mergeArrearsIntoAllotments } from './services/liveArrearsService';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUnique, setShowUnique] = useState(false);
  const [dataSource, setDataSource] = useState('local');
  const [liveArrears, setLiveArrears] = useState(false);
  const [liveAllotments, setLiveAllotments] = useState(null);
  const [liveArrearsLoading, setLiveArrearsLoading] = useState(false);

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
    useScanDataset(isAuthenticated, dataSource);

  const toggleDataSource = useCallback(() => {
    setDataSource((prev) => (prev === 'local' ? 'remote' : 'local'));
  }, []);

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

  const toggleLiveArrears = useCallback(async () => {
    if (liveArrears) {
      // Switch back to local data
      setLiveArrears(false);
      toast.success('Showing local arrears data');
      return;
    }
    // Switch to live data — use cache if already fetched
    setLiveArrearsLoading(true);
    try {
      const arrearsMap = await fetchLiveArrears();
      const merged = mergeArrearsIntoAllotments(allotments, arrearsMap);
      setLiveAllotments(merged);
      setLiveArrears(true);
      toast.success('Live arrears data loaded');
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch live arrears. Make sure the sheet is publicly shared.');
    } finally {
      setLiveArrearsLoading(false);
    }
  }, [liveArrears, allotments]);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const activeAllotments = liveArrears && liveAllotments ? liveAllotments : allotments;

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
          <Students
            allotments={activeAllotments}
            isMobile={isMobile}
            liveArrears={liveArrears}
            liveArrearsLoading={liveArrearsLoading}
            onToggleLiveArrears={toggleLiveArrears}
          />
        )}
        {activeTab === 'reports' && (
          <Reports
            logs={logs}
            allotments={activeAllotments}
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
        allotments={activeAllotments}
        lastScan={lastScan}
        loading={loading}
        isMobile={isMobile}
        showUnique={showUnique}
        onToggleUnique={toggleUnique}
        viewMode={viewMode}
        setViewMode={setViewMode}
        dataSource={dataSource}
        toggleDataSource={toggleDataSource}
      />
    </AppShell>
  );
};

export default App;

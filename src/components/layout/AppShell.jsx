import { cn } from '../../lib/utils';
import Sidebar from '../Sidebar';

export function AppShell({
  isMobile,
  activeTab,
  setActiveTab,
  sidebarCollapsed,
  setSidebarCollapsed,
  onLogout,
  children,
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {!isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          onLogout={onLogout}
        />
      )}

      <div
        className={cn(
          'flex-1 flex flex-col overflow-hidden',
          isMobile && 'pb-16'
        )}
      >
        {children}
      </div>

      {isMobile && (
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          isMobile={isMobile}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

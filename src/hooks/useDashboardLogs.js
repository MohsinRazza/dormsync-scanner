import { useMemo } from 'react';
import {
  buildUniqueLogs,
  filterDashboardLogs,
  sortDashboardLogs,
  computeDashboardStats,
} from '../utils/dashboardLogUtils';

export function useDashboardLogs({
  logs,
  allotments,
  showUnique,
  searchTerm,
  filterTab,
  startDate,
  endDate,
  sortConfig,
}) {
  const uniqueLogs = useMemo(() => {
    if (!showUnique) return logs;
    return buildUniqueLogs(logs);
  }, [logs, showUnique]);

  const filteredLogs = useMemo(
    () =>
      filterDashboardLogs({
        logs,
        uniqueLogs,
        showUnique,
        startDate,
        endDate,
        filterTab,
        allotments,
        searchTerm,
      }),
    [
      logs,
      uniqueLogs,
      showUnique,
      searchTerm,
      filterTab,
      allotments,
      startDate,
      endDate,
    ]
  );

  const sortedLogs = useMemo(
    () => sortDashboardLogs(filteredLogs, sortConfig),
    [filteredLogs, sortConfig]
  );

  const stats = useMemo(
    () =>
      computeDashboardStats({
        logs,
        uniqueLogs,
        showUnique,
        allotments,
      }),
    [logs, uniqueLogs, showUnique, allotments]
  );

  return { uniqueLogs, filteredLogs, sortedLogs, stats };
}

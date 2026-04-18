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
  hideInvalid = true,
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
        hideInvalid,
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
      hideInvalid,
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
        hideInvalid,
      }),
    [logs, uniqueLogs, showUnique, allotments, hideInvalid]
  );

  return { uniqueLogs, filteredLogs, sortedLogs, stats };
}

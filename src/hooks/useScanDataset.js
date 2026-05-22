import { useState, useEffect, useCallback } from 'react';
import { toast } from '../components/ui/toast';
import {
  loadScanDataset,
  ScanDataParseError,
} from '../services/loadScanDataset';

export function useScanDataset(isAuthenticated, dataSource = 'local') {
  const [logs, setLogs] = useState([]);
  const [allotments, setAllotments] = useState({});
  const [lastScan, setLastScan] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const { allotments: nextAllotments, logs: nextLogs, lastScan: nextLast } =
        await loadScanDataset(dataSource);
      setAllotments(nextAllotments);
      setLogs(nextLogs);
      setLastScan(nextLast);
      toast.success('Data loaded successfully');
    } catch (err) {
      console.error(
        err instanceof ScanDataParseError ? 'CSV Parse Error:' : 'Fetch Error:',
        err
      );
      if (err instanceof ScanDataParseError) {
        toast.error('Failed to parse CSV data');
      } else {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  return { logs, allotments, lastScan, loading, loadData };
}

import moment from 'moment';
import { parseLogMoment } from './logDateTime';

export function buildUniqueLogs(logs) {
  const seen = new Set();
  return logs.filter((log) => {
    const key = log['QR Code'];
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function filterDashboardLogs({
  logs,
  uniqueLogs,
  showUnique,
  startDate,
  endDate,
  filterTab,
  allotments,
  searchTerm,
  hideInvalid = true,
}) {
  let filtered = showUnique ? uniqueLogs : logs;

  // Strip invalid entries (non-standard QR codes) unless user explicitly wants them
  if (hideInvalid) {
    const ROLL_NO_RE = /^\d{8}-\d{3}$/;
    filtered = filtered.filter((log) => ROLL_NO_RE.test(log['QR Code']?.trim() || ''));
  }

  if (startDate || endDate) {
    filtered = filtered.filter((log) => {
      const m = parseLogMoment(log.DateTime);
      if (!m.isValid()) return false;
      const logDate = m.format('YYYY-MM-DD');

      if (startDate && endDate) {
        return logDate >= startDate && logDate <= endDate;
      }
      if (startDate) {
        return logDate >= startDate;
      }
      if (endDate) {
        return logDate <= endDate;
      }
      return true;
    });
  }

  if (filterTab === 'late') {
    const lateEntryHour = parseInt(
      localStorage.getItem('lateEntryHour') || '22',
      10
    );
    filtered = filtered.filter((log) => {
      const hour = parseLogMoment(log.DateTime).hour();
      return hour >= lateEntryHour;
    });
  } else if (filterTab === 'boarder') {
    filtered = filtered.filter((log) => log.Status === 'Boarder');
  } else if (filterTab === 'non-boarder') {
    filtered = filtered.filter((log) => log.Status === 'Non-Boarder');
  } else if (filterTab === 'arrears') {
    // Show logs for students who have arrears
    filtered = filtered.filter((log) => {
      const student = allotments[log['QR Code']?.trim()];
      return student?.Arrears;
    });
  } else if (filterTab === 'missing') {
    const scannedRollNos = new Set(
      filtered.filter((l) => l.Status === 'Boarder').map((l) => l['QR Code'])
    );
    const missingBoarders = Object.values(allotments).filter(
      (student) => !scannedRollNos.has(student['Roll No.'])
    );
    return missingBoarders.map((student) => ({
      DateTime: 'Not Scanned',
      'QR Code': student['Roll No.'],
      Status: 'Absent',
      Name: student.Name,
      Hostel: student.Hostel,
      Room: student.Room,
    }));
  }

  if (searchTerm) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter((log) => {
      const name = log.Name || '';
      const rollNo = log['QR Code'] || '';
      return (
        name.toLowerCase().includes(q) || rollNo.toLowerCase().includes(q)
      );
    });
  }

  return filtered;
}

export function sortDashboardLogs(filteredLogs, sortConfig) {
  const sorted = [...filteredLogs];

  sorted.sort((a, b) => {
    let aValue;
    let bValue;

    switch (sortConfig.key) {
      case 'identity':
        aValue = a.Name || '';
        bValue = b.Name || '';
        break;
        case 'time':
          aValue = parseLogMoment(a.DateTime).valueOf();
          bValue = parseLogMoment(b.DateTime).valueOf();
        break;
      case 'room':
        aValue = a.Room || '';
        bValue = b.Room || '';
        break;
      case 'status':
        aValue = a.Status || '';
        bValue = b.Status || '';
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

export function computeDashboardStats({
  logs,
  uniqueLogs,
  showUnique,
  allotments,
  hideInvalid = true,
}) {
  const ROLL_NO_RE = /^\d{8}-\d{3}$/;
  let dataToAnalyze = showUnique ? uniqueLogs : logs;
  if (hideInvalid) {
    dataToAnalyze = dataToAnalyze.filter((l) => ROLL_NO_RE.test(l['QR Code']?.trim() || ''));
  }

  const totalScans = dataToAnalyze.length;
  const boarders = dataToAnalyze.filter((l) => l.Status === 'Boarder').length;
  const nonBoarders = dataToAnalyze.filter(
    (l) => l.Status === 'Non-Boarder'
  ).length;
  const invalid = dataToAnalyze.filter(
    (l) => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder'
  ).length;

  const scannedBoarderRollNos = new Set(
    dataToAnalyze
      .filter((l) => l.Status === 'Boarder')
      .map((l) => l['QR Code'])
  );
  const missingBoarders = Object.values(allotments).filter(
    (student) => !scannedBoarderRollNos.has(student['Roll No.'])
  ).length;

  const hourCounts = {};
  dataToAnalyze.forEach((log) => {
    const hour = parseLogMoment(log.DateTime).hour();
    if (!Number.isNaN(hour)) {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    }
  });

  let peakHour = 0;
  let maxCount = 0;
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count;
      peakHour = parseInt(hour, 10);
    }
  });

  const peakTime = moment().hour(peakHour).format('hh:00 A');

  return {
    totalScans,
    boarders,
    nonBoarders,
    invalid,
    missingBoarders,
    peakTime,
  };
}

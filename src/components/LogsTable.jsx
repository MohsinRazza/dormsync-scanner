import { UserCircle, ArrowUpDown } from 'lucide-react';
import { parseLogMoment } from '../utils/logDateTime';
import { Badge } from './ui/badge';

const LogsTable = ({ logs, allotments, onRowClick, sortConfig, onSort }) => {
  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="opacity-50" />;
    return <ArrowUpDown size={14} className={sortConfig.direction === 'asc' ? 'rotate-180' : ''} />;
  };

  const getStatusVariant = (status) => {
    if (status === 'Boarder') return 'success';
    if (status === 'Non-Boarder') return 'warning';
    return 'destructive';
  };

  const isLateEntry = (dateTime, lateEntryHour) => {
    const hour = parseLogMoment(dateTime).hour();
    return !Number.isNaN(hour) && hour >= lateEntryHour;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 border-b border-slate-200 dark:border-slate-800">
        <div className="grid grid-cols-12 gap-4 px-6 py-3">
          <div 
            onClick={() => onSort('identity')}
            className="col-span-4 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
          >
            Student Identity
            {getSortIcon('identity')}
          </div>
          <div 
            onClick={() => onSort('time')}
            className="col-span-3 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
          >
            Scan Time
            {getSortIcon('time')}
          </div>
          <div 
            onClick={() => onSort('room')}
            className="col-span-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
          >
            Hostel & Room
            {getSortIcon('room')}
          </div>
          <div 
            onClick={() => onSort('status')}
            className="col-span-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700 dark:hover:text-slate-300"
          >
            Status
            {getSortIcon('status')}
          </div>
          <div className="col-span-1 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Arrears
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="bg-white dark:bg-slate-950">
        {logs.map((log, i) => {
          const student = allotments[log['QR Code']?.trim()];
          const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
          const isLate = isLateEntry(log.DateTime, lateEntryHour);
          
          return (
            <div 
              key={i}
              onClick={() => onRowClick(log)}
              className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {/* Student Identity */}
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 dark:text-cyan-400 flex-shrink-0">
                  <UserCircle size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                    {student?.Name || 'Unregistered'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{log['QR Code']}</p>
                </div>
              </div>

              {/* Scan Time */}
              <div className="col-span-3 flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-900 dark:text-white">
                  {(() => {
                    const m = parseLogMoment(log.DateTime);
                    return m.isValid() ? m.format('hh:mm A') : '—';
                  })()}
                </span>
                <span className="text-xs text-slate-500">
                  {(() => {
                    const m = parseLogMoment(log.DateTime);
                    return m.isValid() ? m.format('DD MMM YYYY') : '—';
                  })()}
                </span>
                {isLate && (
                  <Badge variant="destructive" className="mt-1 w-fit text-xs py-0">Late</Badge>
                )}
              </div>

              {/* Hostel & Room */}
              <div className="col-span-2 flex flex-col justify-center">
                <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {student?.Hostel || 'N/A'}
                </span>
                <span className="text-xs text-slate-500 truncate">
                  Room: {student?.Room || '??'}
                </span>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center">
                <Badge variant={getStatusVariant(log.Status)}>
                  {log.Status}
                </Badge>
              </div>

              {/* Arrears */}
              <div className="col-span-1 flex items-center">
                {student?.Arrears && student.Arrears !== '-' ? (
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 truncate">
                    {student.Arrears}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LogsTable;

import { UserCircle, Clock, Home } from 'lucide-react';
import { parseLogMoment } from '../utils/logDateTime';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import LazyAvatar from './LazyAvatar';

const LogsGrid = ({ logs, allotments, onCardClick }) => {
  const profileImagesPath = localStorage.getItem('profileImagesPath') || '/images/students/';

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
    <div className="p-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
      {logs.map((log, i) => {
        const student = allotments[log['QR Code']?.trim()];
        const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
        const isLate = isLateEntry(log.DateTime, lateEntryHour);
        const rollNo = log['QR Code']?.trim();
        const profileImageBasePath = rollNo ? `${profileImagesPath}${rollNo}` : null;
        
        return (
          <Card 
            key={i}
            onClick={() => onCardClick(log)}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardContent className="p-3">
              {/* Top row: avatar + name + badges */}
              <div className="flex items-center gap-2">
                <LazyAvatar
                  basePath={profileImageBasePath}
                  fallback={<UserCircle size={18} />}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                      {student?.Name || 'Unregistered'}
                    </h3>
                    <Badge variant={getStatusVariant(log.Status)} className="text-xs py-0 shrink-0">
                      {log.Status}
                    </Badge>
                    {isLate && (
                      <Badge variant="destructive" className="text-xs py-0 shrink-0">Late</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{log['QR Code']}</p>
                </div>
              </div>
              {/* Bottom row: two-column detail grid */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                  <Clock size={11} className="text-cyan-600 flex-shrink-0" />
                  <span className="truncate">
                    {(() => {
                      const m = parseLogMoment(log.DateTime);
                      return m.isValid() ? m.format('hh:mm A') : '—';
                    })()}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                  <Home size={11} className="text-cyan-600 flex-shrink-0" />
                  <span className="truncate">{student?.Hostel || 'N/A'} · {student?.Room || '??'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 truncate col-span-2">
                  <Clock size={11} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">
                    {(() => {
                      const m = parseLogMoment(log.DateTime);
                      return m.isValid() ? m.format('DD MMM YYYY') : '—';
                    })()}
                  </span>
                  {student?.Arrears && student.Arrears !== '-' && (
                    <span className="ml-2 text-red-500 truncate">· Arrears: {student.Arrears}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LogsGrid;

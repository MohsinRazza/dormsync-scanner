import moment from 'moment';
import { Activity } from 'lucide-react';

export function LastScanBanner({ lastScan }) {
  if (!lastScan) return null;

  return (
    <div className="flex items-center justify-center bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg px-4 py-2">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-600" />
        <span className="text-sm text-cyan-900 dark:text-cyan-100">
          Last scan: {moment(lastScan).format('MMM DD, YYYY [at] hh:mm A')}
        </span>
      </div>
    </div>
  );
}

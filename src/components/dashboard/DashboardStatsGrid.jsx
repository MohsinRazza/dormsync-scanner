import { Users, ShieldAlert, AlertTriangle } from 'lucide-react';
import StatsCard from '../StatsCard';

export function DashboardStatsGrid({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      <StatsCard
        label="Boarders"
        value={stats.boarders}
        icon={Users}
        description={`Total: ${stats.totalScans} scans`}
        variant="default"
      />
      <StatsCard
        label="Non-Boarders"
        value={stats.nonBoarders}
        icon={Users}
        description="Visitors"
        variant="default"
      />
      <StatsCard
        label="Absent Boarders"
        value={stats.missingBoarders}
        icon={AlertTriangle}
        description="Haven't scanned"
        variant="warning"
      />
      <StatsCard
        label="Invalid Scans"
        value={stats.invalid}
        icon={ShieldAlert}
        variant="danger"
      />
    </div>
  );
}

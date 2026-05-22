import { Users, ShieldAlert, AlertTriangle } from 'lucide-react';
import StatsCard from '../StatsCard';

export function DashboardStatsGrid({ stats, onCardClick }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
      <StatsCard
        label="Boarders"
        value={stats.boarders}
        icon={Users}
        description={`Total: ${stats.totalScans} scans`}
        variant="default"
        onClick={() => onCardClick?.('Boarders')}
      />
      <StatsCard
        label="Non-Boarders"
        value={stats.nonBoarders}
        icon={Users}
        description="Visitors"
        variant="default"
        onClick={() => onCardClick?.('Non-Boarders')}
      />
      <StatsCard
        label="Absent Boarders"
        value={stats.missingBoarders}
        icon={AlertTriangle}
        description="Haven't scanned"
        variant="warning"
        onClick={() => onCardClick?.('Absent Boarders')}
      />
      <StatsCard
        label="Invalid Scans"
        value={stats.invalid}
        icon={ShieldAlert}
        variant="danger"
        onClick={() => onCardClick?.('Invalid Scans')}
      />
    </div>
  );
}

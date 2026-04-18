import moment from 'moment';
import { List, LayoutGrid } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import LogsTable from '../LogsTable';
import LogsGrid from '../LogsGrid';
import { CenteredSpinner } from './CenteredSpinner';

export function DashboardLogsSection({
  startDate,
  endDate,
  showUnique,
  filteredLogsLength,
  filterTab,
  onFilterTabChange,
  processing,
  isMobile,
  viewMode,
  onViewModeChange,
  loading,
  sortedLogs,
  allotments,
  onSort,
  sortConfig,
  onRowSelect,
}) {
  return (
    <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="px-3 md:px-6 py-2 md:py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <p className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
          Showing records:{' '}
          <span className="text-slate-900 dark:text-white font-semibold">
            {startDate || endDate
              ? `${startDate ? moment(startDate).format('MMM DD, YYYY') : 'Beginning'} to ${endDate ? moment(endDate).format('MMM DD, YYYY') : 'Now'}`
              : 'All Time'}
          </span>{' '}
          ({filteredLogsLength} records)
          {showUnique && (
            <span className="text-cyan-600"> • Unique entries</span>
          )}
        </p>
      </div>

      <div className="p-1 md:p-2 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 overflow-x-auto">
            <Tabs value={filterTab} onValueChange={onFilterTabChange}>
              <TabsList className="w-full md:w-auto">
                {[
                  ['all', 'All'],
                  ['boarder', 'Boarders'],
                  ['non-boarder', 'Non-Boarders'],
                  ['missing', 'Absent'],
                  ['invalid', 'Invalid'],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    active={filterTab === value}
                    onClick={() => onFilterTabChange(value)}
                    disabled={processing}
                    className="text-xs md:text-sm whitespace-nowrap"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {!isMobile && (
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('table')}
                className="gap-2"
                disabled={processing}
              >
                <List size={16} />
                Table
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="gap-2"
                disabled={processing}
              >
                <LayoutGrid size={16} />
                Cards
              </Button>
            </div>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-auto"
        style={{ maxHeight: 'calc(100svh - 490px)' }}
      >
        {loading ? (
          <CenteredSpinner message="Loading data..." />
        ) : processing ? (
          <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[300px]">
            <svg
              className="animate-spin h-8 w-8 text-cyan-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : sortedLogs.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[150px] sm:min-h-[300px]">
            <div className="text-center">
              <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Records Found
              </p>
              <p className="text-sm text-slate-500">
                {filterTab === 'missing'
                  ? 'All boarders have scanned their cards'
                  : 'Try adjusting your filters or date range'}
              </p>
            </div>
          </div>
        ) : viewMode === 'table' ? (
          <LogsTable
            logs={sortedLogs}
            allotments={allotments}
            onSort={onSort}
            sortConfig={sortConfig}
            onRowClick={onRowSelect}
          />
        ) : (
          <LogsGrid
            logs={sortedLogs}
            allotments={allotments}
            onCardClick={onRowSelect}
          />
        )}
      </div>
    </div>
  );
}

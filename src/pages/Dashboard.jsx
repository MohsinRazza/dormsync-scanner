import { useState } from 'react';
import {
  Search,
  Calendar,
  Filter,
  EyeOff,
  Cloud,
  Database,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import ImageModal from '../components/ImageModal';
import DateRangeModal from '../components/DateRangeModal';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { toast } from '../components/ui/toast';
import { useDashboardLogs } from '../hooks/useDashboardLogs';
import ConfirmModal from '../components/ConfirmModal';
import { downloadHTMLReport, isValidRollNo } from '../utils/reportGenerator';
import { buildUniqueLogs } from '../utils/dashboardLogUtils';
import { MobileSearchModal } from '../components/dashboard/MobileSearchModal';
import { LastScanBanner } from '../components/dashboard/LastScanBanner';
import { DashboardStatsGrid } from '../components/dashboard/DashboardStatsGrid';
import { DashboardLogsSection } from '../components/dashboard/DashboardLogsSection';

export default function Dashboard({
  logs,
  allotments,
  lastScan,
  loading,
  isMobile,
  showUnique,
  onToggleUnique,
  viewMode,
  setViewMode,
  dataSource,
  toggleDataSource,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'time',
    direction: 'desc',
  });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [hideInvalid, setHideInvalid] = useState(true);
  const [pendingReport, setPendingReport] = useState(null);

  const { filteredLogs, sortedLogs, stats } = useDashboardLogs({
    logs,
    allotments,
    showUnique,
    searchTerm,
    filterTab,
    startDate,
    endDate,
    sortConfig,
    hideInvalid,
  });

  const handleTabChange = (tab) => {
    setProcessing(true);
    setFilterTab(tab);
    setTimeout(() => setProcessing(false), 100);
  };

  const handleViewModeChange = (mode) => {
    setProcessing(true);
    setViewMode(mode);
    setTimeout(() => setProcessing(false), 100);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleDateRangeApply = (start, end) => {
    setIsDateModalOpen(false);
    setStartDate(start);
    setEndDate(end);
    if (start || end) {
      toast.success('Date range filter applied');
    } else {
      toast.success('Showing all records');
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
    toast.success('Showing all records');
  };

  const handleGenerateDashboardReport = () => {
    if (!pendingReport) return;
    
    let baseLogs = showUnique ? buildUniqueLogs(logs) : logs;
    if (hideInvalid) {
      baseLogs = baseLogs.filter(l => isValidRollNo(l['QR Code']));
    }

    let reportLogs = [];
    if (pendingReport === 'Boarders') {
      reportLogs = baseLogs.filter(l => l.Status === 'Boarder');
    } else if (pendingReport === 'Non-Boarders') {
      reportLogs = baseLogs.filter(l => l.Status === 'Non-Boarder');
    } else if (pendingReport === 'Invalid Scans') {
      reportLogs = baseLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder');
    } else if (pendingReport === 'Absent Boarders') {
      const scannedRollNos = new Set(baseLogs.filter(l => l.Status === 'Boarder').map(l => l['QR Code']));
      const missing = Object.values(allotments).filter(student => !scannedRollNos.has(student['Roll No.']));
      reportLogs = missing.map(student => ({
        DateTime: 'Not Scanned',
        'QR Code': student['Roll No.'],
        Status: 'Absent',
        Name: student.Name,
        Hostel: student.Hostel,
        Room: student.Room,
      }));
    }

    downloadHTMLReport(reportLogs, allotments, pendingReport, 'Dashboard Snapshot');
    setPendingReport(null);
  };

  return (
    <>
      {!isMobile && (
        <PageHeader
          title="Dashboard"
          description="Monitor and manage hostel scan entries"
          search={
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex-1 relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <Input
                  type="text"
                  placeholder="Search by name or roll number..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setSearchTerm(searchInput);
                  }}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => setSearchTerm(searchInput)}>Search</Button>
              {searchTerm && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchInput('');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          }
          actions={
            <div className="flex items-center gap-3">
              <Button
                variant="default"
                onClick={onToggleUnique}
                className="gap-2"
              >
                <Filter size={16} />
                {showUnique ? 'Unique' : 'All Entries'}
              </Button>
              <Button
                variant={dataSource === 'local' ? 'outline' : 'default'}
                onClick={toggleDataSource}
                className="gap-2"
              >
                {dataSource === 'local' ? <Cloud size={16} /> : <Database size={16} />}
                {dataSource === 'local' ? 'Remote Data' : 'Local Data'}
              </Button>
              <Button
                variant={hideInvalid ? 'default' : 'outline'}
                onClick={() => setHideInvalid(v => !v)}
                className="gap-2"
              >
                <EyeOff size={16} />
                {hideInvalid ? 'Valid Only' : 'Show Invalid'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDateModalOpen(true)}
                className="gap-2"
              >
                <Calendar size={16} />
                {startDate || endDate ? 'Change Range' : 'Date Range'}
              </Button>
              {(startDate || endDate) && (
                <Button variant="outline" onClick={clearDateRange}>
                  Clear
                </Button>
              )}
            </div>
          }
        />
      )}

      <div className="flex-1 overflow-hidden p-3 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
        {isMobile && (
          <div className="flex gap-2">
            <Button
              variant="default"
              onClick={onToggleUnique}
              size="sm"
              className="flex-1 gap-2"
            >
              <Filter size={14} />
              {showUnique ? 'Unique' : 'All'}
            </Button>
            <Button
              variant={dataSource === 'local' ? 'outline' : 'default'}
              onClick={toggleDataSource}
              size="sm"
              className="gap-1.5 px-3"
            >
              {dataSource === 'local' ? <Cloud size={14} /> : <Database size={14} />}
            </Button>
            <Button
              variant={hideInvalid ? 'default' : 'outline'}
              onClick={() => setHideInvalid(v => !v)}
              size="sm"
              className="gap-1.5 px-3"
            >
              <EyeOff size={14} />
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDateModalOpen(true)}
              size="sm"
              className="flex-1 gap-2"
            >
              <Calendar size={14} />
              Range
            </Button>
            <Button
              variant={searchTerm ? 'default' : 'outline'}
              onClick={() => {
                setSearchInput(searchTerm);
                setIsSearchModalOpen(true);
              }}
              size="sm"
              className="gap-1 px-3"
            >
              <Search size={14} />
            </Button>
            {(startDate || endDate) && (
              <Button variant="outline" onClick={clearDateRange} size="sm">
                Clear
              </Button>
            )}
          </div>
        )}

        <LastScanBanner lastScan={lastScan} />
        <DashboardStatsGrid stats={stats} onCardClick={setPendingReport} />

        <DashboardLogsSection
          startDate={startDate}
          endDate={endDate}
          showUnique={showUnique}
          filteredLogsLength={filteredLogs.length}
          filterTab={filterTab}
          onFilterTabChange={handleTabChange}
          processing={processing}
          isMobile={isMobile}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          loading={loading}
          sortedLogs={sortedLogs}
          allotments={allotments}
          onSort={handleSort}
          sortConfig={sortConfig}
          onRowSelect={setSelectedLog}
        />
      </div>

      {selectedLog && (
        <ImageModal
          log={selectedLog}
          student={allotments[selectedLog['QR Code']?.trim()]}
          onClose={() => setSelectedLog(null)}
        />
      )}

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateRangeApply}
        currentStartDate={startDate}
        currentEndDate={endDate}
      />

      <MobileSearchModal
        open={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        searchTerm={searchTerm}
        onApplySearch={() => setSearchTerm(searchInput)}
        onClearSearch={() => {
          setSearchTerm('');
          setSearchInput('');
        }}
      />

      {pendingReport && (
        <ConfirmModal
          title={`Generate ${pendingReport} Report`}
          description={`Do you want to generate and download a report for ${pendingReport}?`}
          onConfirm={handleGenerateDashboardReport}
          onClose={() => setPendingReport(null)}
        />
      )}
    </>
  );
}

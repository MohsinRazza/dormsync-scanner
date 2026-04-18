import { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import moment from 'moment';
import { parseLogMoment } from '../utils/logDateTime';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Users, Clock, AlertTriangle, Calendar, Download, FileText, CalendarRange, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import PageHeader from '../components/PageHeader';
import DateRangeModal from '../components/DateRangeModal';
import { toast } from '../components/ui/toast';
import { cn } from '../lib/utils';

const logDayKey = (dt) => {
  const m = parseLogMoment(dt);
  return m.isValid() ? m.format('YYYY-MM-DD') : '';
};

const logHour = (dt) => {
  const h = parseLogMoment(dt).hour();
  return Number.isNaN(h) ? -1 : h;
};

const Reports = ({ logs, allotments, isMobile, showUnique, toggleUnique }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  // Get unique logs (filter duplicates by QR Code)
  const uniqueLogs = useMemo(() => {
    if (!showUnique) return logs;
    
    const seen = new Set();
    return logs.filter(log => {
      const key = log['QR Code'];
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [logs, showUnique]);

  // Filter logs by date range
  const filteredLogs = useMemo(() => {
    const dataToFilter = showUnique ? uniqueLogs : logs;
    if (!startDate && !endDate) return dataToFilter;

    return dataToFilter.filter(log => {
      const logDate = logDayKey(log.DateTime);
      
      if (startDate && endDate) {
        return logDate >= startDate && logDate <= endDate;
      } else if (startDate) {
        return logDate >= startDate;
      } else if (endDate) {
        return logDate <= endDate;
      }
      
      return true;
    });
  }, [logs, uniqueLogs, showUnique, startDate, endDate]);

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

  // Peak Times Data
  const peakTimesData = useMemo(() => {
    const hourCounts = {};
    filteredLogs.forEach(log => {
      const hour = logHour(log.DateTime);
      if (hour < 0) return;
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: moment().hour(parseInt(hour)).format('hh A'),
        hourNum: parseInt(hour),
        count
      }))
      .sort((a, b) => a.hourNum - b.hourNum);
  }, [filteredLogs]);

  // Status Distribution Data
  const statusData = useMemo(() => {
    const boarders = filteredLogs.filter(l => l.Status === 'Boarder').length;
    const nonBoarders = filteredLogs.filter(l => l.Status === 'Non-Boarder').length;
    const invalid = filteredLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder').length;
    const total = filteredLogs.length;

    return [
      { 
        name: 'Boarders', 
        value: boarders,
        percentage: total > 0 ? ((boarders / total) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Non-Boarders', 
        value: nonBoarders,
        percentage: total > 0 ? ((nonBoarders / total) * 100).toFixed(1) : '0.0'
      },
      { 
        name: 'Invalid', 
        value: invalid,
        percentage: total > 0 ? ((invalid / total) * 100).toFixed(1) : '0.0'
      }
    ];
  }, [filteredLogs]);

  // Daily Trend Data
  const dailyTrendData = useMemo(() => {
    if (startDate && endDate) {
      const start = moment(startDate);
      const end = moment(endDate);
      const days = [];
      
      for (let m = moment(start); m.isSameOrBefore(end); m.add(1, 'days')) {
        const date = m.format('YYYY-MM-DD');
        const count = filteredLogs.filter(log => 
          logDayKey(log.DateTime) === date
        ).length;
        days.push({
          date: m.format('MMM DD'),
          count
        });
      }
      return days;
    } else {
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const count = filteredLogs.filter(log => 
          logDayKey(log.DateTime) === date
        ).length;
        last7Days.push({
          date: moment().subtract(i, 'days').format('MMM DD'),
          count
        });
      }
      return last7Days;
    }
  }, [filteredLogs, startDate, endDate]);

  // Late Entries Data
  const lateEntriesData = useMemo(() => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const lateCount = filteredLogs.filter(log => logHour(log.DateTime) >= lateEntryHour).length;
    const onTimeCount = filteredLogs.length - lateCount;
    const total = filteredLogs.length;
    return [
      { name: 'On Time', value: onTimeCount, percentage: total > 0 ? ((onTimeCount / total) * 100).toFixed(1) : '0.0' },
      { name: 'Late Entry', value: lateCount, percentage: total > 0 ? ((lateCount / total) * 100).toFixed(1) : '0.0' }
    ];
  }, [filteredLogs]);

  // Summary Stats
  const stats = useMemo(() => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const peakHour = peakTimesData.reduce((max, curr) => 
      curr.count > max.count ? curr : max
    , { count: 0, hour: 'N/A' });

    const daysCount = startDate && endDate 
      ? moment(endDate).diff(moment(startDate), 'days') + 1 
      : 7;
    const avgPerDay = daysCount > 0 ? (filteredLogs.length / daysCount).toFixed(0) : '0';
    const lateEntries = filteredLogs.filter(log => logHour(log.DateTime) >= lateEntryHour).length;
    const invalidEntries = filteredLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder').length;

    return {
      peakHour: peakHour.hour,
      peakCount: peakHour.count,
      avgPerDay,
      lateEntries,
      invalidEntries
    };
  }, [filteredLogs, peakTimesData, startDate, endDate]);

  const COLORS = {
    'Boarders': '#10b981',
    'Non-Boarders': '#f97316',
    'Invalid': '#ef4444',
    'On Time': '#06b6d4',
    'Late Entry': '#f59e0b'
  };

  // Generate Report Functions
  const generateDailyReport = () => {
    const today = moment().format('YYYY-MM-DD');
    const todayLogs = logs.filter(log => 
      logDayKey(log.DateTime) === today
    );
    
    downloadHTMLReport(todayLogs, 'Daily', moment().format('MMMM DD, YYYY'));
  };

  const generateWeeklyReport = () => {
    const weekStart = moment().startOf('week');
    const weekEnd = moment().endOf('week');
    const weekLogs = logs.filter(log => {
      const logDate = parseLogMoment(log.DateTime);
      return logDate.isValid() && logDate.isSameOrAfter(weekStart, 'day') && logDate.isSameOrBefore(weekEnd, 'day');
    });
    
    downloadHTMLReport(weekLogs, 'Weekly', `${weekStart.format('MMM DD')} - ${weekEnd.format('MMM DD, YYYY')}`);
  };

  const generateMonthlyReport = () => {
    const monthStart = moment().startOf('month');
    const monthEnd = moment().endOf('month');
    const monthLogs = logs.filter(log => {
      const logDate = parseLogMoment(log.DateTime);
      return logDate.isValid() && logDate.isSameOrAfter(monthStart, 'day') && logDate.isSameOrBefore(monthEnd, 'day');
    });
    
    downloadHTMLReport(monthLogs, 'Monthly', moment().format('MMMM YYYY'));
  };

  const generateCustomReport = (customStart, customEnd) => {
    setIsCustomReportModalOpen(false);
    
    if (!customStart || !customEnd) {
      toast.error('Please select both start and end dates');
      return;
    }
    
    const customLogs = logs.filter(log => {
      const logDate = logDayKey(log.DateTime);
      return logDate >= customStart && logDate <= customEnd;
    });
    
    const dateLabel = `${moment(customStart).format('MMM DD, YYYY')} - ${moment(customEnd).format('MMM DD, YYYY')}`;
    downloadHTMLReport(customLogs, 'Custom', dateLabel);
  };

  const downloadHTMLReport = (reportLogs, reportType, dateLabel) => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    
    // Calculate statistics
    const totalScans = reportLogs.length;
    const boarders = reportLogs.filter(l => l.Status === 'Boarder').length;
    const nonBoarders = reportLogs.filter(l => l.Status === 'Non-Boarder').length;
    const invalid = reportLogs.filter(l => l.Status !== 'Boarder' && l.Status !== 'Non-Boarder').length;
    const lateEntries = reportLogs.filter(log => logHour(log.DateTime) >= lateEntryHour).length;

    // Generate table rows
    const tableRows = reportLogs.map((log, index) => {
      const rollNo = log['QR Code']?.trim() || 'N/A';
      const student = allotments[rollNo];
      const bgColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      
      return `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr 1fr 1.5fr 1fr 0.8fr; border-bottom: 1px solid #e5e7eb; background: ${bgColor};">
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${(() => { const m = parseLogMoment(log.DateTime); return m.isValid() ? m.format('MMM DD, YYYY') : '—'; })()}</div>
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${(() => { const m = parseLogMoment(log.DateTime); return m.isValid() ? m.format('hh:mm A') : '—'; })()}</div>
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${rollNo}</div>
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${log.Status || 'Unknown'}</div>
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${student?.Name || 'Unknown'}</div>
          <div style="padding: 12px; border-right: 1px solid #e5e7eb;">${student?.Allotment || 'N/A'}</div>
          <div style="padding: 12px;">${student?.Room || 'N/A'}</div>
        </div>
      `;
    }).join('');

    // Create HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${reportType} Report - ${dateLabel}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: #f9fafb;
      color: #1f2937;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 8px;
    }
    .header .subtitle {
      font-size: 16px;
      color: #6b7280;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .stat-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .stat-card .label {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .stat-card .value {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: #111827;
    }
    .custom-table {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    .table-header {
      display: grid;
      grid-template-columns: 1fr 1fr 1.2fr 1fr 1.5fr 1fr 0.8fr;
      background: #f3f4f6;
      font-weight: 600;
      font-size: 14px;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }
    .table-header > div {
      padding: 12px;
      border-right: 1px solid #e5e7eb;
    }
    .table-header > div:last-child {
      border-right: none;
    }
    .table-body {
      font-size: 14px;
      color: #4b5563;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .container {
        box-shadow: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Scanner Dashboard</h1>
      <div class="subtitle">${reportType} Scan Report</div>
      <div class="subtitle">${dateLabel}</div>
    </div>

    <div class="section-title">Summary Statistics</div>
    <div class="stats">
      <div class="stat-card">
        <div class="label">Total Scans</div>
        <div class="value">${totalScans}</div>
      </div>
      <div class="stat-card">
        <div class="label">Boarders</div>
        <div class="value">${boarders}</div>
      </div>
      <div class="stat-card">
        <div class="label">Non-Boarders</div>
        <div class="value">${nonBoarders}</div>
      </div>
      <div class="stat-card">
        <div class="label">Invalid Scans</div>
        <div class="value">${invalid}</div>
      </div>
      <div class="stat-card">
        <div class="label">Late Entries</div>
        <div class="value">${lateEntries}</div>
      </div>
    </div>

    <div class="section-title">Scan Records</div>
    <div class="custom-table">
      <div class="table-header">
        <div>Date</div>
        <div>Time</div>
        <div>Roll Number</div>
        <div>Status</div>
        <div>Name</div>
        <div>Allotment</div>
        <div>Room</div>
      </div>
      <div class="table-body">
        ${tableRows}
      </div>
    </div>

    <div class="footer">
      <div>Generated on ${moment().format('MMMM DD, YYYY [at] hh:mm A')}</div>
      <div>UOG Hostel Management System</div>
    </div>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_Report_${moment().format('YYYY-MM-DD')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${reportType} report downloaded successfully`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <PageHeader 
        title="Reports & Analytics" 
        description="Visual insights and downloadable reports"
        actions={
          <div className="flex items-center gap-3">
            {!isMobile && (
              <Button
                variant={showUnique ? 'default' : 'outline'}
                onClick={toggleUnique}
                className="gap-2"
              >
                <Filter size={16} />
                {showUnique ? 'Unique' : 'All Entries'}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setIsDateModalOpen(true)}
              className="gap-2"
            >
              <Calendar size={16} />
              {startDate || endDate ? 'Change Date Range' : 'Select Date Range'}
            </Button>
            {(startDate || endDate) && (
              <Button variant="outline" onClick={clearDateRange}>
                View All Time
              </Button>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-auto p-3 md:p-6 space-y-4 md:space-y-6 pb-20 md:pb-6">
        {/* Mobile controls */}
        {isMobile && (
          <div className="flex gap-2">
            <Button
              variant={showUnique ? 'default' : 'outline'}
              onClick={toggleUnique}
              size="sm"
              className="flex-1 gap-2"
            >
              <Filter size={14} />
              {showUnique ? 'Unique' : 'All'}
            </Button>
          </div>
        )}
        {/* Tabs */}
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === 'analytics'
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            )}
          >
            Analytics & Charts
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
              activeTab === 'downloads'
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-slate-50"
                : "hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
            )}
          >
            Download Reports
          </button>
        </div>

        {activeTab === 'analytics' && (
          <>
            {/* Date Range Display */}
            {(startDate || endDate) && (
              <div className="bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800 rounded-lg px-4 py-2">
                <p className="text-sm text-cyan-900 dark:text-cyan-100">
                  Showing analytics: {' '}
                  <span className="font-semibold">
                    {startDate ? moment(startDate).format('MMM DD, YYYY') : 'Beginning'} 
                    {' '} to {' '}
                    {endDate ? moment(endDate).format('MMM DD, YYYY') : 'Now'}
                  </span>
                  {' '}({filteredLogs.length} records)
                  {showUnique && <span className="text-cyan-600"> • Unique entries</span>}
                </p>
              </div>
            )}

            {/* Summary Stats - Smaller and more compact */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Total Scans</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{filteredLogs.length}</p>
                    </div>
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Peak Hour</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.peakHour}</p>
                      <p className="text-xs text-slate-500">{stats.peakCount} entries</p>
                    </div>
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Avg Per Day</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.avgPerDay}</p>
                      <p className="text-xs text-slate-500">Last {startDate && endDate ? moment(endDate).diff(moment(startDate), 'days') + 1 : 7} days</p>
                    </div>
                    <Clock className="w-6 h-6 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Late Entries</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.lateEntries}</p>
                      <p className="text-xs text-slate-500">After {localStorage.getItem('lateEntryHour') || '22'}:00</p>
                    </div>
                    <AlertTriangle className="w-6 h-6 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Invalid Scans</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.invalidEntries}</p>
                      <p className="text-xs text-slate-500">Total invalid</p>
                    </div>
                    <Users className="w-6 h-6 text-cyan-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Peak Times Chart - Only chart shown */}
            <Card>
              <CardHeader>
                <CardTitle>Peak Entry Times</CardTitle>
                <CardDescription>Hourly distribution of scan entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakTimesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#06b6d4" name="Number of Entries" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'downloads' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Daily Report */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle>Daily Report</CardTitle>
                    <CardDescription>Today's scans</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>• All scans from today</p>
                  <p>• Summary statistics</p>
                  <p>• Detailed record table</p>
                </div>
                <Button 
                  onClick={generateDailyReport}
                  className="w-full gap-2"
                >
                  <Download size={16} />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Weekly Report */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle>Weekly Report</CardTitle>
                    <CardDescription>This week</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>• All scans this week</p>
                  <p>• Weekly trends</p>
                  <p>• Comprehensive data</p>
                </div>
                <Button 
                  onClick={generateWeeklyReport}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download size={16} />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Report */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-6 h-6 text-slate-600" />
                  </div>
                  <div>
                    <CardTitle>Monthly Report</CardTitle>
                    <CardDescription>This month</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>• All scans this month</p>
                  <p>• Monthly statistics</p>
                  <p>• Complete overview</p>
                </div>
                <Button 
                  onClick={generateMonthlyReport}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Download size={16} />
                  Download
                </Button>
              </CardContent>
            </Card>

            {/* Custom Date Range Report */}
            <Card className="hover:shadow-lg transition-shadow border-2 border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-cyan-100 dark:bg-cyan-950 rounded-lg">
                    <CalendarRange className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <CardTitle>Custom Range</CardTitle>
                    <CardDescription>Select dates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <p>• Choose start date</p>
                  <p>• Choose end date</p>
                  <p>• Custom date range</p>
                </div>
                <Button 
                  onClick={() => setIsCustomReportModalOpen(true)}
                  className="w-full gap-2"
                  variant="outline"
                >
                  <CalendarRange size={16} />
                  Select Dates
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <DateRangeModal
        isOpen={isDateModalOpen}
        onClose={() => setIsDateModalOpen(false)}
        onApply={handleDateRangeApply}
        currentStartDate={startDate}
        currentEndDate={endDate}
      />

      <DateRangeModal
        isOpen={isCustomReportModalOpen}
        onClose={() => setIsCustomReportModalOpen(false)}
        onApply={generateCustomReport}
        currentStartDate=""
        currentEndDate=""
      />
    </div>
  );
};

export default Reports;

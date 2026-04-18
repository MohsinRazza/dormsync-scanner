import { useState } from 'react';
import moment from 'moment';
import { parseLogMoment } from '../utils/logDateTime';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Download, FileText, CalendarRange, Users, List } from 'lucide-react';
import { Button } from '../components/ui/button';
import { X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import DateRangeModal from '../components/DateRangeModal';
import { toast } from '../components/ui/toast';

const ROLL_NO_RE = /^\d{8}-\d{3}$/;
const isValidRollNo = (qr) => ROLL_NO_RE.test(qr?.trim() || '');

const logDayKey = (dt) => {
  const m = parseLogMoment(dt);
  return m.isValid() ? m.format('YYYY-MM-DD') : '';
};

/** Modal that asks Unique vs All before downloading */
const DownloadConfirmModal = ({ title, onConfirm, onClose }) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-xs">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
          <X size={14} />
        </Button>
      </div>
      <div className="p-4 space-y-3">
        <p className="text-xs text-slate-500">Which records should be included?</p>
        <div className="flex flex-col gap-2">
          <Button className="w-full gap-2" onClick={() => onConfirm(false)}>
            <List size={15} />
            All Records
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={() => onConfirm(true)}>
            <Users size={15} />
            Unique Records Only
          </Button>
        </div>
      </div>
    </div>
  </div>
);

const Reports = ({ logs, allotments }) => {
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState(null); // { logs, type, label }

  const deduped = (rawLogs) => {
    const seen = new Set();
    return rawLogs.filter(l => {
      const k = l['QR Code'];
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };

  const triggerDownload = (rawLogs, type, label) => {
    setPendingDownload({ rawLogs, type, label });
  };

  const handleConfirm = (uniqueOnly) => {
    const { rawLogs, type, label } = pendingDownload;
    const finalLogs = uniqueOnly ? deduped(rawLogs) : rawLogs;
    setPendingDownload(null);
    downloadHTMLReport(finalLogs, type, label, uniqueOnly);
  };

  const downloadHTMLReport = (reportLogs, reportType, dateLabel, uniqueOnly) => {
    const lateEntryHour = parseInt(localStorage.getItem('lateEntryHour') || '22');
    const totalScans = reportLogs.length;
    const boarders = reportLogs.filter(l => l.Status === 'Boarder').length;
    const nonBoarders = reportLogs.filter(l => l.Status === 'Non-Boarder').length;
    const lateEntries = reportLogs.filter(l => parseLogMoment(l.DateTime).hour() >= lateEntryHour).length;

    const tableRows = reportLogs.map((log, i) => {
      const rawQR = log['QR Code']?.trim() || '';
      const valid = isValidRollNo(rawQR);
      const rollNo = valid ? rawQR : 'N/A';
      const student = valid ? allotments[rawQR] : null;
      const m = parseLogMoment(log.DateTime);
      const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';

      return `
        <tr style="background:${bg}">
          <td style="padding:5px 8px;border:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            <span class="bold">${m.isValid() ? m.format('DD MMM YYYY') : '—'}</span>
            <span class="sub-text">${m.isValid() ? m.format('hh:mm A') : '—'}</span>
          </td>
          <td style="padding:5px 8px;border:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${rollNo}</td>
          <td style="padding:5px 8px;border:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${valid ? (student?.Name || 'Unknown') : 'N/A'}</td>
          <td style="padding:5px 8px;border:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${valid ? (log.Status || 'Unknown') : 'N/A'}</td>
          <td style="padding:5px 8px;border:1px solid #e2e8f0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
            <span class="bold">${valid ? (student?.Hostel || 'N/A') : 'N/A'}</span>
            <span class="sub-text">${valid ? (student?.Room ? 'Room ' + student.Room : 'N/A') : 'N/A'}</span>
          </td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>DormSync Official Report — ${dateLabel}</title>
<style>
  /* Professional Color Palette */
  :root {
    --slate-800: #1e293b;
    --slate-600: #475569;
    --slate-400: #94a3b8;
    --border: #e2e8f0;
    --accent: #2563eb;
  }

  * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
  
  body { 
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; 
    margin: 0; 
    padding: 20px; 
    color: var(--slate-800);
    background: #f1f5f9; 
  }

  /* Paper Container */
  .wrap {
    max-width: 210mm; /* A4 Width */
    margin: 0 auto;
    background: #fff;
    padding: 40px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    min-height: 297mm;
  }

  /* Compact Header Section */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    border-bottom: 2px solid var(--slate-800);
    padding-bottom: 15px;
    margin-bottom: 20px;
  }

  .brand h1 { margin: 0; font-size: 24px; letter-spacing: -1px; color: var(--slate-800); }
  .brand p { margin: 0; font-size: 12px; color: var(--accent); font-weight: 600; }
  
  .report-info { text-align: right; }
  .report-info h2 { margin: 0; font-size: 16px; text-transform: uppercase; }
  .report-info p { margin: 0; font-size: 11px; color: var(--slate-600); }

  /* Summary Bar */
  .summary-bar {
    display: flex;
    gap: 30px;
    background: #f8fafc;
    padding: 12px 20px;
    border-radius: 6px;
    margin-bottom: 20px;
    border: 1px solid var(--border);
  }
  .stat-box { font-size: 11px; color: var(--slate-600); }
  .stat-box b { display: block; font-size: 16px; color: var(--slate-800); }

  /* The Table Fix */
  table { 
    width: 100%; 
    border-collapse: collapse; 
    table-layout: fixed; /* CRITICAL: Prevents horizontal overflow */
  }

  th { 
    background: #f1f5f9;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
    padding: 8px;
    border: 1px solid #cbd5e1;
    text-align: left;
  }

  td { 
    font-size: 10px; 
    padding: 5px 8px; 
    border: 1px solid var(--border);
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap; /* Keeps rows thin to save pages */
  }

  /* Controlled Column Widths (Total = 100%) */
  .col-time { width: 18%; }
  .col-roll { width: 15%; }
  .col-name { width: 27%; }
  .col-status { width: 12%; }
  .col-room { width: 28%; }

  .sub-text { font-size: 9px; color: var(--slate-400); display: block; }
  .bold { font-weight: 600; }

  /* Print Specific Logic */
  @media print {
    body { background: white; padding: 0; }
    .wrap { width: 100%; box-shadow: none; padding: 0; margin: 0; }
    
    @page {
      size: A4;
      margin: 15mm 10mm; /* Narrow margins to fit more data */
    }

    thead { display: table-header-group; } /* Shows header on every new page */
    tr { page-break-inside: avoid; }
    
    .no-print { display: none; }
  }
</style>
</head>
<body>

<div class="wrap">
  <header class="header">
    <div class="brand">
      <h1>DormSync</h1>
      <p>University of Gujrat Hostel System</p>
    </div>
    <div class="report-info">
      <h2>${reportType} Activity Report</h2>
      <p>Reference: DS-REQ-${moment().format('YYYYMMDD')}</p>
    </div>
  </header>

  <div class="summary-bar">
    <div class="stat-box">Total Scans <b>${totalScans}</b></div>
    <div class="stat-box">Boarders <b>${boarders}</b></div>
    <div class="stat-box">Non-Boarders <b>${nonBoarders}</b></div>
    <div class="stat-box">Late Entries <b style="color: #dc2626;">${lateEntries}</b></div>
    <div class="stat-box" style="margin-left: auto; text-align: right;">Period <b>${dateLabel}</b></div>
  </div>

  <table>
    <thead>
      <tr>
        <th class="col-time">Date & Time</th>
        <th class="col-roll">Roll Number</th>
        <th class="col-name">Full Name</th>
        <th class="col-status">Status</th>
        <th class="col-room">Hostel & Room</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows}
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; font-size: 9px; color: var(--slate-400);">
    <span>Generated by DormSync System Administrator</span>
    <span>Digital Record — No Signature Required</span>
    <span>Page traces of UOG Hostel Management</span>
  </div>
</div>

</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_Report_${moment().format('YYYY-MM-DD')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`${reportType} report downloaded`);
  };

  const reportCards = [
    {
      title: 'Daily Report',
      desc: "Today's scans",
      getLogs: () => {
        const today = moment().format('YYYY-MM-DD');
        return logs.filter(l => logDayKey(l.DateTime) === today);
      },
      label: () => moment().format('MMMM DD, YYYY'),
    },
    {
      title: 'Weekly Report',
      desc: 'This week',
      getLogs: () => {
        const s = moment().startOf('week');
        const e = moment().endOf('week');
        return logs.filter(l => {
          const m = parseLogMoment(l.DateTime);
          return m.isValid() && m.isSameOrAfter(s, 'day') && m.isSameOrBefore(e, 'day');
        });
      },
      label: () => `${moment().startOf('week').format('MMM DD')} – ${moment().endOf('week').format('MMM DD, YYYY')}`,
    },
    {
      title: 'Monthly Report',
      desc: 'This month',
      getLogs: () => {
        const s = moment().startOf('month');
        const e = moment().endOf('month');
        return logs.filter(l => {
          const m = parseLogMoment(l.DateTime);
          return m.isValid() && m.isSameOrAfter(s, 'day') && m.isSameOrBefore(e, 'day');
        });
      },
      label: () => moment().format('MMMM YYYY'),
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* <PageHeader title="Reports" description="Download scan reports" /> */}

      <div className="flex-1 overflow-auto p-3 md:p-6 pb-20 md:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportCards.map(({ title, desc, getLogs, label }) => (
            <Card key={title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <FileText className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{title}</CardTitle>
                    <CardDescription className="text-xs">{desc}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full gap-2"
                  onClick={() => triggerDownload(getLogs(), title.split(' ')[0], label())}
                >
                  <Download size={15} />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* Custom range */}
          <Card className="hover:shadow-md transition-shadow border-cyan-200 dark:border-cyan-800">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-100 dark:bg-cyan-950 rounded-lg">
                  <CalendarRange className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <CardTitle className="text-sm">Custom Range</CardTitle>
                  <CardDescription className="text-xs">Pick any dates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setIsCustomModalOpen(true)}
              >
                <CalendarRange size={15} />
                Select Dates
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Custom date range picker */}
      <DateRangeModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApply={(start, end) => {
          setIsCustomModalOpen(false);
          if (!start || !end) { toast.error('Select both dates'); return; }
          const filtered = logs.filter(l => {
            const d = logDayKey(l.DateTime);
            return d >= start && d <= end;
          });
          const label = `${moment(start).format('MMM DD, YYYY')} – ${moment(end).format('MMM DD, YYYY')}`;
          triggerDownload(filtered, 'Custom', label);
        }}
        currentStartDate=""
        currentEndDate=""
      />

      {/* Unique vs All confirmation */}
      {pendingDownload && (
        <DownloadConfirmModal
          title={`${pendingDownload.type} Report`}
          onConfirm={handleConfirm}
          onClose={() => setPendingDownload(null)}
        />
      )}
    </div>
  );
};

export default Reports;

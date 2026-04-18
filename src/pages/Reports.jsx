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
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.isValid() ? m.format('DD MMM YYYY') : '—'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${m.isValid() ? m.format('hh:mm A') : '—'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${rollNo}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${valid ? (student?.Name || 'Unknown') : 'N/A'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${valid ? (log.Status || 'Unknown') : 'N/A'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${valid ? (student?.Hostel || 'N/A') : 'N/A'}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb">${valid ? (student?.Room || 'N/A') : 'N/A'}</td>
        </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${reportType} Report — ${dateLabel}</title>
<style>
  body{font-family:'Segoe UI',sans-serif;padding:40px;background:#f9fafb;color:#1f2937}
  .wrap{max-width:1100px;margin:0 auto;background:#fff;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,.1)}
  h1{font-size:24px;font-weight:700;margin-bottom:4px}
  .sub{color:#6b7280;font-size:14px;margin-bottom:24px}
  .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:16px;margin-bottom:32px}
  .stat{background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px}
  .stat .lbl{font-size:12px;color:#6b7280;margin-bottom:4px}
  .stat .val{font-size:22px;font-weight:700}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#f3f4f6;padding:10px 12px;text-align:left;font-weight:600;border-bottom:2px solid #e5e7eb}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#9ca3af}
  @media print{body{padding:0;background:#fff}.wrap{box-shadow:none;padding:20px}}
</style>
</head>
<body>
<div class="wrap">
  <h1>UOG Hostel — ${reportType} Report</h1>
  <div class="sub">${dateLabel}${uniqueOnly ? ' &nbsp;·&nbsp; Unique records only' : ''}</div>
  <div class="stats">
    <div class="stat"><div class="lbl">Total Scans</div><div class="val">${totalScans}</div></div>
    <div class="stat"><div class="lbl">Boarders</div><div class="val">${boarders}</div></div>
    <div class="stat"><div class="lbl">Non-Boarders</div><div class="val">${nonBoarders}</div></div>
    <div class="stat"><div class="lbl">Late Entries</div><div class="val">${lateEntries}</div></div>
  </div>
  <table>
    <thead><tr><th>Date</th><th>Time</th><th>Roll No.</th><th>Name</th><th>Status</th><th>Hostel</th><th>Room</th></tr></thead>
    <tbody>${tableRows}</tbody>
  </table>
  <div class="footer">Generated ${moment().format('MMM DD, YYYY [at] hh:mm A')} · UOG Hostel Management System</div>
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

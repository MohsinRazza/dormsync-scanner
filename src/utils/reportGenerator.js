import moment from 'moment';
import { parseLogMoment } from './logDateTime';
import { toast } from '../components/ui/toast';

const ROLL_NO_RE = /^\d{8}-\d{3}$/;
export const isValidRollNo = (qr) => ROLL_NO_RE.test(qr?.trim() || '');

export const downloadHTMLReport = (reportLogs, allotments, reportType, dateLabel) => {
  const lateEntryHour = 22;
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

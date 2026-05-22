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

import { downloadHTMLReport } from '../utils/reportGenerator';

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
    downloadHTMLReport(finalLogs, allotments, type, label);
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

import { X, FileText } from 'lucide-react';
import { Button } from './ui/button';

export default function ConfirmModal({ title, description, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-xs">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X size={14} />
          </Button>
        </div>
        <div className="p-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="default" size="sm" className="gap-2" onClick={onConfirm}>
              <FileText size={14} />
              Generate
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

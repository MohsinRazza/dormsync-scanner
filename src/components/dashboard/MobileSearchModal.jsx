import { Search, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function MobileSearchModal({
  open,
  onClose,
  searchInput,
  onSearchInputChange,
  searchTerm,
  onApplySearch,
  onClearSearch,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-16">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            Search
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <Input
            type="text"
            placeholder="Search by name or roll number..."
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onApplySearch();
                onClose();
              }
            }}
            className="pl-10"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => { onApplySearch(); onClose(); }}>
            Search
          </Button>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => {
                onClearSearch();
                onClose();
              }}
            >
              Clear
            </Button>
          )}
        </div>
        {searchTerm && (
          <p className="text-xs text-cyan-600 dark:text-cyan-400">
            Active: &quot;{searchTerm}&quot;
          </p>
        )}
      </div>
    </div>
  );
}

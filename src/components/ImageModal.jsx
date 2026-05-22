import { X, MapPin, Phone, Home, CreditCard, Mail, BookOpen, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { parseLogMoment } from '../utils/logDateTime';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { resolveImageUrl, getCachedImageUrl, getPlaceholderImage } from '../utils/imageLoader';
import FullscreenImageViewer from './FullscreenImageViewer';

const HOSTEL_LABELS = {
  'H1-ABH': 'Abubakar Hostel',
  'H2-UH': 'Usman Hostel',
  'H3-AH': 'Ali Hostel',
};
const hostelLabel = (code) => HOSTEL_LABELS[code] || code || 'N/A';

const ImageModal = ({ log, student, onClose }) => {
  const scanImagesPath = '/captured/';
  const profileImagesPath = '/images/students/';

  const rollNo = log?.['QR Code']?.trim();
  const profileImageBasePath = rollNo ? `${profileImagesPath}${rollNo}` : null;
  const primaryEmail = rollNo ? `${rollNo}@uog.edu.pk` : null;

  const lateEntryHour = 22;
  const entryMoment = parseLogMoment(log?.DateTime);
  const isLateEntry = entryMoment.isValid() && entryMoment.hour() >= lateEntryHour;

  const [fullscreenBasePath, setFullscreenBasePath] = useState(null);
  const [profileSrc, setProfileSrc] = useState(() => getCachedImageUrl(profileImageBasePath));

  useEffect(() => {
    if (!profileImageBasePath || profileSrc) return;
    resolveImageUrl(profileImageBasePath).then(setProfileSrc);
  }, [profileImageBasePath, profileSrc]);

  if (!log) return null;

  const imagePath = log.ImagePath?.replace(/\\/g, '/').split('/').pop();
  const scanImageUrl = `${scanImagesPath}${imagePath}`;

  const getStatusVariant = (status) => {
    if (status === 'Boarder') return 'success';
    if (status === 'Non-Boarder') return 'warning';
    return 'destructive';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start md:items-center justify-center z-50 p-3">
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-sm max-h-[90svh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Scan Record</h2>
            <p className="text-xs text-slate-500">
              {entryMoment.isValid() ? entryMoment.format('MMM DD, YYYY [at] hh:mm A') : '—'}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          {/* Scan image */}
          <div className="aspect-video bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <img
              src={scanImageUrl}
              alt="Scan capture"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = getPlaceholderImage('No Image'); }}
            />
          </div>

          {/* Identity row */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center text-cyan-600 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all"
              onClick={() => profileImageBasePath && setFullscreenBasePath(profileImageBasePath)}
            >
              {profileSrc
                ? <img src={profileSrc} alt="Profile" className="w-full h-full object-cover" />
                : <User size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                {student?.Name || 'Unregistered'}
              </p>
              <p className="text-xs text-slate-500 truncate">{rollNo}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <Badge variant={getStatusVariant(log.Status)} className="text-xs py-0">{log.Status}</Badge>
              {isLateEntry && <Badge variant="warning" className="text-xs py-0">Late</Badge>}
            </div>
          </div>

          {/* Hostel / Room / Contact / CNIC + full-width Location */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Home size={10} /> Hostel</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{hostelLabel(student?.Hostel)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><MapPin size={10} /> Room</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student?.Room || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Phone size={10} /> Contact</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student?.Contact || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5">CNIC</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student?.CNIC || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 col-span-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><MapPin size={10} /> Location</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {[student?.City, student?.District, student?.Province].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          {/* Degree + Department */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><BookOpen size={10} /> Degree</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {student?.DegreeLevel
                  ? `${student.DegreeLevel}${student?.Batch ? ` (20${student.Batch})` : ''}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5">Department</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student?.Department || 'N/A'}</p>
            </div>
          </div>

          {/* Email */}
          {primaryEmail && (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-xs">
              <p className="text-slate-400 mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{primaryEmail}</p>
              {student?.SecondaryEmail && (
                <p className="text-slate-500 truncate mt-0.5">{student.SecondaryEmail}</p>
              )}
            </div>
          )}

          {/* Mess + Arrears */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><CreditCard size={10} /> Mess</p>
              <p className="font-medium text-slate-900 dark:text-white">{student?.MessStatus || 'N/A'}</p>
            </div>
            {student?.Arrears ? (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg p-2">
                <p className="text-red-400 mb-0.5">Arrears</p>
                <p className="font-medium text-red-700 dark:text-red-300">{student.Arrears}</p>
              </div>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
                <p className="text-slate-400 mb-0.5">Arrears</p>
                <p className="font-medium text-slate-900 dark:text-white">None</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {fullscreenBasePath && (
        <FullscreenImageViewer
          basePath={fullscreenBasePath}
          alt="Profile photo"
          onClose={() => setFullscreenBasePath(null)}
        />
      )}
    </div>
  );
};

export default ImageModal;

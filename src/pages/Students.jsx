import { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Phone, User, Home, X, CreditCard, Mail, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectItem } from '../components/ui/select';
import FullscreenImageViewer from '../components/FullscreenImageViewer';
import LazyAvatar from '../components/LazyAvatar';
import { resolveImageUrl, getCachedImageUrl } from '../utils/imageLoader';

const HOSTEL_LABELS = {
  'H1-ABH': 'Abubakar Hostel',
  'H2-UH': 'Usman Hostel',
  'H3-AH': 'Ali Hostel',
};

const hostelLabel = (code) => HOSTEL_LABELS[code] || code || 'N/A';

const ClickableAvatar = ({ basePath, onClick, size = 'w-12 h-12', fallback }) => {
  const [src, setSrc] = useState(() => getCachedImageUrl(basePath));
  useEffect(() => {
    if (!basePath || src) return;
    resolveImageUrl(basePath).then(setSrc);
  }, [basePath, src]);
  return (
    <div
      className={`${size} rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center justify-center text-cyan-600 cursor-pointer hover:ring-2 hover:ring-cyan-500 transition-all`}
      onClick={onClick}
    >
      {src ? <img src={src} alt="Profile" className="w-full h-full object-cover" /> : fallback}
    </div>
  );
};

const StudentModal = ({ student, onClose }) => {
  if (!student) return null;
  const [fullscreenBasePath, setFullscreenBasePath] = useState(null);

  const profileImagesPath = localStorage.getItem('profileImagesPath') || '/images/students/';
  const rollNo = student['Roll No.']?.trim();
  const profileImageBasePath = rollNo ? `${profileImagesPath}${rollNo}` : null;
  const primaryEmail = rollNo ? `${rollNo}@uog.edu.pk` : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl w-full max-w-sm max-h-[90svh] overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-950 z-10">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Student Details</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X size={16} />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            {profileImageBasePath ? (
              <ClickableAvatar
                basePath={profileImageBasePath}
                onClick={() => setFullscreenBasePath(profileImageBasePath)}
                size="w-12 h-12"
                fallback={<User size={22} />}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-cyan-100 dark:bg-cyan-950 flex items-center justify-center text-cyan-600 flex-shrink-0">
                <User size={22} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{student.Name}</p>
              <p className="text-xs text-slate-500 truncate">{rollNo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Home size={10} /> Hostel</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{hostelLabel(student.Hostel)}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><MapPin size={10} /> Room</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student.Room || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><Phone size={10} /> Contact</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student.Contact || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5">CNIC</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student.CNIC || 'N/A'}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 col-span-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><MapPin size={10} /> Location</p>
              <p className="font-medium text-slate-900 dark:text-white">
                {[student.City, student.District, student.Province].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><BookOpen size={10} /> Degree</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">
                {student.DegreeLevel
                  ? `${student.DegreeLevel}${student.Batch ? ` (20${student.Batch})` : ''}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5">Department</p>
              <p className="font-medium text-slate-900 dark:text-white truncate">{student.Department || 'N/A'}</p>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2 text-xs">
            <p className="text-slate-400 mb-1 flex items-center gap-1"><Mail size={10} /> Email</p>
            <p className="font-medium text-slate-900 dark:text-white truncate">{primaryEmail}</p>
            {student.SecondaryEmail && (
              <p className="text-slate-500 truncate mt-0.5">{student.SecondaryEmail}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-2">
              <p className="text-slate-400 mb-0.5 flex items-center gap-1"><CreditCard size={10} /> Mess</p>
              <p className="font-medium text-slate-900 dark:text-white">{student.MessStatus || 'N/A'}</p>
            </div>
            {student.Arrears ? (
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

const Students = ({ allotments, liveArrears = false, liveArrearsLoading = false, onToggleLiveArrears }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedHostel, setSelectedHostel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showArrearsOnly, setShowArrearsOnly] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const profileImagesPath = localStorage.getItem('profileImagesPath') || '/images/students/';
  const allotmentsList = useMemo(() => Object.values(allotments), [allotments]);

  const hostels = useMemo(() =>
    [...new Set(allotmentsList.map(s => s.Hostel).filter(Boolean))].sort(),
    [allotmentsList]
  );

  const rooms = useMemo(() => {
    if (!selectedHostel) return [];
    return [...new Set(
      allotmentsList.filter(s => s.Hostel === selectedHostel).map(s => s.Room).filter(Boolean)
    )].sort();
  }, [allotmentsList, selectedHostel]);

  const arrearsCount = useMemo(
    () => allotmentsList.filter(s => s.Arrears).length,
    [allotmentsList]
  );

  const filteredStudents = useMemo(() => {
    let filtered = allotmentsList;
    if (selectedHostel) filtered = filtered.filter(s => s.Hostel === selectedHostel);
    if (selectedRoom) filtered = filtered.filter(s => s.Room === selectedRoom);
    if (showArrearsOnly) filtered = filtered.filter(s => s.Arrears);
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.Name?.toLowerCase().includes(q) || s['Roll No.']?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [allotmentsList, searchTerm, selectedHostel, selectedRoom, showArrearsOnly]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setSelectedHostel('');
    setSelectedRoom('');
    setShowArrearsOnly(false);
  };

  return (
    <div className="p-3 flex-1 flex flex-col overflow-hidden">
      <Card>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Hostel</label>
              <Select
                value={selectedHostel}
                onValueChange={(v) => { setSelectedHostel(v); setSelectedRoom(''); }}
                placeholder="All Hostels"
              >
                {hostels.map(h => (
                  <SelectItem key={h} value={h}>{hostelLabel(h)}</SelectItem>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Room</label>
              <Select
                value={selectedRoom}
                onValueChange={setSelectedRoom}
                placeholder="All Rooms"
                disabled={!selectedHostel}
              >
                {rooms.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Search</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <Input
                    type="text"
                    placeholder="Name or Roll No..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSearchTerm(searchInput); }}
                    className="pl-9"
                  />
                </div>
                <Button size="sm" onClick={() => setSearchTerm(searchInput)}>Go</Button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Actions</label>
              {/* Row 1: Arrears filter + Clear */}
              <div className="flex gap-2">
                <Button
                  variant={showArrearsOnly ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowArrearsOnly(v => !v)}
                  className="flex-1 gap-1.5"
                >
                  <AlertCircle size={14} />
                  Arrears {arrearsCount > 0 && `(${arrearsCount})`}
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearFilters} className="flex-1">
                  Clear
                </Button>
              </div>
              {/* Row 2: Live Arrears — full width, same size */}
              {onToggleLiveArrears && (
                <Button
                  variant={liveArrears ? 'default' : 'outline'}
                  size="sm"
                  onClick={onToggleLiveArrears}
                  disabled={liveArrearsLoading}
                  className="w-full gap-1.5"
                >
                  <RefreshCw size={14} className={liveArrearsLoading ? 'animate-spin' : ''} />
                  {liveArrearsLoading ? 'Fetching…' : liveArrears ? 'Live Arrears On' : 'Load Live Arrears'}
                </Button>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
          </p>
        </CardContent>
      </Card>

      <div className="flex-1 mt-3 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {filteredStudents.map((student) => {
            const sRollNo = student['Roll No.']?.trim();
            const sBasePath = sRollNo ? `${profileImagesPath}${sRollNo}` : null;
            return (
              <Card
                key={sRollNo || student.Name}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedStudent(student)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <LazyAvatar basePath={sBasePath} fallback={<User size={18} />} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">{student.Name}</h3>
                      <p className="text-xs text-slate-500 truncate">{sRollNo}</p>
                    </div>
                    {student.Arrears && (
                      <Badge variant="destructive" className="text-xs py-0 shrink-0">Arrears</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mt-2">
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                      <Home size={11} className="text-cyan-600 flex-shrink-0" />
                      <span className="truncate">{hostelLabel(student.Hostel)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate">
                      <MapPin size={11} className="text-cyan-600 flex-shrink-0" />
                      <span className="truncate">Room {student.Room || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 truncate col-span-2">
                      <Phone size={11} className="text-cyan-600 flex-shrink-0" />
                      <span className="truncate">{student.Contact || 'N/A'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredStudents.length === 0 && (
          <div className="flex items-center justify-center h-64 text-center">
            <div>
              <User className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-600 dark:text-slate-400">No Students Found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
};

export default Students;

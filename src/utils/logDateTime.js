import moment from 'moment';
import { LOG_DATE_FORMAT } from '../constants/logs';

/**
 * CSV times vary: "7:32:16" vs "08:32:16". Pad h/m/s so strict HH:mm:ss always works.
 */
export function normalizeScanDateTimeParts(dateStr, timeStr) {
  const date = dateStr?.trim().replace(/,\s*$/, '') ?? '';
  const timeRaw = timeStr?.trim().replace(/^\s*,?\s*/, '') ?? '';
  const parts = timeRaw.split(':');
  if (parts.length === 3) {
    const [h, m, s] = parts.map((p) => String(p).trim());
    const time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
    return `${date} ${time}`.trim();
  }
  return `${date} ${timeRaw}`.trim();
}

/**
 * Parse dashboard log DateTime (also handles legacy rows before normalization).
 */
export function parseLogMoment(value) {
  if (value == null || value === '' || value === 'Not Scanned') {
    return moment.invalid();
  }
  const s = String(value).trim().replace(/\s+/g, ' ');
  const idx = s.indexOf(' ');
  if (idx === -1) {
    return moment(s, LOG_DATE_FORMAT, true);
  }
  const normalized = normalizeScanDateTimeParts(
    s.slice(0, idx),
    s.slice(idx + 1)
  );
  return moment(normalized, LOG_DATE_FORMAT, true);
}

/**
 * Canonical scan log datetime after normalization (see `normalizeScanDateTimeParts`).
 * Source CSV may use 1-digit hours (e.g. `7:32:16`); we pad to `HH:mm:ss` when loading.
 */
export const LOG_DATE_FORMAT = 'DD/MM/YYYY HH:mm:ss';

/**
 * Fetches live Arrears data from the Google Sheets BIO tab.
 * The sheet must be shared as "Anyone with the link can view".
 *
 * Row 0 = warden metadata (skip)
 * Row 1 = actual column headers
 * Row 2+ = data rows
 *
 * We only update Arrears for roll numbers already in the local
 * allotments map (currently allotted students).
 *
 * Result is cached in module scope — no re-fetch on subsequent toggles.
 */

import Papa from 'papaparse';

const SHEET_ID = '1T1vZtKmMtxPCk_7Mp-ymbNOZRUgpipqXZ97wxmu9EfI';
const GID = '161672061'; // the BIO sheet's gid from the URL

let cachedArrearsMap = null; // Map<rollNo, arrearsString>

export function clearArrearsCache() {
  cachedArrearsMap = null;
}

export async function fetchLiveArrears() {
  if (cachedArrearsMap) return cachedArrearsMap;

  // Direct CSV export — works for publicly shared sheets
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheet fetch failed: ${res.status} ${res.statusText}`);

  const text = await res.text();
  const map = parseArrearsFromCsv(text);
  cachedArrearsMap = map;
  return map;
}

function parseArrearsFromCsv(csvText) {
  // Parse the entire CSV at once so column counts are consistent
  const { data: allRows } = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: false, // keep empty rows so indices stay correct
  });

  // Row 0 = warden metadata, Row 1 = actual headers
  if (allRows.length < 3) return new Map();

  const headers = (allRows[1] || []).map(h => String(h).trim().toLowerCase());

  // Prefer exact 'arrears' match, fall back to 'total' only if not found
  const rollNoIdx = headers.findIndex(h => h === 'roll no.' || h.includes('roll no'));
  const arrearsIdx = headers.findIndex(h => h === 'arrears' || h.includes('arrear'));

  // console.log(`[liveArrears] headers (${headers.length}):`, headers);
  // console.log(`[liveArrears] rollNoIdx=${rollNoIdx} arrearsIdx=${arrearsIdx}`);

  if (rollNoIdx === -1 || arrearsIdx === -1) {
    console.warn('[liveArrears] Could not find Roll No. or Arrears column', headers);
    return new Map();
  }

  const map = new Map();
  // Data starts at row index 2
  for (let i = 2; i < allRows.length; i++) {
    const cols = allRows[i];
    const rollNo = cols[rollNoIdx]?.trim();
    if (!rollNo) continue;

    const arrears = cols[arrearsIdx]?.trim();
    const hasArrears = arrears && arrears !== '-' && arrears !== '' && arrears !== '0';
    map.set(rollNo, hasArrears ? arrears : '');
  }

  // console.log(`[liveArrears] parsed ${map.size} entries`);
  return map;
}

/**
 * Merge live arrears into the existing allotments map.
 * Only updates students already present in localAllotments.
 * Returns a new object — does not mutate the original.
 */
export function mergeArrearsIntoAllotments(localAllotments, arrearsMap) {
  const merged = {};
  for (const [rollNo, student] of Object.entries(localAllotments)) {
    merged[rollNo] = arrearsMap.has(rollNo)
      ? { ...student, Arrears: arrearsMap.get(rollNo) }
      : student;
  }
  return merged;
}

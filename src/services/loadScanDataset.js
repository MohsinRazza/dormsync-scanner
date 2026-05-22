import Papa from 'papaparse';
import { normalizeScanDateTimeParts, parseLogMoment } from '../utils/logDateTime';

export class ScanDataParseError extends Error {
  constructor(message = 'CSV parse failed', cause) {
    super(message, cause ? { cause } : undefined);
    this.name = 'ScanDataParseError';
  }
}

function resolveDataUrls(dataSource) {
  let scanLogsUrl, allotmentsUrl;

  if (dataSource === 'local') {
    scanLogsUrl = '/scanner-logs/scan_log.csv';
    allotmentsUrl = '/scanner-logs/allotments.csv';
  } else {
    // remote
    scanLogsUrl = import.meta.env.VITE_SCAN_LOGS_URL;
    allotmentsUrl = scanLogsUrl.replace('scan_log.csv', 'allotments.csv');
  }

  return { scanLogsUrl, allotmentsUrl, headers: {} };
}

function parseAllotmentsCsv(allotmentsText) {
  return new Promise((resolve, reject) => {
    Papa.parse(allotmentsText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const allotMap = {};
        result.data.forEach((row) => {
          const rollNo = row['Roll No.']?.trim();
          if (!rollNo) return;

          // Email ID column contains "primary, secondary" — extract secondary only
          const emailRaw = row['Email ID']?.trim() || '';
          const emailParts = emailRaw.split(',').map(e => e.trim()).filter(Boolean);
          // Primary is always rollNo@uog.edu.pk — secondary is anything else
          const secondaryEmail = emailParts.find(e => !e.startsWith(rollNo)) || '';

          // Arrears: '-' means none
          const arrears = row['Arrears']?.trim();
          const hasArrears = arrears && arrears !== '-';

          allotMap[rollNo] = {
            'Roll No.': rollNo,
            Name: row.Name?.trim(),
            Hostel: row.Hostel?.trim(),
            Room: row.Room?.trim(),
            Contact: row.Contact?.trim(),
            Batch: row.Batch?.trim(),
            Arrears: hasArrears ? arrears : '',
            MessStatus: row['Mess Status']?.trim(),
            DegreeLevel: row['Degree Level']?.trim(),
            Department: row['Department']?.trim().replace(/\s*Dept\.?$/i, ''),
            SecondaryEmail: secondaryEmail,
            CNIC: row['CNIC']?.trim(),
            City: row['City']?.trim(),
            District: (row['District'] || row['Ditrict'])?.trim(),
            Province: row['Province']?.trim(),
          };
        });
        resolve(allotMap);
      },
      error: (err) => reject(new ScanDataParseError(undefined, err)),
    });
  });
}

function parseScanLogsCsv(csvText) {
  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const processedLogs = result.data
          .filter((row) => {
            if (
              row.Name?.trim() === 'LAST UPDAED LOGS' ||
              row.Name?.trim() === 'LAST UPDATED LOGS'
            ) {
              return false;
            }
            return row.Date_ && row.QR_Code && row.QR_Code !== 'NULL';
          })
          .map((row) => {
            const date = row.Date_?.trim().replace(/,\s*$/, '');
            const time = row.Time?.trim().replace(/^\s*,?\s*/, '');
            const dateTimeStr = normalizeScanDateTimeParts(date, time);
            const parsedDate = parseLogMoment(dateTimeStr);

            if (!parsedDate.isValid()) {
              console.warn('Invalid date:', dateTimeStr, 'from row:', row);
            }

            return {
              DateTime: dateTimeStr,
              'QR Code': row.QR_Code?.trim(),
              Status: row.Status?.trim(),
              Name: row.Name?.trim(),
              Hostel: row.Hostel?.trim(),
              Room: row.RoomNo?.trim(),
              Mobile: row.MobileNo?.trim(),
              ImagePath: row.Image_Path?.trim(),
            };
          });

        let lastScan = null;
        if (processedLogs.length > 0) {
          const sortedByDate = [...processedLogs].sort((a, b) => {
            const dateA = parseLogMoment(a.DateTime);
            const dateB = parseLogMoment(b.DateTime);
            return dateB.valueOf() - dateA.valueOf();
          });
          const lastScanDate = parseLogMoment(sortedByDate[0].DateTime);
          if (lastScanDate.isValid()) {
            lastScan = lastScanDate.toDate();
          }
        }

        resolve({ logs: processedLogs, lastScan });
      },
      error: (err) => reject(new ScanDataParseError(undefined, err)),
    });
  });
}

/**
 * Fetches scan_log.csv + allotments.csv, parses them, returns structured data.
 */
export async function loadScanDataset(dataSource = 'local') {
  const { scanLogsUrl, allotmentsUrl, headers } = resolveDataUrls(dataSource);

  const [logsResponse, allotmentsResponse] = await Promise.all([
    fetch(scanLogsUrl, { headers }),
    fetch(allotmentsUrl, { headers }),
  ]);

  if (!logsResponse.ok) {
    throw new Error(
      `Failed to fetch scan logs: ${logsResponse.status} ${logsResponse.statusText}`
    );
  }

  if (!allotmentsResponse.ok) {
    throw new Error(
      `Failed to fetch allotments: ${allotmentsResponse.status} ${allotmentsResponse.statusText}`
    );
  }

  const [csvText, allotmentsText] = await Promise.all([
    logsResponse.text(),
    allotmentsResponse.text(),
  ]);

  const [allotments, { logs, lastScan }] = await Promise.all([
    parseAllotmentsCsv(allotmentsText),
    parseScanLogsCsv(csvText),
  ]);

  return { allotments, logs, lastScan };
}

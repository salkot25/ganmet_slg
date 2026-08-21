import * as XLSX from 'xlsx';
import { formatDMY } from './dateHelpers';

/**
 * Parses uploaded Excel (.xlsx, .xls) or CSV file into standard JSON records
 */
export async function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });

        // Get first sheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        if (!worksheet) {
          throw new Error('Lembar kerja (worksheet) Excel kosong atau tidak ditemukan.');
        }

        // Convert to JSON array with raw dates
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Tidak ada baris data yang ditemukan di dalam file Excel.');
        }

        // Normalize rows and format date columns
        const cleanedRecords = rawJson.map((row) => {
          const cleanRow = {};
          Object.entries(row).forEach(([key, val]) => {
            const cleanKey = String(key).trim();
            if (!cleanKey) return;

            let cleanVal = val;
            if (val instanceof Date) {
              cleanVal = formatDMY(val);
            } else if (typeof val === 'string') {
              cleanVal = val.trim();
            }
            cleanRow[cleanKey] = cleanVal;
          });
          return cleanRow;
        });

        resolve(cleanedRecords);
      } catch (err) {
        reject(new Error(`Gagal membaca file Excel: ${err.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file dari komputer Anda.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

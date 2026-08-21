/**
 * Pure date manipulation utilities
 * Supports DD/MM/YYYY, ISO strings, and standard Date formats
 */

export function parseDMY(dateStr) {
  if (!dateStr) return null;
  const str = String(dateStr).trim();

  // 1. DD/MM/YYYY
  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
  }

  // 2. ISO or standard date string (e.g. 2024-01-02T17:00:00.000Z or 2024-01-03)
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

export function formatDMY(date) {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

export function getPresetDateRange(preset) {
  if (preset === '2024') {
    return {
      start: new Date(2024, 0, 1),
      end: new Date(2024, 11, 31, 23, 59, 59)
    };
  }
  if (preset === '2025') {
    return {
      start: new Date(2025, 0, 1),
      end: new Date(2025, 11, 31, 23, 59, 59)
    };
  }
  if (preset === '2026') {
    return {
      start: new Date(2026, 0, 1),
      end: new Date(2026, 11, 31, 23, 59, 59)
    };
  }
  if (preset === 'last30') {
    const end = new Date(2026, 5, 29); // Latest date in dataset
    const start = new Date(end);
    start.setDate(start.getDate() - 30);
    return { start, end };
  }
  return { start: null, end: null };
}

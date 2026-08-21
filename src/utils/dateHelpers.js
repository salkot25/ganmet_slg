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

export function getPresetDateRange(preset, datasetLatestDate = null) {
  const refDate = datasetLatestDate || new Date();
  
  if (preset === 'today') {
    const start = new Date(refDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(refDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'last7') {
    const end = new Date(refDate);
    end.setHours(23, 59, 59, 999);
    const start = new Date(refDate);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (preset === 'last30') {
    const end = new Date(refDate);
    end.setHours(23, 59, 59, 999);
    const start = new Date(refDate);
    start.setDate(start.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (preset === 'thisMonth') {
    const start = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const end = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  }

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
  
  return { start: null, end: null };
}

/**
 * Format relative time (e.g. "baru saja", "2 menit lalu", "1 jam lalu")
 */
export function formatRelativeTime(date) {
  if (!date) return 'Belum pernah';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 30) return 'Baru saja';
  if (diffInSeconds < 60) return `${diffInSeconds} detik yang lalu`;
  
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} menit yang lalu`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam yang lalu`;
  
  return formatDMY(date);
}

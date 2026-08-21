/**
 * Pure formatting utilities
 * Single Responsibility: Format numbers, percentages, dates, and currency
 */

const indonesianNumberFormatter = new Intl.NumberFormat('id-ID');

export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return indonesianNumberFormatter.format(num);
}

export function formatPercent(val, total) {
  if (!total || total === 0 || !val) return '0.0';
  return ((val / total) * 100).toFixed(1);
}

export function formatDaya(daya) {
  if (!daya) return '-';
  return `${formatNumber(daya)} VA`;
}

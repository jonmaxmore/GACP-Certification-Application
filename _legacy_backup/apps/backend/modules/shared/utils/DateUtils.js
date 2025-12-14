/**
 * Date Utilities
 * Common date manipulation functions for the GACP platform
 */

/**
 * Format date to Thai Buddhist calendar
 */
function toThaiDate(date) {
  const d = new Date(date);
  const year = d.getFullYear() + 543; // Convert to Buddhist calendar
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${day}/${month}/${year}`;
}

/**
 * Format date to ISO string
 */
function toISODate(date) {
  return new Date(date).toISOString();
}

/**
 * Get date range for queries
 */
function getDateRange(range) {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

/**
 * Calculate days between dates
 */
function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Add days to date
 */
function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Check if date is in the past
 */
function isPastDate(date) {
  return new Date(date) < new Date();
}

/**
 * Check if date is in the future
 */
function isFutureDate(date) {
  return new Date(date) > new Date();
}

/**
 * Format timestamp for logging
 */
function formatTimestamp(date = new Date()) {
  return date.toISOString().replace('T', ' ').split('.')[0];
}

module.exports = {
  toThaiDate,
  toISODate,
  getDateRange,
  daysBetween,
  addDays,
  isPastDate,
  isFutureDate,
  formatTimestamp,
};

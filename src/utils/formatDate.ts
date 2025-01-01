/**
 * Formats a date into a readable string
 * @param date - Date object or string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDate:', date);
    return 'Invalid date';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateObj.toLocaleDateString();
  }
}

/**
 * Formats a date with time into a readable string
 * @param date - Date object or string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Formatted date and time string
 */
export function formatDateTime(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatDateTime:', date);
    return 'Invalid date';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return dateObj.toLocaleString();
  }
}

/**
 * Formats a date in a relative format (e.g., "2 days ago")
 * @param date - Date object or string to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatRelativeTime:', date);
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  try {
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);

      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }

    return 'Just now';
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return formatDate(dateObj);
  }
}

/**
 * Formats a date in a short format (e.g., "Mar 15, 2024")
 * @param date - Date object or string to format
 * @param locale - Locale to use for formatting (default: 'en-US')
 * @returns Short formatted date string
 */
export function formatShortDate(date: Date | string, locale: string = 'en-US'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    console.error('Invalid date provided to formatShortDate:', date);
    return 'Invalid date';
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting short date:', error);
    return dateObj.toLocaleDateString();
  }
}

export default {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatShortDate,
};

/**
 * Converts a string to a URL-friendly slug
 * 
 * @param text The string to slugify
 * @returns A URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Truncates a string to a specified length
 * 
 * @param text The string to truncate
 * @param length The maximum length
 * @param suffix Optional suffix to add (default: '...')
 * @returns Truncated string
 */
export function truncate(text: string, length: number, suffix: string = '...'): string {
  if (!text) return '';
  if (text.length <= length) return text;

  return text.substring(0, length).trim() + suffix;
}

/**
 * Capitalizes the first letter of a string
 * 
 * @param text The string to capitalize
 * @returns String with first letter capitalized
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Converts a string to title case
 * 
 * @param text The string to convert
 * @returns String in title case
 */
export function toTitleCase(text: string): string {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Removes HTML tags from a string
 * 
 * @param html String containing HTML
 * @returns Plain text string with HTML removed
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

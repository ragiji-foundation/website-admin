/**
 * Extracts the first image URL from HTML content using regex
 * Works in both browser and server environments
 * 
 * @param htmlContent The HTML content to parse
 * @returns The URL of the first image found or null if no image exists
 */
export function extractFirstImageUrl(htmlContent: string): string | null {
  if (!htmlContent) return null;

  // Use regex to find image src
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = htmlContent.match(imgRegex);

  // Return the captured URL if a match was found
  return match ? match[1] : null;
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * 
 * @param text The text to truncate
 * @param maxLength Maximum length of the truncated text
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Strips HTML tags from a string and returns plain text
 * 
 * @param html HTML content
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
}

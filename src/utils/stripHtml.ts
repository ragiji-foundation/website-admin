export function stripHtml(html: string): string {
  if (!html) return '';
  // First, remove script and style tags and their contents
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>|<style[^>]*>[\s\S]*?<\/style>/gi, '');
  // Then remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  // Replace multiple spaces and newlines with a single space
  text = text.replace(/\s\s+/g, ' ');
  // Trim and decode HTML entities
  text = text.trim();
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

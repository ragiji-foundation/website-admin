import DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side - return as is (should implement server-side sanitization if needed)
    return html;
  }

  // Client-side sanitization
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'b', 'i', 'strong', 'em',
      'u', 'a', 'ul', 'ol', 'li', 'blockquote',
      'code', 'pre', 'hr', 'img', 'table',
      'thead', 'tbody', 'tr', 'th', 'td', 'mark',
      'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt',
      'class', 'id', 'style', 'width', 'height',
      'align', 'title', 'rowspan', 'colspan'
    ],
    ALLOW_DATA_ATTR: false,
  });
};

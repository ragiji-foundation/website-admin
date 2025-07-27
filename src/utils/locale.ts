// Helper function for locale-aware API calls
export const fetchWithLocale = async (url: string, locale: string = 'en', options?: RequestInit) => {
  const separator = url.includes('?') ? '&' : '?';
  const localeUrl = `${url}${separator}locale=${locale}`;
  
  const response = await fetch(localeUrl, options);
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  return response.json();
};

// Helper to get localized content
export const getLocalizedContent = (item: Record<string, any>, field: string, locale: string) => {
  if (locale === 'hi') {
    const hindiField = `${field}Hi`;
    return item[hindiField] || item[field];
  }
  return item[field];
};
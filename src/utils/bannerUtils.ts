import { Banner, BannerType } from '@/types/banner';

// Default banner title for fallbacks
const DEFAULT_TITLES: Record<BannerType, string> = {
  blog: 'Blog',
  about: 'About Us',
  initiatives: 'Our Initiatives',
  successstories: 'Success Stories',
  home: 'Welcome',
  media: 'Media',
  electronicmedia: 'Electronic Media',
  gallery: 'Gallery',
  newscoverage: 'News Coverage',
  ourstory: 'Our Story',
  need: 'The Need',
  centers: 'Our Centers',
  contactus: 'Contact Us',
  careers: 'Careers',
  awards: 'Awards & Recognition'
};

// Map of banner types to their gradient colors - using India flag inspired colors
const GRADIENT_COLORS: Record<BannerType, string> = {
  blog: 'linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  about: 'linear-gradient(135deg, #138808 0%, #FFFFFF 50%, #FF9933 100%)',
  initiatives: 'linear-gradient(45deg, #FF9933 0%, #FFFFFF 40%, #138808 80%)',
  successstories: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  home: 'linear-gradient(180deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
  media: 'linear-gradient(135deg, #FF9933 20%, #FFFFFF 50%, #138808 80%)',
  electronicmedia: 'linear-gradient(45deg, #138808 0%, #FFFFFF 50%, #FF9933 100%)',
  gallery: 'linear-gradient(90deg, #138808 0%, #FFFFFF 50%, #FF9933 100%)',
  newscoverage: 'linear-gradient(135deg, #FF9933 10%, #FFFFFF 50%, #138808 90%)',
  ourstory: 'linear-gradient(45deg, #FF9933 10%, #FFFFFF 50%, #138808 90%)',
  need: 'linear-gradient(180deg, #138808 0%, #FFFFFF 50%, #FF9933 100%)',
  centers: 'linear-gradient(90deg, #FF9933 10%, #FFFFFF 40%, #138808 90%)',
  contactus: 'linear-gradient(135deg, #138808 10%, #FFFFFF 60%, #FF9933 90%)',
  careers: 'linear-gradient(45deg, #FF9933 20%, #FFFFFF 60%, #138808 90%)',
  awards: 'linear-gradient(90deg, #138808 10%, #FFFFFF 60%, #FF9933 90%)'
};

/**
 * Create a data URI for a gradient background to use as fallback
 * @param type Banner type
 * @returns Data URI string
 */
export function createGradientDataUri(type: BannerType): string {
  // Default to the blog gradient if the type doesn't exist
  const gradient = GRADIENT_COLORS[type] || GRADIENT_COLORS.blog;

  // Create an SVG with the gradient
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="400" viewBox="0 0 1200 400">
      <rect width="1200" height="400" fill="${gradient}" />
    </svg>
  `;

  // Convert to data URI
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Generate a default banner for a given type
 * @param type Banner type
 * @returns A banner object with default values
 */
export function generateDefaultBanner(type: BannerType): Banner {
  return {
    id: `default-${type}`,
    type,
    title: DEFAULT_TITLES[type] || 'Banner',
    description: null,
    backgroundImage: createGradientDataUri(type),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Get a banner by type, with fallback to default if not found
 * @param banners List of available banners
 * @param type Banner type to find
 * @param useFallback Whether to generate a default banner if not found
 * @returns Banner object or undefined
 */
export function getBannerByType(
  banners: Banner[],
  type: BannerType | string,
  useFallback: boolean = true
): Banner | undefined {
  const banner = banners.find(b => b.type === type);

  if (!banner && useFallback) {
    return generateDefaultBanner(type as BannerType);
  }

  return banner;
}

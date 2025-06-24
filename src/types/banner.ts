/**
 * Type definitions for the Banner model
 */

// Define all valid banner types
export type BannerType =
  | 'blog'
  | 'about'
  | 'initiatives'
  | 'successstories'
  | 'home'
  | 'media'
  | 'electronicmedia'
  | 'gallery'
  | 'newscoverage'
  | 'ourstory'
  | 'need'
  | 'centers'
  | 'contactus'
  | 'careers'
  | 'awards';

// Banner interface matching the Prisma model
export interface Banner {
  id: string;
  type: string;
  title: string;
  titleHi?: string;
  description: string | null;
  descriptionHi?: string | null;
  backgroundImage: string;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating a new banner
export interface CreateBannerDto {
  type: BannerType;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  backgroundImage: string;
}

// Interface for updating an existing banner
export interface UpdateBannerDto {
  title?: string;
  titleHi?: string;
  description?: string | null;
  descriptionHi?: string | null;
  backgroundImage?: string;
  type?: BannerType;
}

// Type guard to check if a string is a valid banner type
export function isBannerType(type: string): type is BannerType {
  return [
    'blog', 'about', 'initiatives', 'successstories', 'home', 'media',
    'electronicmedia', 'gallery', 'newscoverage', 'ourstory', 'need',
    'centers', 'contactus', 'careers', 'awards'
  ].includes(type);
}

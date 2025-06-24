export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

export interface Feature {
  id: string;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  mediaType: string;
  mediaUrl: string;
  thumbnail?: string;
  order: number;
  section?: string;
  createdAt: string;
  updatedAt: string;
  // Legacy fields for backward compatibility
  slug?: string;
  category?: string;
  mediaItem?: MediaItem;
}

export interface FeatureSection {
  id: string;
  identifier: string;
  heading: string;
  headingHi?: string;
  ctaText: string;
  ctaTextHi?: string;
  ctaUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureWithSection = Feature & {
  sectionDetails?: FeatureSection;
};

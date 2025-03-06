export interface MediaItem {
  type: 'video' | 'image';
  url: string;
  thumbnail?: string;
}

export interface Feature {
  id: string;
  title: string;
  description: any; // Rich text content
  mediaItem: MediaItem;
  slug?: string;
  order?: number;
  category?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureSection {
  id: string;
  identifier: string;
  heading: string;
  ctaText: string;
  ctaUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export type FeatureWithSection = Feature & {
  sectionDetails?: FeatureSection;
};

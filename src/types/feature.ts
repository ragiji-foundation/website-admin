export interface Feature {
  id: string;
  title: string;
  description: any; // Json type
  mediaType: string;
  mediaUrl: string;
  thumbnail?: string | null;
  order: number;
  section: string;
  createdAt: Date;
  updatedAt: Date;
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

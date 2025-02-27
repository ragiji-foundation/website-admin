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

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  description?: string | null;
  backgroundImage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BannerCreateInput {
  type: BannerType;
  title: string;
  description?: string;
  backgroundImage: string;
}

export interface BannerUpdateInput {
  type?: BannerType;
  title?: string;
  description?: string | null;
  backgroundImage?: string;
}

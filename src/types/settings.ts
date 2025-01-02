export interface Settings {
  id: number;
  siteName: string;
  siteDescription: string;
  primaryColor: string;
  logoUrl: string | null;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    facebook: string;
    instagram: string;
  };
  maintenance: boolean;
  updatedAt: Date;
} 
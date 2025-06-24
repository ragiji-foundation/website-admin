export interface GalleryItem {
  id: string | number;
  title: string;
  titleHi?: string;
  description?: string;
  descriptionHi?: string;
  imageUrl?: string; // Make imageUrl optional with the ? syntax
  category?: string; // Make category optional
  categoryHi?: string;
  tags?: string[];
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export const CATEGORIES = [
  { value: 'event', label: 'Event' },
  { value: 'center', label: 'Center' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'blog', label: 'Blog' },
  { value: 'general', label: 'General' },
] as const;

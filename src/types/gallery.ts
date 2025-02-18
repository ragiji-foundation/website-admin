export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  category: string;
}

export const CATEGORIES = [
  { value: 'event', label: 'Event' },
  { value: 'center', label: 'Center' },
  { value: 'initiative', label: 'Initiative' },
  { value: 'blog', label: 'Blog' },
  { value: 'general', label: 'General' },
] as const;

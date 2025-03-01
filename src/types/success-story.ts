export interface SuccessStory {
  id: string;
  title: string;
  content: any; // Rich text content
  personName: string;
  location: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

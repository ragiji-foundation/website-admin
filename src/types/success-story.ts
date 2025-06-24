export interface SuccessStory {
  id: string;
  title: string;
  titleHi?: string;
  content: any; // Rich text content
  contentHi?: any;
  personName: string;
  personNameHi?: string;
  location: string;
  locationHi?: string;
  imageUrl?: string;
  featured: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

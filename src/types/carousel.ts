// types/carousel.ts

export type CarouselType = 'image' | 'video';

export type Carousel = {
  id: number;
  title: string;
  imageUrl: string | null;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  type: CarouselType;
  videoUrl?: string | null;
};

export type CarouselCreateInput = {
  title: string;
  imageUrl?: string;
  link?: string;
  active?: boolean;
  order?: number;
  type: CarouselType;
  videoUrl?: string;
};

export type CarouselUpdateInput = Partial<CarouselCreateInput>;
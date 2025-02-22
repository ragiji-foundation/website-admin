// types/carousel.ts

export type Carousel = {
  id: number;
  title: string;
  imageUrl: string | null;
  link: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CarouselCreateInput = {
  title: string;
  imageUrl?: string;
  link?: string;
  active?: boolean;
  order?: number;
};

export type CarouselUpdateInput = Partial<CarouselCreateInput>;
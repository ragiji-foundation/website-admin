export interface Award {
  id: string;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  organization: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AwardCreateInput {
  title: string;
  year: string;
  description: string;
  imageUrl?: string;
  organization: string;
}

export interface AwardUpdateInput extends Partial<AwardCreateInput> {
  id: string;
}


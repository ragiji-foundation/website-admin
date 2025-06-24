export interface Award {
  id: string;
  title: string;
  titleHi?: string;
  year: string;
  description: string;
  descriptionHi?: string;
  imageUrl: string;
  organization: string;
  organizationHi?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AwardCreateInput {
  title: string;
  titleHi?: string;
  year: string;
  description: string;
  descriptionHi?: string;
  imageUrl?: string;
  organization: string;
  organizationHi?: string;
}

export interface AwardUpdateInput extends Partial<AwardCreateInput> {
  id: string;
}


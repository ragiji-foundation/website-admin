export interface Stat {
  id: string;
  value: string;
  label: string;
  labelHi?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StatCreateInput = {
  value: string;
  label: string;
  labelHi?: string;
  order?: number;
};

export type StatUpdateInput = Partial<StatCreateInput>;

export interface Stat {
  id: string;
  value: string;
  label: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export type StatCreateInput = {
  value: string;
  label: string;
  order?: number;
};

export type StatUpdateInput = Partial<StatCreateInput>;

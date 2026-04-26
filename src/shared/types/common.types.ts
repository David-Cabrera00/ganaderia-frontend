export interface Option<T extends string | number = string> {
  value: T;
  label: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  direction?: 'ASC' | 'DESC';
}

export type Nullable<T> = T | null;

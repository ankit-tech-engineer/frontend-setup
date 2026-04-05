export interface QueryParams {
  filter?: Record<string, any>;
  select?: string[] | string;
  sort?: Record<string, 1 | -1> | string;
  limit?: number;
  skip?: number;
  page?: number;
  noLimit?: boolean;
}

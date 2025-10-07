export interface PaginatedResponse<T> {
  total?: number;
  limit?: number;
  offset?: number;
  data: T[];
}

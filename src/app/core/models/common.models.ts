// ─── Paginated List ───
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// ─── Problem Details (RFC 7807) ───
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  requestId?: string;
}

// ─── Page Request ───
export interface PageRequest {
  pageNumber?: number;
  pageSize?: number;
}

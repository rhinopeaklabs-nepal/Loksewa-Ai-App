/**
 * Pagination request/response types
 * Used across all list endpoints for consistent pagination
 */

/**
 * Query parameters for paginated requests
 */
export interface PaginationQuery {
  /** Page number (1-indexed), defaults to 1 */
  page?: number;
  /** Items per page, defaults to 20 */
  limit?: number;
  /** Optional sort field */
  sortBy?: string;
  /** Sort direction: 'asc' or 'desc', defaults to 'desc' */
  sortOrder?: "asc" | "desc";
}

/**
 * Pagination metadata included in responses
 */
export interface PaginationMeta {
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items */
  total: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrev: boolean;
}

/**
 * Generic paginated result type
 * @template T - The type of items in the result
 */
export interface PaginatedResult<T> {
  /** Array of items for the current page */
  items: T[];
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of items across all pages */
  total: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Create pagination metadata from query and total
 */
export function createPaginationMeta(
  query: PaginationQuery,
  total: number
): PaginationMeta {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}

/**
 * Calculate offset for database queries
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Default pagination values
 */
export const DEFAULT_PAGINATION: Required<PaginationQuery> = {
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc"
};

/**
 * Maximum allowed items per page
 */
export const MAX_PAGE_SIZE = 100;
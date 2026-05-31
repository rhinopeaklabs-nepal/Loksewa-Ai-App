/**
 * Pagination options for repository queries
 */
export interface PaginationOptions {
  /** Page number (1-indexed) */
  page: number;
  /** Number of items per page */
  limit: number;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  /** Array of items for current page */
  data: T[];
  /** Total count of items across all pages */
  total: number;
  /** Current page number */
  page: number;
  /** Items per page */
  limit: number;
  /** Total number of pages */
  totalPages: number;
}

/**
 * Filter options for repository queries
 */
export interface FindFilter {
  /** Optional search term */
  search?: string;
  /** Field to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: "asc" | "desc";
}

/**
 * Generic repository interface for data access.
 * Implement this interface for each domain entity.
 */
export interface BaseRepository<
  TEntity extends { id: string },
  TId = string,
  TFilter = FindFilter
> {
  /**
   * Find a single entity by its ID
   * @param id - The entity ID
   * @returns The entity or null if not found
   */
  findById(id: TId): Promise<TEntity | null>;

  /**
   * Find multiple entities with optional filtering
   * @param filter - Optional filter options
   * @returns Array of matching entities
   */
  findMany(filter?: TFilter): Promise<TEntity[]>;

  /**
   * Find entities with pagination
   * @param filter - Filter options including pagination
   * @returns Paginated result
   */
  findPaginated(filter?: TFilter & PaginationOptions): Promise<PaginatedResult<TEntity>>;

  /**
   * Create a new entity
   * @param data - Partial entity data for creation
   * @returns The created entity
   */
  create(data: Partial<TEntity>): Promise<TEntity>;

  /**
   * Update an existing entity
   * @param id - The entity ID to update
   * @param data - Partial entity data for update
   * @returns The updated entity
   */
  update(id: TId, data: Partial<TEntity>): Promise<TEntity>;

  /**
   * Soft delete an entity (mark as deleted)
   * @param id - The entity ID to delete
   */
  delete(id: TId): Promise<void>;

  /**
   * Check if an entity exists by ID
   * @param id - The entity ID
   * @returns True if entity exists
   */
  exists(id: TId): Promise<boolean>;

  /**
   * Count entities matching filter
   * @param filter - Optional filter
   * @returns Count of matching entities
   */
  count(filter?: TFilter): Promise<number>;
}
/**
 * Common shared types for the application
 */

// UUID type alias for cleaner type signatures
export type UUID = string;

// ISO 8601 date string format
export type DateString = string;

// Email address type
export type Email = string;

// URL string type
export type URL = string;

// Pagination types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Standard API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

// Base entity interface for all database entities
export interface BaseEntity {
  id: UUID;
  createdAt: Date;
  updatedAt: Date;
}

// Soft-delete entity interface
export interface SoftDeletable extends BaseEntity {
  deletedAt?: Date;
}

// Timestamped mixin for entities
export interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

// Pagination meta information
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request options for service layer
export interface FindOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  filters?: Record<string, unknown>;
}

// Generic result wrapper for async operations
export interface Result<T, E = Error> {
  ok: boolean;
  value?: T;
  error?: E;
}

// Async result helper
export function ok<T>(value: T): Result<T> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<unknown, E> {
  return { ok: false, error };
}
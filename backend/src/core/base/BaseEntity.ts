/**
 * Base entity interface for all domain entities.
 * Provides common fields for id and timestamps.
 */
export interface BaseEntity {
  /** Unique identifier for the entity */
  id: string;
  /** Timestamp when the entity was created */
  createdAt: Date;
  /** Timestamp when the entity was last updated */
  updatedAt: Date;
  /** Mark the entity as updated with current timestamp */
  touch(): void;
  /** Check if entity is new (not yet persisted) */
  isNew(): boolean;
}

/**
 * Abstract base class for domain entities.
 * Use this as a base for all domain entity classes.
 */
export abstract class BaseEntity implements BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id?: string) {
    this.id = id ?? crypto.randomUUID();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  touch(): void {
    this.updatedAt = new Date();
  }

  isNew(): boolean {
    return false;
  }
}
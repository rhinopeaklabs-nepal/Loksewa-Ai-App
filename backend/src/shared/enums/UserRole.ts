/**
 * User roles enumeration
 * Defines the different access levels within the system
 */
export enum UserRole {
  /** Full system access */
  Admin = "admin",
  /** Standard user with basic access */
  Student = "student",
  /** Content moderation and review access */
  Moderator = "moderator",
  /** Content reviewer with limited write access */
  Reviewer = "reviewer",
  /** Premium subscription user */
  Premium = "premium"
}
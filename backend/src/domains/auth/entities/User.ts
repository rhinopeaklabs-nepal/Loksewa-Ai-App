import type { BaseEntity } from "../../../core/base/BaseEntity";

export interface User extends BaseEntity {
  email: string;
  passwordHash: string;
  fullName: string;
  role: "student" | "reviewer" | "admin";
  status: "active" | "disabled";
}

import { z } from "zod";

export const LoginDTOSchema = z.object({
  email: z.string().email().min(5).max(320),
  password: z.string().min(8).max(128),
  clientType: z.enum(["mobile", "web", "admin"]).optional().default("mobile"),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: "student" | "reviewer" | "admin";
    status: "active" | "disabled";
  };
}
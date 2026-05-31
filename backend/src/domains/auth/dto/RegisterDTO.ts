import { z } from "zod";

export const RegisterDTOSchema = z.object({
  email: z.string().email().min(5).max(320),
  password: z.string().min(8).max(128),
  fullName: z.string().max(200).optional().default(""),
});

export type RegisterDTO = z.infer<typeof RegisterDTOSchema>;

export interface RegisterResponse {
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
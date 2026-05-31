export interface TokenResponseDTO {
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

export interface TokenPayload {
  userId: number;
  email: string;
  role: "student" | "reviewer" | "admin";
  clientType: "mobile" | "web" | "admin";
  iat?: number;
  exp?: number;
}
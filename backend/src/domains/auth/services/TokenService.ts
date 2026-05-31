import crypto from "crypto";
import type { TokenPayload } from "../dto/TokenResponseDTO";

const ALGORITHM = "sha256";

export class TokenService {
  private readonly accessTokenTtlSeconds = 3600; // 1 hour
  private readonly refreshTokenTtlSeconds = 7 * 24 * 3600; // 7 days

  signAccessToken(payload: Omit<TokenPayload, "iat" | "exp">): string {
    const expiresAt = new Date(Date.now() + this.accessTokenTtlSeconds * 1000);
    const fullPayload: TokenPayload = {
      ...payload,
      exp: Math.floor(expiresAt.getTime() / 1000),
    };
    return this.createToken(fullPayload);
  }

  signRefreshToken(userId: number): string {
    const expiresAt = new Date(Date.now() + this.refreshTokenTtlSeconds * 1000);
    const payload: TokenPayload = {
      userId,
      email: "",
      role: "student",
      clientType: "mobile",
      exp: Math.floor(expiresAt.getTime() / 1000),
    };
    return this.createToken(payload);
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      const payload = JSON.parse(decoded) as TokenPayload;

      // Reject expired tokens at verification level
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  verifyRefreshToken(token: string): { userId: number } | null {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded) return null;

      const payload = JSON.parse(decoded) as TokenPayload;

      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return { userId: payload.userId };
    } catch {
      return null;
    }
  }

  hashToken(token: string): string {
    return crypto.createHash(ALGORITHM).update(token).digest("hex");
  }

  generateExpiryTime(ttlSeconds: number): Date {
    return new Date(Date.now() + ttlSeconds * 1000);
  }

  getAccessTokenTtl(): number {
    return this.accessTokenTtlSeconds;
  }

  getRefreshTokenTtl(): number {
    return this.refreshTokenTtlSeconds;
  }

  private createToken(payload: TokenPayload): string {
    // Simple base64 encoding for demo - in production use JWT
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    return encoded;
  }

  private decodeToken(token: string): string | null {
    try {
      return Buffer.from(token, "base64").toString("utf-8");
    } catch {
      return null;
    }
  }
}

export const tokenService = new TokenService();
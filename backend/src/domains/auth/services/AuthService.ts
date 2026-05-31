import { z } from "zod";
import { AppError } from "../../../core/errors/AppError";
import { HttpStatus } from "../../../core/constants/HttpStatus";
import { BaseService } from "../../../core/base/BaseService";
import type { UserRepository } from "../repositories/UserRepository";
import type { LoginDTO } from "../dto/LoginDTO";
import type { RegisterDTO } from "../dto/RegisterDTO";
import type { TokenResponseDTO } from "../dto/TokenResponseDTO";
import { TokenService } from "./TokenService";
import { LoginDTOSchema, RegisterDTOSchema } from "../dto/LoginDTO";

// Password hashing using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "loksewa_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export class AuthService extends BaseService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {
    super("AuthService");
  }

  async login(payload: unknown): Promise<TokenResponseDTO> {
    const parsed = LoginDTOSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("Invalid login payload", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const { email, password } = parsed.data;
    const normalizedEmail = normalizeEmail(email);

    this.info("Login attempt", { email: normalizedEmail });

    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      this.warn("User not found", { email: normalizedEmail });
      throw new AppError("Invalid email or password", HttpStatus.UNAUTHORIZED, "AUTH_FAILED");
    }

    const passwordValid = await verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      this.warn("Invalid password", { userId: user.id });
      throw new AppError("Invalid email or password", HttpStatus.UNAUTHORIZED, "AUTH_FAILED");
    }

    if (user.status === "disabled") {
      throw new AppError("Account is disabled", HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
    }

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clientType: "mobile",
    });

    const refreshToken = this.tokenService.signRefreshToken(user.id);
    const expiresAt = this.tokenService.generateExpiryTime(
      this.tokenService.getAccessTokenTtl()
    );

    this.info("Login successful", { userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(payload: unknown): Promise<TokenResponseDTO> {
    const parsed = RegisterDTOSchema.safeParse(payload);
    if (!parsed.success) {
      throw new AppError("Invalid registration payload", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const { email, password, fullName } = parsed.data;
    const normalizedEmail = normalizeEmail(email);

    this.info("Registration attempt", { email: normalizedEmail });

    // Check if user already exists
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      this.warn("Email already exists", { email: normalizedEmail });
      throw new AppError("Email already registered", HttpStatus.CONFLICT, "EMAIL_EXISTS");
    }

    // Create new user
    const passwordHash = await hashPassword(password);

    const user = await this.userRepository.create({
      email: normalizedEmail,
      passwordHash,
      fullName: fullName || "",
      role: "student",
      status: "active",
    });

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clientType: "mobile",
    });

    const refreshToken = this.tokenService.signRefreshToken(user.id);
    const expiresAt = this.tokenService.generateExpiryTime(
      this.tokenService.getAccessTokenTtl()
    );

    this.info("Registration successful", { userId: user.id });

    return {
      accessToken,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refreshToken(refreshToken: string): Promise<TokenResponseDTO> {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError("Invalid or expired refresh token", HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN");
    }

    const user = await this.userRepository.findById(payload.userId);
    if (!user) {
      throw new AppError("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND");
    }

    if (user.status === "disabled") {
      throw new AppError("Account is disabled", HttpStatus.FORBIDDEN, "ACCOUNT_DISABLED");
    }

    const accessToken = this.tokenService.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      clientType: "mobile",
    });

    const newRefreshToken = this.tokenService.signRefreshToken(user.id);
    const expiresAt = this.tokenService.generateExpiryTime(
      this.tokenService.getAccessTokenTtl()
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async logout(token: string): Promise<void> {
    // In a real implementation, you'd add the token to a blacklist
    // For now, we just validate that the token is valid
    const payload = this.tokenService.verifyAccessToken(token);
    if (!payload) {
      this.warn("Invalid token for logout", {});
    }
    this.info("Logout successful", { userId: payload?.userId });
  }

  async validateToken(token: string): Promise<TokenPayload | null> {
    return this.tokenService.verifyAccessToken(token);
  }

  async hashPassword(password: string): Promise<string> {
    return hashPassword(password);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return verifyPassword(password, hash);
  }
}
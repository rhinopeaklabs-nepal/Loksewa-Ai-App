// JWT and password utilities
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { getConfig } from "./config.js";

const BCRYPT_COST = 12;

export interface AccessTokenPayload {
  sub: string;             // user_id
  role: string;            // user role
  email?: string;
  type: "access";
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;            // unique token id
  type: "refresh";
  iat?: number;
  exp?: number;
}

export function signAccessToken(payload: Omit<AccessTokenPayload, "type" | "iat" | "exp">): string {
  const config = getConfig();
  return jwt.sign({ ...payload, type: "access" }, config.JWT_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const config = getConfig();
  const jti = crypto.randomUUID();
  const token = jwt.sign({ sub: userId, jti, type: "refresh" }, config.JWT_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as string,
  } as jwt.SignOptions);
  return { token, jti };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const config = getConfig();
  return jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const config = getConfig();
  return jwt.verify(token, config.JWT_SECRET) as RefreshTokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateOTP(length: number = 6): string {
  const max = Math.pow(10, length);
  return Math.floor(Math.random() * max).toString().padStart(length, "0");
}

export function generateSecureToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// Fastify auth preHandler
export async function authenticate(request: {
  headers: Record<string, string | string[] | undefined>;
}): Promise<AccessTokenPayload> {
  const auth = request.headers.authorization;
  if (!auth || typeof auth !== "string" || !auth.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }
  const token = auth.slice(7);
  return verifyAccessToken(token);
}

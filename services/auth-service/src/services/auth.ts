// Auth service — Business logic
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateOTP,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
  ConflictError,
  RateLimitError,
  getRedis,
  logger,
} from "@loksewa/shared-utils";
import { config } from "../config.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByPhone,
  findUserByOAuth,
  linkOAuthAccount,
  saveRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  recordLoginAttempt,
  getRecentFailedAttempts,
  saveOTP,
  findActiveOTP,
  consumeOTP,
  incrementOTPAttempts,
  audit,
  updateUser,
  type AuthUser,
} from "../models/user.js";
import type { AuthTokens, User, Language, ExamTarget } from "@loksewa/shared-types";

const REFRESH_TOKEN_TTL_DAYS = 30;
const MAX_FAILED_ATTEMPTS = 5;
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;

function publicUser(user: AuthUser): User {
  const {
    password_hash: _passwordHash,
    is_active: _isActive,
    last_login_at: _lastLoginAt,
    deleted_at: _deletedAt,
    ...safeUser
  } = user;
  return safeUser;
}

export interface RegisterPayload {
  email?: string;
  phone?: string;
  password?: string;
  full_name?: string;
  preferred_language?: Language;
  target_exam?: ExamTarget;
  signup_source?: string;
}

export async function register(payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
  if (!payload.email && !payload.phone) {
    throw new ValidationError("Email or phone is required");
  }
  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    throw new ValidationError("Invalid email format");
  }
  if (payload.phone && !/^\+?[0-9]{7,15}$/.test(payload.phone)) {
    throw new ValidationError("Invalid phone format");
  }
  if (payload.email) {
    const existing = await findUserByEmail(payload.email);
    if (existing) throw new ConflictError("Email already registered");
  }
  if (payload.phone) {
    const existing = await findUserByPhone(payload.phone);
    if (existing) throw new ConflictError("Phone already registered");
  }

  const password_hash = payload.password ? await hashPassword(payload.password) : undefined;

  const user = await createUser({
    email: payload.email,
    phone: payload.phone,
    password_hash,
    full_name: payload.full_name,
    preferred_language: payload.preferred_language ?? "ne",
    target_exam: payload.target_exam,
    email_verified: !!payload.email, // dev: auto-verify; in prod, send email
    phone_verified: !!payload.phone && !!payload.password ? true : false, // OTP flow for passwordless
  });

  await audit(user.id, "user.registered", { resource_id: user.id });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), tokens };
}

export interface LoginPayload {
  identifier: string; // email or phone
  password: string;
}

export async function login(
  payload: LoginPayload,
  meta: { ip_address?: string; user_agent?: string } = {}
): Promise<{ user: User; tokens: AuthTokens }> {
  const failedCount = await getRecentFailedAttempts(payload.identifier, 15);
  if (failedCount >= MAX_FAILED_ATTEMPTS) {
    throw new RateLimitError("Too many failed login attempts. Try again later.");
  }

  const user =
    (payload.identifier.includes("@")
      ? await findUserByEmail(payload.identifier)
      : await findUserByPhone(payload.identifier));

  if (!user || !user.password_hash) {
    await recordLoginAttempt(payload.identifier, false, { ...meta, reason: "user_not_found" });
    throw new UnauthorizedError("Invalid credentials");
  }

  if (!user.is_active) {
    await recordLoginAttempt(payload.identifier, false, { ...meta, reason: "inactive" });
    throw new UnauthorizedError("Account is inactive");
  }

  const passwordOk = await verifyPassword(payload.password, user.password_hash);
  if (!passwordOk) {
    await recordLoginAttempt(payload.identifier, false, { ...meta, reason: "wrong_password" });
    throw new UnauthorizedError("Invalid credentials");
  }

  await recordLoginAttempt(payload.identifier, true, meta);
  await updateUser(user.id, { last_login_at: new Date() });
  await audit(user.id, "user.login", { resource_id: user.id, ...meta });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), tokens };
}

// Passwordless OTP login
export async function requestLoginOTP(phone: string): Promise<{ expires_in: number }> {
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    throw new ValidationError("Invalid phone format");
  }

  // Rate limit OTP requests
  const key = `otp:req:${phone}`;
  const count = await getRedis().incr(key);
  if (count === 1) await getRedis().expire(key, 300); // 5 min window
  if (count > 3) {
    throw new RateLimitError("Too many OTP requests. Try again in 5 minutes.");
  }

  const otp = generateOTP(6);
  const codeHash = await hashPassword(otp); // reuse bcrypt for hashing
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await saveOTP(phone, codeHash, "login", expiresAt);

  // In dev, log the OTP. In prod, send via SMS provider.
  if (config.NODE_ENV !== "production") {
    logger.info({ phone, otp }, "🔐 DEV OTP");
  }

  return { expires_in: OTP_TTL_MINUTES * 60 };
}

export async function verifyLoginOTP(
  phone: string,
  otp: string
): Promise<{ user: User; tokens: AuthTokens; is_new_user: boolean }> {
  const record = await findActiveOTP(phone, "login");
  if (!record) {
    throw new UnauthorizedError("OTP expired or not found");
  }

  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new RateLimitError("Too many OTP attempts");
  }

  const otpOk = await verifyPassword(otp, record.code_hash);
  if (!otpOk) {
    await incrementOTPAttempts(record.id);
    throw new UnauthorizedError("Invalid OTP");
  }

  await consumeOTP(record.id);

  let user = await findUserByPhone(phone);
  let isNewUser = false;

  if (!user) {
    user = await createUser({
      phone,
      phone_verified: true,
      preferred_language: "ne",
    });
    isNewUser = true;
    await audit(user.id, "user.registered.otp", { resource_id: user.id });
  } else {
    await updateUser(user.id, { phone_verified: true, last_login_at: new Date() });
    await audit(user.id, "user.login.otp", { resource_id: user.id });
  }

  const tokens = await issueTokens(user);
  return { user: publicUser(user), tokens, is_new_user: isNewUser };
}

// Token management
async function issueTokens(user: User): Promise<AuthTokens> {
  const access_token = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  const { token: refresh_token, jti } = signRefreshToken(user.id);
  const tokenHash = hashToken(refresh_token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await saveRefreshToken(user.id, tokenHash, expiresAt);

  return {
    access_token,
    refresh_token,
    expires_in: 15 * 60, // 15 min for access
    token_type: "Bearer",
  };
}

export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await findRefreshToken(tokenHash);
  if (!stored) {
    throw new UnauthorizedError("Refresh token not found or revoked");
  }

  const user = await findUserById(payload.sub);
  if (!user || !user.is_active) {
    throw new UnauthorizedError("User not active");
  }

  // Rotate: revoke old, issue new
  await revokeRefreshToken(tokenHash);
  return issueTokens(user);
}

export async function logout(refreshToken: string): Promise<void> {
  const tokenHash = hashToken(refreshToken);
  await revokeRefreshToken(tokenHash);
}

export async function logoutAll(userId: string): Promise<void> {
  await revokeAllUserTokens(userId);
  await audit(userId, "user.logout_all", { resource_id: userId });
}

// OAuth
export interface OAuthProfile {
  provider: "google" | "apple" | "facebook" | "github";
  provider_user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  raw_profile?: Record<string, unknown>;
}

export async function oauthLogin(profile: OAuthProfile): Promise<{ user: User; tokens: AuthTokens; is_new_user: boolean }> {
  let user = await findUserByOAuth(profile.provider, profile.provider_user_id);
  let isNewUser = false;

  if (!user) {
    if (profile.email) {
      const existing = await findUserByEmail(profile.email);
      if (existing) {
        // Link OAuth to existing account
        await linkOAuthAccount(existing.id, profile.provider, profile.provider_user_id, profile.raw_profile);
        user = existing;
      }
    }
  }

  if (!user) {
    user = await createUser({
      email: profile.email,
      full_name: profile.full_name,
      email_verified: !!profile.email,
    });
    isNewUser = true;
  }

  await linkOAuthAccount(user.id, profile.provider, profile.provider_user_id, profile.raw_profile);
  await updateUser(user.id, { last_login_at: new Date() });
  await audit(user.id, `user.login.oauth.${profile.provider}`, { resource_id: user.id });

  const tokens = await issueTokens(user);
  return { user: publicUser(user), tokens, is_new_user: isNewUser };
}

// Profile management
export async function getProfile(userId: string) {
  const user = await findUserById(userId);
  if (!user) throw new NotFoundError("User");
  return publicUser(user);
}

export async function updateProfile(
  userId: string,
  patch: { full_name?: string; preferred_language?: Language; target_exam?: ExamTarget }
) {
  const user = await updateUser(userId, patch);
  await audit(userId, "user.profile_updated", { resource_id: userId, metadata: patch });
  return publicUser(user);
}

export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<void> {
  const user = await findUserById(userId);
  if (!user || !user.password_hash) {
    throw new NotFoundError("User");
  }
  const ok = await verifyPassword(oldPassword, user.password_hash);
  if (!ok) throw new UnauthorizedError("Current password is incorrect");
  if (newPassword.length < 8) throw new ValidationError("Password must be at least 8 characters");

  const password_hash = await hashPassword(newPassword);
  await updateUser(userId, { password_hash });
  await revokeAllUserTokens(userId); // force re-login
  await audit(userId, "user.password_changed", { resource_id: userId });
}

export async function deleteAccount(userId: string): Promise<void> {
  const { softDeleteUser } = await import("../models/user.js");
  await softDeleteUser(userId);
  await audit(userId, "user.deleted", { resource_id: userId });
}

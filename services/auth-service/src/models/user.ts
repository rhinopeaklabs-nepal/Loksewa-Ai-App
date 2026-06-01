// Auth service — User model + queries
import { query, withTransaction } from "@loksewa/shared-utils";
import type { User, UserRole, Language, ExamTarget } from "@loksewa/shared-types";

export interface CreateUserInput {
  email?: string;
  phone?: string;
  password_hash?: string;
  full_name?: string;
  preferred_language?: Language;
  target_exam?: ExamTarget;
  role?: UserRole;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email.toLowerCase()]
  );
  return result.rows[0] ?? null;
}

export async function findUserByPhone(phone: string): Promise<User | null> {
  const result = await query<User>(
    `SELECT * FROM users WHERE phone = $1 AND deleted_at IS NULL`,
    [phone]
  );
  return result.rows[0] ?? null;
}

export async function findUserByOAuth(
  provider: string,
  providerUserId: string
): Promise<User | null> {
  const result = await query<User>(
    `SELECT u.* FROM users u
     JOIN oauth_accounts oa ON oa.user_id = u.id
     WHERE oa.provider = $1 AND oa.provider_user_id = $2 AND u.deleted_at IS NULL`,
    [provider, providerUserId]
  );
  return result.rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await query<User>(
    `INSERT INTO users (
       email, phone, password_hash, full_name,
       preferred_language, target_exam, role,
       email_verified, phone_verified
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      input.email?.toLowerCase() ?? null,
      input.phone ?? null,
      input.password_hash ?? null,
      input.full_name ?? null,
      input.preferred_language ?? "ne",
      input.target_exam ?? null,
      input.role ?? "student",
      input.email_verified ?? false,
      input.phone_verified ?? false,
    ]
  );
  return result.rows[0]!;
}

export async function updateUser(
  id: string,
  patch: Partial<CreateUserInput> & { last_login_at?: Date }
): Promise<User> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      fields.push(`${key} = $${i}`);
      values.push(value);
      i++;
    }
  }

  if (fields.length === 0) {
    return (await findUserById(id))!;
  }

  values.push(id);
  const result = await query<User>(
    `UPDATE users SET ${fields.join(", ")} WHERE id = $${i} AND deleted_at IS NULL RETURNING *`,
    values
  );
  return result.rows[0]!;
}

export async function linkOAuthAccount(
  userId: string,
  provider: string,
  providerUserId: string,
  profile: Record<string, unknown> = {}
): Promise<void> {
  await query(
    `INSERT INTO oauth_accounts (user_id, provider, provider_user_id, profile)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (provider, provider_user_id) DO UPDATE
       SET profile = EXCLUDED.profile, updated_at = NOW()`,
    [userId, provider, providerUserId, JSON.stringify(profile)]
  );
}

// Refresh tokens
export async function saveRefreshToken(
  userId: string,
  tokenHash: string,
  expiresAt: Date,
  meta: { user_agent?: string; ip_address?: string } = {}
): Promise<void> {
  await query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt, meta.user_agent ?? null, meta.ip_address ?? null]
  );
}

export async function findRefreshToken(tokenHash: string) {
  const result = await query(
    `SELECT rt.*, u.role, u.email
     FROM refresh_tokens rt
     JOIN users u ON u.id = rt.user_id
     WHERE rt.token_hash = $1 AND rt.revoked_at IS NULL AND rt.expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash: string): Promise<void> {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = $1`,
    [tokenHash]
  );
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await query(
    `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

// Login attempt tracking
export async function recordLoginAttempt(
  identifier: string,
  success: boolean,
  meta: { ip_address?: string; user_agent?: string; reason?: string } = {}
): Promise<void> {
  await query(
    `INSERT INTO login_attempts (identifier, ip_address, user_agent, success, reason)
     VALUES ($1, $2, $3, $4, $5)`,
    [identifier, meta.ip_address ?? null, meta.user_agent ?? null, success, meta.reason ?? null]
  );
}

export async function getRecentFailedAttempts(identifier: string, minutes: number = 15): Promise<number> {
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM login_attempts
     WHERE identifier = $1 AND success = false AND created_at > NOW() - ($2 || ' minutes')::interval`,
    [identifier, String(minutes)]
  );
  return parseInt(result.rows[0]?.count ?? "0", 10);
}

// OTP
export async function saveOTP(
  phone: string,
  codeHash: string,
  purpose: string,
  expiresAt: Date
): Promise<void> {
  await query(
    `INSERT INTO otp_codes (phone, code_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [phone, codeHash, purpose, expiresAt]
  );
}

export async function findActiveOTP(phone: string, purpose: string) {
  const result = await query(
    `SELECT * FROM otp_codes
     WHERE phone = $1 AND purpose = $2 AND consumed_at IS NULL AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [phone, purpose]
  );
  return result.rows[0] ?? null;
}

export async function consumeOTP(otpId: string): Promise<void> {
  await query(
    `UPDATE otp_codes SET consumed_at = NOW() WHERE id = $1`,
    [otpId]
  );
}

export async function incrementOTPAttempts(otpId: string): Promise<void> {
  await query(
    `UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`,
    [otpId]
  );
}

// Audit
export async function audit(
  userId: string | null,
  action: string,
  meta: {
    resource_type?: string;
    resource_id?: string;
    metadata?: Record<string, unknown>;
    ip_address?: string;
    user_agent?: string;
  } = {}
): Promise<void> {
  await query(
    `INSERT INTO audit_log (user_id, action, resource_type, resource_id, metadata, ip_address, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      userId,
      action,
      meta.resource_type ?? null,
      meta.resource_id ?? null,
      meta.metadata ? JSON.stringify(meta.metadata) : null,
      meta.ip_address ?? null,
      meta.user_agent ?? null,
    ]
  );
}

// Soft delete
export async function softDeleteUser(userId: string): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(`UPDATE users SET deleted_at = NOW() WHERE id = $1`, [userId]);
    await client.query(
      `UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
      [userId]
    );
  });
}

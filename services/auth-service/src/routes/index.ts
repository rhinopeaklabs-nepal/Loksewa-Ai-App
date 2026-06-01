// Auth service route registration
import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { authenticate, AppError } from "@loksewa/shared-utils";
import * as authService from "../services/auth.js";
import type { AuthTokens } from "@loksewa/shared-types";

const RegisterSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/).optional(),
  password: z.string().min(8).optional(),
  full_name: z.string().min(1).max(200).optional(),
  preferred_language: z.enum(["ne", "en", "mai", "new", "tdg"]).optional(),
  target_exam: z.string().optional(),
  signup_source: z.string().optional(),
});

const LoginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
});

const RequestOTPSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{7,15}$/),
});

const VerifyOTPSchema = z.object({
  phone: z.string().regex(/^\+?[0-9]{7,15}$/),
  otp: z.string().length(6),
});

const OAuthSchema = z.object({
  provider: z.enum(["google", "apple", "facebook", "github"]),
  id_token: z.string().optional(),
  access_token: z.string().optional(),
  profile: z.object({
    id: z.string(),
    email: z.string().email().optional(),
    name: z.string().optional(),
    picture: z.string().optional(),
  }).passthrough(),
});

const RefreshSchema = z.object({
  refresh_token: z.string(),
});

const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(200).optional(),
  preferred_language: z.enum(["ne", "en", "mai", "new", "tdg"]).optional(),
  target_exam: z.string().optional(),
});

const ChangePasswordSchema = z.object({
  old_password: z.string(),
  new_password: z.string().min(8),
});

function getMeta(req: FastifyRequest) {
  return {
    ip_address: req.ip,
    user_agent: req.headers["user-agent"] as string | undefined,
  };
}

function handleError(reply: FastifyReply, err: unknown) {
  if (err instanceof AppError) {
    return reply.status(err.statusCode).send({
      success: false,
      error: err.toJSON(),
    });
  }
  if (err instanceof z.ZodError) {
    return reply.status(400).send({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: err.flatten().fieldErrors,
        status_code: 400,
      },
    });
  }
  reply.log.error({ err }, "Unhandled error");
  return reply.status(500).send({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal server error",
      status_code: 500,
    },
  });
}

export async function registerRoutes(app: FastifyInstance) {
  // ============ Public Auth ============
  app.post("/v1/auth/register", async (req, reply) => {
    try {
      const body = RegisterSchema.parse(req.body);
      const { user, tokens } = await authService.register(body);
      return reply.send({ success: true, data: { user, tokens } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/auth/login", async (req, reply) => {
    try {
      const body = LoginSchema.parse(req.body);
      const { user, tokens } = await authService.login(body, getMeta(req));
      return reply.send({ success: true, data: { user, tokens } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/auth/refresh", async (req, reply) => {
    try {
      const body = RefreshSchema.parse(req.body);
      const tokens: AuthTokens = await authService.refreshAccessToken(body.refresh_token);
      return reply.send({ success: true, data: { tokens } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/auth/logout", async (req, reply) => {
    try {
      const body = RefreshSchema.parse(req.body);
      await authService.logout(body.refresh_token);
      return reply.send({ success: true, data: { message: "Logged out" } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  // OTP
  app.post("/v1/auth/otp/request", async (req, reply) => {
    try {
      const body = RequestOTPSchema.parse(req.body);
      const result = await authService.requestLoginOTP(body.phone);
      return reply.send({ success: true, data: result });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/auth/otp/verify", async (req, reply) => {
    try {
      const body = VerifyOTPSchema.parse(req.body);
      const result = await authService.verifyLoginOTP(body.phone, body.otp);
      return reply.send({ success: true, data: result });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  // OAuth
  app.post("/v1/auth/oauth", async (req, reply) => {
    try {
      const body = OAuthSchema.parse(req.body);
      // TODO: Verify id_token with provider before this
      const result = await authService.oauthLogin({
        provider: body.provider,
        provider_user_id: body.profile.id,
        email: body.profile.email,
        full_name: body.profile.name,
        avatar_url: body.profile.picture,
        access_token: body.access_token,
        raw_profile: body.profile,
      });
      return reply.send({ success: true, data: result });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  // ============ Authenticated Routes ============
  app.addHook("onRequest", async (req, reply) => {
    // Skip auth for public routes
    const publicPaths = [
      "/v1/auth/register",
      "/v1/auth/login",
      "/v1/auth/refresh",
      "/v1/auth/logout",
      "/v1/auth/otp/request",
      "/v1/auth/otp/verify",
      "/v1/auth/oauth",
      "/healthz",
      "/readyz",
    ];
    if (publicPaths.includes(req.url)) return;
  });

  app.get("/v1/users/me", async (req, reply) => {
    try {
      const payload = await authenticate(req);
      const user = await authService.getProfile(payload.sub);
      return reply.send({ success: true, data: { user } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.patch("/v1/users/me", async (req, reply) => {
    try {
      const payload = await authenticate(req);
      const body = UpdateProfileSchema.parse(req.body);
      const user = await authService.updateProfile(payload.sub, body);
      return reply.send({ success: true, data: { user } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/users/me/password", async (req, reply) => {
    try {
      const payload = await authenticate(req);
      const body = ChangePasswordSchema.parse(req.body);
      await authService.changePassword(payload.sub, body.old_password, body.new_password);
      return reply.send({ success: true, data: { message: "Password changed" } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.post("/v1/users/me/logout-all", async (req, reply) => {
    try {
      const payload = await authenticate(req);
      await authService.logoutAll(payload.sub);
      return reply.send({ success: true, data: { message: "All sessions logged out" } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  app.delete("/v1/users/me", async (req, reply) => {
    try {
      const payload = await authenticate(req);
      await authService.deleteAccount(payload.sub);
      return reply.send({ success: true, data: { message: "Account deleted" } });
    } catch (err) {
      return handleError(reply, err);
    }
  });

  // Service-to-service auth verification endpoint
  app.post("/v1/auth/verify", async (req, reply) => {
    try {
      const body = z.object({ token: z.string() }).parse(req.body);
      const payload = await authenticate({ headers: { authorization: `Bearer ${body.token}` } });
      return reply.send({ success: true, data: { valid: true, payload } });
    } catch {
      return reply.send({ success: true, data: { valid: false } });
    }
  });
}

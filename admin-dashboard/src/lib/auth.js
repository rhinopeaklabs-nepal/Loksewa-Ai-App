// Small client-side helpers
import { getToken, setToken } from "./api.js";

export async function loginRequest(email, password) {
  const response = await fetch("/v1/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, client_type: "admin" })
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.detail;
    const message = Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : detail || "Login failed";
    throw new Error(message);
  }
  setToken(payload.token);
  return payload;
}

export async function fetchProfile(api) {
  return api("/v1/auth/me");
}

export function logout() {
  setToken("");
}

export const TOKEN_KEY = "loksewa_admin_token";
export { getToken };

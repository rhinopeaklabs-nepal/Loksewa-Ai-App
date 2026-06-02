// API client for the Loksewa admin dashboard
const API_BASE = import.meta.env.VITE_API_BASE || "";
const TOKEN_KEY = "loksewa_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export function parseError(payload, fallback) {
  if (!payload?.detail) return fallback;
  if (Array.isArray(payload.detail)) return payload.detail.map((item) => item.msg).join(", ");
  return payload.detail;
}

export function createApi({ token, onUnauthorized } = {}) {
  return async function api(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };
    const activeToken = token || getToken();
    if (activeToken) headers.Authorization = `Bearer ${activeToken}`;

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (response.status === 204) return null;
    const text = await response.text();
    let payload = null;
    if (text) {
      try { payload = JSON.parse(text); } catch { payload = text; }
    }
    if (!response.ok) {
      if (response.status === 401) onUnauthorized?.();
      const message = parseError(payload, response.statusText);
      throw new Error(message);
    }
    return payload;
  };
}

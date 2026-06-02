// Generic helpers
export function formatDate(value) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return value;
  }
}

export function formatDateTime(value) {
  if (!value) return "—";
  try {
    const date = new Date(value);
    return date.toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return value;
  }
}

export function truncate(text, n = 80) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n) + "…" : text;
}

export function pluralize(n, singular, plural) {
  return n === 1 ? singular : (plural || singular + "s");
}

export function debounce(fn, wait = 300) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

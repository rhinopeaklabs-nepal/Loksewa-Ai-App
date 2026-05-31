export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function normalizeSearchText(value: string): string {
  return normalizeNepaliText(value).toLowerCase();
}

export function normalizeNepaliText(value: string): string {
  return value
    .normalize("NFC")
    .replace(/[।|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatIsoDate(date: Date): string {
  return date.toISOString();
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((part / total) * 10000) / 100;
}

export function stableCacheKey(...parts: Array<string | number | null | undefined>): string {
  return parts
    .filter((part): part is string | number => part !== null && part !== undefined)
    .map(String)
    .map((part) => part.replace(/\s+/g, "-").toLowerCase())
    .join(":");
}

const COOKIE_NAME = "flightPrefs";
const MAX_AGE_DAYS = 90;

export function readPrefs<T>(): T | null {
  const all = document.cookie.split("; ");
  const found = all.find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!found) return null;
  try {
    const raw = decodeURIComponent(found.slice(COOKIE_NAME.length + 1));
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writePrefs<T>(value: T): void {
  const raw = encodeURIComponent(JSON.stringify(value));
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${raw}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

const TTL_MS = 10 * 60 * 1000;

interface Entry<T> {
  expires: number;
  value: T;
}

const store = new Map<string, Entry<unknown>>();

export function getCached<T>(key: string): T | null {
  const entry = store.get(key) as Entry<T> | undefined;
  if (!entry) return null;
  if (entry.expires < Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function setCached<T>(key: string, value: T): void {
  store.set(key, { value, expires: Date.now() + TTL_MS });
}

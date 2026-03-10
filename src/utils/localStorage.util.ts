type StorageValue = string;

const createStorageUtil = (storage: Storage) => ({
  set(key: string, value: StorageValue) {
    storage.setItem(key, value);
  },

  get(key: string): string | null {
    return storage.getItem(key);
  },

  remove(key: string) {
    storage.removeItem(key);
  },

  has(key: string): boolean {
    return storage.getItem(key) !== null;
  },

  clear() {
    storage.clear();
  },

  getAll(): Record<string, string> {
    const result: Record<string, string> = {};

    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);

      if (key !== null) {
        const value = storage.getItem(key);
        result[key] = value ?? '';
      }
    }

    return result;
  },

  setJson(key: string, value: unknown) {
    storage.setItem(key, JSON.stringify(value));
  },

  getJson<T = unknown>(key: string): T | null {
    const value = storage.getItem(key);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setNumber(key: string, value: number) {
    storage.setItem(key, String(value));
  },

  getNumber(key: string): number | null {
    const value = storage.getItem(key);

    if (value === null) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },

  setBoolean(key: string, value: boolean) {
    storage.setItem(key, String(value));
  },

  getBoolean(key: string): boolean | null {
    const value = storage.getItem(key);

    if (value === null) {
      return null;
    }

    if (value === 'true') {
      return true;
    }

    if (value === 'false') {
      return false;
    }

    return null;
  },
});

export const localStorageUtil = createStorageUtil(window.localStorage);

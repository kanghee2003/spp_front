export type CookieOptions = {
  expires?: number | Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
};

const parseCookieString = (cookieString: string): Record<string, string> => {
  const result: Record<string, string> = {};

  if (!cookieString) {
    return result;
  }

  cookieString.split('; ').forEach((item) => {
    const [rawKey, ...rawValue] = item.split('=');
    const key = decodeURIComponent(rawKey ?? '');
    const value = decodeURIComponent(rawValue.join('=') ?? '');
    result[key] = value;
  });

  return result;
};

export const cookieUtil = {
  set(name: string, value: string, options: CookieOptions = {}) {
    const { expires, path = '/', domain, secure, sameSite } = options;

    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires !== undefined) {
      let expiresDate: Date;

      if (typeof expires === 'number') {
        expiresDate = new Date();
        expiresDate.setTime(expiresDate.getTime() + expires * 24 * 60 * 60 * 1000);
      } else {
        expiresDate = expires;
      }

      cookie += `; expires=${expiresDate.toUTCString()}`;
    }

    if (path) {
      cookie += `; path=${path}`;
    }

    if (domain) {
      cookie += `; domain=${domain}`;
    }

    if (secure) {
      cookie += '; secure';
    }

    if (sameSite) {
      cookie += `; samesite=${sameSite}`;
    }

    document.cookie = cookie;
  },

  get(name: string): string | null {
    const cookies = parseCookieString(document.cookie);
    return cookies[name] ?? null;
  },

  remove(name: string, path = '/', domain?: string) {
    this.set(name, '', {
      expires: new Date(0),
      path,
      domain,
    });
  },

  has(name: string): boolean {
    return this.get(name) !== null;
  },

  clear() {
    const cookies = this.getAll();

    Object.keys(cookies).forEach((key) => {
      this.remove(key);
    });
  },

  getAll(): Record<string, string> {
    return parseCookieString(document.cookie);
  },

  setJson(name: string, value: unknown, options?: CookieOptions) {
    this.set(name, JSON.stringify(value), options);
  },

  getJson<T = unknown>(name: string): T | null {
    const value = this.get(name);

    if (value === null) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setNumber(name: string, value: number, options?: CookieOptions) {
    this.set(name, String(value), options);
  },

  getNumber(name: string): number | null {
    const value = this.get(name);

    if (value === null) {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  },

  setBoolean(name: string, value: boolean, options?: CookieOptions) {
    this.set(name, String(value), options);
  },

  getBoolean(name: string): boolean | null {
    const value = this.get(name);

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
};

const isBrowser = typeof window !== 'undefined' && !!window.localStorage;

/**
 * PUBLIC_INTERFACE
 * storage is a light wrapper providing JSON get/set/remove for localStorage with try/catch.
 */
export const storage = {
  get(key) {
    if (!isBrowser) return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return null;
      try {
        return JSON.parse(raw);
      } catch {
        return raw;
      }
    } catch {
      return null;
    }
  },
  set(key, value) {
    if (!isBrowser) return;
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
    } catch {
      // ignore
    }
  },
  remove(key) {
    if (!isBrowser) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
  clear() {
    if (!isBrowser) return;
    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }
  }
};

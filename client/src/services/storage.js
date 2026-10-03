// Thin async wrapper around localStorage. Every page reads/writes through
// AppContext, which is the single source of truth — this file is only the
// persistence layer underneath it, so data survives a page refresh.

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : { key, value: raw };
    } catch {
      return null;
    }
  },
  async set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  async delete(key) {
    try {
      window.localStorage.removeItem(key);
      return { key, deleted: true };
    } catch {
      return null;
    }
  },
};

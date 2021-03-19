/**
 * Make a storage object with CRUD functions
 */
const buildLocalStorage = (key: string) => ({
  get: () => localStorage.getItem(key),
  set: (value: string) => localStorage.setItem(key, value),
  remove: () => localStorage.removeItem(key),
});

/**
 * Store the session token
 */
export const SessionStorage = buildLocalStorage('auth.sessionToken');

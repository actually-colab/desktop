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
export const SessionTokenStorage = buildLocalStorage('auth.sessionToken');

/**
 * Store the most recently opened notebook
 */
export const LatestNotebookIdStorage = buildLocalStorage('editor.notebook.latest.nb_id');

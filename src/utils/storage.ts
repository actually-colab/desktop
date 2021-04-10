/**
 * Make a storage object with CRUD functions
 */
const buildLocalStorage = (key: string) => ({
  get: () => localStorage.getItem(key),
  set: (value: string) => localStorage.setItem(key, value),
  remove: () => localStorage.removeItem(key),
});

const buildWrappedLocalStorage = <T>(
  key: string,
  postProcessGet: (value: string | null) => T,
  preProcessSet: (value: T) => string
) => ({
  get: () => postProcessGet(localStorage.getItem(key)),
  set: (value: T) => localStorage.setItem(key, preProcessSet(value)),
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

/**
 * Store the recent contacts
 */
export const RecentUsersStorage = buildWrappedLocalStorage<string[]>(
  'editor.contacts.recent',
  (value: string | null) => (value !== null ? JSON.parse(value)?.emails ?? [] : null),
  (value) => JSON.stringify({ emails: value })
);

import { shell } from 'electron';

/**
 * The stem for the app's protocol. This allows redirects to open the app and send data
 */
export const PROTOCOL_STEM = 'actuallycolab://';
/**
 * The base URI for the login page
 */
export const BASE_REDIRECT_URI =
  process.env.NODE_ENV === 'development' ? 'http://localhost:4000' : 'https://actuallycolab.org';
/**
 * The URI for the login page
 */
export const AUTH_REDIRECT_URI = `${BASE_REDIRECT_URI}/login`;

/**
 * The data contained in the auth redirect
 */
export type LoginRedirectResponse = {
  token: string;
};

/**
 * Open the authentication page in the user's default browser
 */
export const openLoginPage = () => {
  shell.openExternal(AUTH_REDIRECT_URI);
};

/**
 * Given a redirect from the login page, extract the payload into an object
 */
export const extractLoginData = (url: string): LoginRedirectResponse | null => {
  try {
    const attributes = url.substring(url.indexOf(PROTOCOL_STEM) + PROTOCOL_STEM.length).split('&');

    const payload: Partial<LoginRedirectResponse> = {};

    for (const attribute of attributes) {
      const [key, value] = attribute.split('=');

      if (key === 'token') {
        payload[key] = decodeURIComponent(value);
      }
    }

    if (payload.token) {
      return {
        token: payload.token,
      };
    }
  } catch (error) {
    console.error(error);
  }

  return null;
};

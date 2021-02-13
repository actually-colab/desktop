export const PROTOCOL_STEM = 'actuallycolab://';

export type LoginRedirectResponse = {
  token: string;
  email: string;
  name: string;
};

/**
 * Given a redirect from the login page, extract the payload into an object
 */
export const extractLoginData = (url: string): Partial<LoginRedirectResponse> | null => {
  try {
    const attributes = url.substring(url.indexOf(PROTOCOL_STEM) + PROTOCOL_STEM.length).split('&');

    const payload: Partial<LoginRedirectResponse> = {};

    for (const attribute of attributes) {
      const [key, value] = attribute.split('=');

      if (key === 'token' || key === 'email' || key === 'name') {
        payload[key] = decodeURIComponent(value);
      }
    }

    return payload;
  } catch (error) {
    console.error(error);

    return null;
  }
};

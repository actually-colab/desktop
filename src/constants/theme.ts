/**
 * The theme color palette
 */
export const palette = {
  PRIMARY: '#F55673',
  PRIMARY_LIGHT: '#F5EBED',
  BASE: '#FFFFFF',
  BASE_FADED: '#F7F7FA',
  BASE_BORDER: '#DBE6F1',
  CHARCOAL: '#383F51',
  LIGHT_GRAY: '#E6E8E6',
  GRAY: '#8C8A93',
  TANGERINE: '#FB9F89',
  TURTLE: '#21A179',
  OLD_LAVENDER: '#896978',
  LIGHT_LAVENDER: '#DDDBF1',
  LIGHT_BROWN: '#D1BEB0',
  DEEP_SEA: '#111342',
  ALMOST_BLACK: '#1E1E24',
  ERROR: '#F52F57',
  WARNING: '#FFBC42',
  SUCCESS: '#62C370',
};

/**
 * The theme spacing values
 */
export const spacing = {
  DEFAULT: 16,
  pad: (overrides: { left?: number; right?: number; top?: number; bottom?: number } = {}, fallback: number = 16) => ({
    paddingLeft: overrides.left ?? fallback,
    paddingRight: overrides.right ?? fallback,
    paddingTop: overrides.top ?? fallback,
    paddingBottom: overrides.bottom ?? fallback,
  }),
};

export const palette = {
  PRIMARY: '#f55673',
  PRIMARY_LIGHT: '#F5EBED',
  BASE: '#FFFFFF',
  BASE_FADED: '#F7F7FA',
  BASE_BORDER: '#DBE6F1',
  CHARCOAL: '#383F51',
  GRAY: '#8C8A93',
  OLD_LAVENDER: '#896978',
  LIGHT_LAVENDER: '#DDDBF1',
  LIGHT_BROWN: '#D1BEB0',
  DEEP_SEA: '#111342',
  ERROR: '#F52F57',
  WARNING: '#FFBC42',
  SUCCESS: '#62C370',
};

export const spacing = {
  DEFAULT: 16,
  pad: (fallback: number, padding: { left?: number; right?: number; top?: number; bottom?: number }) => ({
    paddingLeft: padding.left ?? fallback,
    paddingRight: padding.right ?? fallback,
    paddingTop: padding.top ?? fallback,
    paddingBottom: padding.bottom ?? fallback,
  }),
};

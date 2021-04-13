const SPLIT_KEEP_NEWLINE_REGEX = /([^\n]*\n|[^\n]+)/g;

/**
 * Split a given string on newlines but keep them at the end of each item
 */
export const splitKeepNewlines = (text: string): string[] => text.match(SPLIT_KEEP_NEWLINE_REGEX) ?? [];

/**
 * Regex for comma separated emails
 */
export const EMAILS_REGEX = /^(\s?[^\s,]+@[^\s,]+\.[^\s,]+\s?,)*(\s?[^\s,]+@[^\s,]+\.[^\s,]+)$/g; // lgtm [js/redos]

const SPLIT_KEEP_NEWLINE = /([^\n]*\n|[^\n]+)/g;

/**
 * Split a given string on newlines but keep them at the end of each item
 */
export const splitKeepNewlines = (text: string): string[] => text.match(SPLIT_KEEP_NEWLINE) ?? [];

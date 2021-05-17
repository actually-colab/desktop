/**
 * Jupyter messaging protocol's _jupyter_types_experimental completion result.
 */
interface CompletionResult {
  end: number;
  start: number;
  type: string;
  text: string;
  displayText?: string;
}

/**
 * Juptyer completion match item.
 */
export type CompletionMatch = string | CompletionResult;

/**
 * Jupyter messaging protocol's complete_reply response.
 */
export interface CompletionResults {
  status: string;
  cursor_start: number;
  cursor_end: number;
  matches: CompletionMatch[];
  metadata?: {
    _jupyter_types_experimental?: any;
  };
}

/**
 * JavaScript stores text as utf16 and string indices use "code units",
 * which stores high-codepoint characters as "surrogate pairs",
 * which occupy two indices in the JavaScript string.
 * We need to translate cursor_pos in the protocol (in characters)
 * to js offset (with surrogate pairs taking two spots).
 *
 * Based on nteract/monaco-editor
 *
 * @param js_idx JavaScript index
 * @param text Text
 */
export const js_idx_to_char_idx: (js_idx: number, text: string) => number = (js_idx: number, text: string): number => {
  let char_idx: number = js_idx;

  for (let i: number = 0; i + 1 < text.length && i < js_idx; i++) {
    const char_code: number = text.charCodeAt(i);

    // check for surrogate pair
    if (char_code >= 0xd800 && char_code <= 0xdbff) {
      const next_char_code: number = text.charCodeAt(i + 1);

      if (next_char_code >= 0xdc00 && next_char_code <= 0xdfff) {
        char_idx--;
        i++;
      }
    }
  }

  return char_idx;
};

/**
 * Based on @nteract/monaco-editor
 */
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { LOG_LEVEL } from '../../constants/logging';
import { kernel } from '../../redux/middleware/ReduxKernel';
import { CompletionMatch, CompletionResults, js_idx_to_char_idx } from '../../utils/completions';

/**
 * Jupyter to Monaco completion item kinds.
 */
const unknownJupyterKind = '<unknown>';
const jupyterToMonacoCompletionItemKind: {
  [key: string]: monaco.languages.CompletionItemKind;
} = {
  [unknownJupyterKind]: monaco.languages.CompletionItemKind.Field,
  class: monaco.languages.CompletionItemKind.Class,
  function: monaco.languages.CompletionItemKind.Function,
  keyword: monaco.languages.CompletionItemKind.Keyword,
  instance: monaco.languages.CompletionItemKind.Variable,
  statement: monaco.languages.CompletionItemKind.Variable,
};

/**
 * Completion item provider.
 */
class CompletionItemProvider implements monaco.languages.CompletionItemProvider {
  /**
   * Additional characters to trigger completion other than Ctrl+Space.
   */
  get triggerCharacters() {
    return [' ', '<', '/', '.', '='];
  }

  /**
   * Get list of completion items at position of cursor.
   * @param model Monaco editor text model.
   * @param position Position of cursor.
   */
  async provideCompletionItems(model: monaco.editor.ITextModel, position: monaco.Position) {
    // Convert to zero-based index
    let cursorPos = model.getOffsetAt(position);
    const code = model.getValue();
    cursorPos = js_idx_to_char_idx(cursorPos, code);

    // Get completions from Jupyter kernel if its Channels is connected
    let items: monaco.languages.CompletionItem[] = [];

    if (kernel) {
      try {
        const completions = await kernel.requestComplete({
          code,
          cursor_pos: cursorPos,
        });

        if (completions.content.status === 'ok') {
          items = this.adaptToMonacoCompletions(completions.content, model);
        }
      } catch (error) {
        if (LOG_LEVEL === 'verbose') {
          console.error(error);
        }
      }
    }

    return Promise.resolve<monaco.languages.CompletionList>({
      suggestions: items,
      incomplete: false,
    });
  }

  /**
   * Converts Jupyter completion result to list of Monaco completion items.
   */
  private adaptToMonacoCompletions(results: CompletionResults, model: monaco.editor.ITextModel) {
    let range: monaco.IRange;
    let percentCount = 0;
    let matches = results ? results.matches : [];
    if (results.metadata && results.metadata._jupyter_types_experimental) {
      matches = results.metadata._jupyter_types_experimental;
    }

    // retrieve the text that is currently typed out which is used to determine completion
    const startPos = model.getPositionAt(results.cursor_start);
    const endPos = model.getPositionAt(results.cursor_end);
    const context = model.getValueInRange({
      startLineNumber: startPos.lineNumber,
      startColumn: startPos.column,
      endLineNumber: endPos.lineNumber,
      endColumn: endPos.column,
    });

    return matches.map((match: CompletionMatch, index: number) => {
      if (typeof match === 'string') {
        const text = this.sanitizeText(match, context);
        const inserted = this.getInsertText(text, context);
        const filtered = this.getFilterText(text, context);
        return {
          kind: this.adaptToMonacoCompletionItemKind(unknownJupyterKind),
          label: text,
          insertText: inserted,
          filterText: filtered,
          sortText: this.getSortText(index),
        } as monaco.languages.CompletionItem;
      } else {
        // We only need to get the range once as the range is the same for all completion items in the list.
        if (!range) {
          const start = model.getPositionAt(match.start);
          const end = model.getPositionAt(match.end);
          range = {
            startLineNumber: start.lineNumber,
            startColumn: start.column,
            endLineNumber: end.lineNumber,
            endColumn: end.column,
          };

          // Get the range representing the text before the completion action was invoked.
          // If the text starts with magics % indicator, we need to track how many of these indicators exist
          // so that we ensure the insertion text only inserts the delta between what the user typed versus
          // what is recommended by the completion. Without this, there will be extra % insertions.
          // Example:
          // User types %%p then suggestion list will recommend %%python, if we now commit the item then the
          // final text in the editor becomes %%p%%python instead of %%python. This is why the tracking code
          // below is needed. This behavior is only specific to the magics % indicators as Monaco does not
          // handle % characters in their completion list well.
          const rangeText = model.getValueInRange(range);
          if (rangeText.startsWith('%%')) {
            percentCount = 2;
          } else if (rangeText.startsWith('%')) {
            percentCount = 1;
          }
        }

        const text = this.sanitizeText(match.text, context);
        const filtered = this.getFilterText(text, context);
        const inserted = this.getInsertText(text, context, percentCount);
        return {
          kind: this.adaptToMonacoCompletionItemKind(match.type),
          label: text,
          insertText: inserted,
          filterText: filtered,
          sortText: this.getSortText(index),
        } as monaco.languages.CompletionItem;
      }
    });
  }

  /**
   * Converts Jupyter completion item kind to Monaco completion item kind.
   * @param kind Jupyter completion item kind.
   */
  private adaptToMonacoCompletionItemKind(kind: string) {
    const result = jupyterToMonacoCompletionItemKind[kind];
    return result ? result : jupyterToMonacoCompletionItemKind[unknownJupyterKind];
  }

  /**
   * Removes problematic prefixes based on the context.
   *
   * Instead of showing "some/path" we should only show "path". For paths with white space, the kernel returns
   * ""some/path with spaces"" which we want to change to ""path with spaces"".
   *
   * Additionally, typing "[]." should not suggest ".append" since this results in "[]..append".
   *
   * @param text Text of Jupyter completion item
   */
  private sanitizeText(text: string, context: string) {
    // Assumption: if the current context contains a "/" then we're currently typing a path
    const isPathCompletion = context.includes('/');
    if (isPathCompletion) {
      // If we have whitespace within a path, the completion for it is a string wrapped in double quotes
      // We should return only the last part of the path, wrapped in double quotes
      const completionIsPathWithWhitespace = text.startsWith('"') && text.endsWith('"') && text.length > 2; // sanity check: not empty string
      if (completionIsPathWithWhitespace && text.substr(1).startsWith(context)) {
        // sanity check: the context is part of the suggested path
        const toRemove = context.substr(0, context.lastIndexOf('/') + 1);
        return `"${text.substr(toRemove.length + 1)}`;
      }

      // Otherwise, display the most specific item in the path
      if (text.startsWith(context)) {
        // sanity check: the context is part of the suggested path
        const toRemove = context.substr(0, context.lastIndexOf('/') + 1);
        return text.substr(toRemove.length);
      }
    }

    // Handle "." after paths, since those might contain "." as well. Note that we deal with this somewhat
    // generically, but also take a somewhat conservative approach by ensuring that the completion starts with the
    // current context to ensure that we aren't applying this when we shouldn't
    const isMemberCompletion = context.endsWith('.');
    if (isMemberCompletion && text.startsWith(context)) {
      const toRemove = context.substr(0, context.lastIndexOf('.') + 1);
      return text.substr(toRemove.length);
    }

    return text;
  }

  /**
   * Remove magics all % characters as Monaco doesn't like them for the filtering text.
   * Without this, completion won't show magics match items.
   *
   * Also remove quotes from the filter of a path wrapped in quotes to make sure we have
   * a smooth auto-complete experience.
   *
   * @param text Text of Jupyter completion item.
   */
  private getFilterText(text: string, context: string) {
    const isPathCompletion = context.includes('/');
    if (isPathCompletion) {
      const completionIsPathWithWhitespace = text.startsWith('"') && text.endsWith('"') && text.length > 2; // sanity check: not empty string
      if (completionIsPathWithWhitespace && text.substr(1).startsWith(context)) {
        // sanity check: the context is part of the suggested path
        return text.substr(1, text.length - 1);
      }
    }
    return text.replace(/%/g, '');
  }

  /**
   * Get insertion text handling what to insert for the magics case depending on what
   * has already been typed. Also handles an edge case for file paths with "." in the name.
   * @param text Text of Jupyter completion item.
   * @param percentCount Number of percent characters to remove
   */
  private getInsertText(text: string, context: string, percentCount: number = 0) {
    // There is an edge case for folders that have "." in the name. The default range for replacements is determined
    // by the "current word" but that doesn't allow "." in the string, so if you autocomplete "some." for a string
    // like "some.folder.name" you end up with "some.some.folder.name".
    const isPathCompletion = context.includes('/');
    const isPathWithPeriodInName = isPathCompletion && text.includes('.') && context.includes('.');
    if (isPathWithPeriodInName) {
      // The text in our sanitization step has already been filtered to only include the most specific path but
      // our context includes the full thing, so we need to determine the substring in the most specific path.
      // This is then used to figure out what we should actually insert.
      // example 1: context = "a/path/to/some." and text = "some.folder.name" should produce "folder.name"
      // example 2: context = "a/path/to/some.fo" and text = "some.folder.name" should still produce "folder.name"
      const completionContext = context.substr(context.lastIndexOf('/') + 1);
      if (text.startsWith(completionContext)) {
        // sanity check: the paths match
        return text.substr(completionContext.lastIndexOf('.') + 1);
      }
    }

    for (let i = 0; i < percentCount; i++) {
      text = text.replace('%', '');
    }
    return text;
  }

  /**
   * Maps numbers to strings, such that if a>b numerically, f(a)>f(b) lexicograhically.
   * 1 -> "za", 26 -> "zz", 27 -> "zza", 28 -> "zzb", 52 -> "zzz", 53 ->"zzza"
   * @param order Number to be converted to a sorting-string. order >= 0.
   * @returns A string representing the order.
   */
  private getSortText(order: number): string {
    order++;
    const numCharacters = 26; // "z" - "a" + 1;
    const div = Math.floor(order / numCharacters);

    let sortText = 'z';
    for (let i = 0; i < div; i++) {
      sortText += 'z';
    }

    const remainder = order % numCharacters;
    if (remainder > 0) {
      sortText += String.fromCharCode(96 + remainder);
    }
    return sortText;
  }
}

const completionProvider = new CompletionItemProvider();
export { completionProvider };

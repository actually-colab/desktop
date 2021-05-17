import { Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';

/**
 * Common Uri identifiers
 */
enum Identifiers {
  cellUriMarker = 'cell',
  notebookUriMarker = 'notebook',
}

/**
 * Map of language id to file extension.
 */
const languageToExtensionMap = new Map<string, string>();

/**
 * Document Monaco Uri helper to support conversions/detection for notebook and cells.
 */
export class DocumentUri {
  /**
   * Checks if uri represents a document.
   * @param uri Uri to validate.
   */
  static isDocument(uri: Uri): boolean {
    // Remove file extension if it exists and then check if uri path ends with the notebook marker.
    const path = uri.path.replace(/\.[^/.]+$/, '');
    return !!(path && path.endsWith(`/${Identifiers.notebookUriMarker}`));
  }

  /**
   * Checks if uri represents a cell.
   * @param uri Uri to validate.
   */
  static isCell(uri: Uri): boolean {
    // Remove file extension if it exists and then check if uri path ends with the cell marker.
    const path = uri.path.replace(/\.[^/.]+$/, '');
    return !!(path && path.endsWith(`/${Identifiers.cellUriMarker}`));
  }

  /**
   * Get document id from document uri.
   * @param uri Uri of cell.
   */
  static getDocumentIdFromDocumentUri(uri: Uri): string | undefined {
    if (DocumentUri.isDocument(uri)) {
      const tokens = uri.path.split('/');

      // Document uri path is in the format of "/<document_id>/notebook.<file_extension>" so we check the length
      // of the split is 3 tokens and grab the 2nd token (document id) which is index 1.
      if (tokens.length === 3) {
        return tokens[1];
      }
    }
    return undefined;
  }

  /**
   * Get document id from cell uri.
   * @param uri Uri of cell.
   */
  static getDocumentIdFromCellUri(uri: Uri): string | undefined {
    if (DocumentUri.isCell(uri)) {
      const tokens = uri.path.split('/');

      // Cell uri path is in the format of "/<document_id>/<cell_id>/cell.<file_extension>" so we check the length
      // of the split is 4 tokens and grab the 2nd token (document id) which is index 1.
      if (tokens.length === 4) {
        return tokens[1];
      }
    }
    return undefined;
  }

  /**
   * Get cell id from cell uri.
   * @param uri Uri of cell.
   */
  static getCellIdFromCellUri(uri: Uri): string | undefined {
    if (DocumentUri.isCell(uri)) {
      const tokens = uri.path.split('/');

      // Cell uri path is in the format of "/<document_id>/<cell_id>/cell.<file_extension>" so we check the length
      // of the split is 4 tokens and grab the 3rd token (cell id) which is index 2.
      if (tokens.length === 4) {
        return tokens[2];
      }
    }
    return undefined;
  }

  /**
   * Create a document uri.
   * @param id Document id.
   */
  static createDocumentUri(id: string, languageId: string): Uri {
    const fileExtension = DocumentUri.getFileExtension(languageId);
    return Uri.file(`${id}/${Identifiers.notebookUriMarker}${fileExtension}`);
  }

  /**
   * Create a cell uri.
   * @param documentId Document id.
   * @param cellId Cell id.
   */
  static createCellUri(documentId: string, cellId: string, languageId: string): Uri {
    const fileExtension = DocumentUri.getFileExtension(languageId);
    return Uri.file(`${documentId}/${cellId}/${Identifiers.cellUriMarker}${fileExtension}`);
  }

  /**
   * Get file extension for language. If no extension exist then empty string is returned.
   * @param languageId Language id.
   */
  private static getFileExtension(languageId: string) {
    if (!languageToExtensionMap.has(languageId)) {
      monaco.languages.getLanguages().forEach((metadata) => {
        languageToExtensionMap.set(
          // Language id
          metadata.id,
          // File extension if it exists. If more than one file extension exists then take the first one
          // as it's the more important version compared to the rest in the list.
          metadata.extensions && metadata.extensions.length > 0 ? metadata.extensions[0] : ''
        );
      });
    }

    return languageToExtensionMap.get(languageId) || '';
  }
}

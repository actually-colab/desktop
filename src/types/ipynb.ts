// Source: https://github.com/stencila/encoda
export type IpynbCell = IpynbRawCell | IpynbMarkdownCell | IpynbCodeCell;
export type IpynbOutput = IpynbExecuteResult | IpynbDisplayData | IpynbStream | IpynbError;

/**
 * Jupyter Notebook v4.2 JSON schema.
 */
export interface IpynbNotebook {
  /**
   * Notebook root-level metadata.
   */
  metadata: {
    /**
     * Kernel information.
     */
    kernelspec?: {
      /**
       * Name of the kernel specification.
       */
      name: string;
      /**
       * Name to display in UI.
       */
      display_name: string;
      [k: string]: any;
    };
    /**
     * Kernel information.
     */
    language_info?: {
      /**
       * The programming language which this kernel runs.
       */
      name: string;
      /**
       * The codemirror mode to use for code in this language.
       */
      codemirror_mode?:
        | string
        | {
            [k: string]: any;
          };
      /**
       * The file extension for files in this language.
       */
      file_extension?: string;
      /**
       * The mimetype corresponding to files in this language.
       */
      mimetype?: string;
      /**
       * The pygments lexer to use for code in this language.
       */
      pygments_lexer?: string;
      [k: string]: any;
    };
    /**
     * Original notebook format (major number) before converting the notebook between versions. This should never be written to a file.
     */
    orig_nbformat?: number;
    /**
     * The title of the notebook document
     */
    title?: string;
    /**
     * The author(s) of the notebook document
     */
    authors?: any[];
    [k: string]: any;
  };
  /**
   * Notebook format (minor number). Incremented for backward compatible changes to the notebook format.
   */
  nbformat_minor: number;
  /**
   * Notebook format (major number). Incremented between backwards incompatible changes to the notebook format.
   */
  nbformat: number;
  /**
   * Array of cells of the current notebook.
   */
  cells: IpynbCell[];
}
/**
 * Notebook raw nbconvert cell.
 */
export interface IpynbRawCell {
  /**
   * String identifying the type of cell.
   */
  cell_type: 'raw';
  /**
   * Cell-level metadata.
   */
  metadata: {
    /**
     * Raw cell metadata format for nbconvert.
     */
    format?: string;
    /**
     * Official Jupyter Metadata for Raw Cells
     */
    jupyter?: {
      [k: string]: any;
    };
    /**
     * The cell's name. If present, must be a non-empty string. Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check.
     */
    name?: string;
    /**
     * The cell's tags. Tags must be unique, and must not contain commas.
     */
    tags?: string[];
    [k: string]: any;
  };
  /**
   * Media attachments (e.g. inline images), stored as mimebundle keyed by filename.
   */
  attachments?: {
    /**
     * The attachment's data stored as a mimebundle.
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` ".*".
     */
    [k: string]: {
      /**
       * mimetype output (e.g. text/plain), represented as either an array of strings or a string.
       */
      [k: string]: string | string[];
    };
  };
  /**
   * Contents of the cell, represented as an array of lines.
   */
  source: string | string[];
}
/**
 * Notebook markdown cell.
 */
export interface IpynbMarkdownCell {
  /**
   * String identifying the type of cell.
   */
  cell_type: 'markdown';
  /**
   * Cell-level metadata.
   */
  metadata: {
    /**
     * The cell's name. If present, must be a non-empty string. Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check.
     */
    name?: string;
    /**
     * The cell's tags. Tags must be unique, and must not contain commas.
     */
    tags?: string[];
    /**
     * Official Jupyter Metadata for Markdown Cells
     */
    jupyter?: {
      [k: string]: any;
    };
    [k: string]: any;
  };
  /**
   * Media attachments (e.g. inline images), stored as mimebundle keyed by filename.
   */
  attachments?: {
    /**
     * The attachment's data stored as a mimebundle.
     *
     * This interface was referenced by `undefined`'s JSON-Schema definition
     * via the `patternProperty` ".*".
     */
    [k: string]: {
      /**
       * mimetype output (e.g. text/plain), represented as either an array of strings or a string.
       */
      [k: string]: string | string[];
    };
  };
  /**
   * Contents of the cell, represented as an array of lines.
   */
  source: string | string[];
}
/**
 * Notebook code cell.
 */
export interface IpynbCodeCell {
  /**
   * String identifying the type of cell.
   */
  cell_type: 'code';
  /**
   * Cell-level metadata.
   */
  metadata: {
    /**
     * Official Jupyter Metadata for Code Cells
     */
    jupyter?: {
      [k: string]: any;
    };
    /**
     * Whether the cell's output is collapsed/expanded.
     */
    collapsed?: boolean;
    /**
     * Whether the cell's output is scrolled, unscrolled, or autoscrolled.
     */
    scrolled?: true | false | 'auto';
    /**
     * The cell's name. If present, must be a non-empty string. Cell names are expected to be unique across all the cells in a given notebook. This criterion cannot be checked by the json schema and must be established by an additional check.
     */
    name?: string;
    /**
     * The cell's tags. Tags must be unique, and must not contain commas.
     */
    tags?: string[];
    [k: string]: any;
  };
  /**
   * Contents of the cell, represented as an array of lines.
   */
  source: string | string[];
  /**
   * Execution, display, or stream outputs.
   */
  outputs: IpynbOutput[];
  /**
   * The code cell's prompt number. Will be null if the cell has not been run.
   */
  execution_count: number | null;
}
/**
 * Result of executing a code cell.
 */
export interface IpynbExecuteResult {
  /**
   * Type of cell output.
   */
  output_type: 'execute_result';
  /**
   * A result's prompt number.
   */
  execution_count: number | null;
  /**
   * A mime-type keyed dictionary of data
   */
  data: {
    /**
     * mimetype output (e.g. text/plain), represented as either an array of strings or a string.
     */
    [k: string]: string | string[];
  };
  /**
   * Cell output metadata.
   */
  metadata: {
    [k: string]: any;
  };
}
/**
 * Data displayed as a result of code cell execution.
 */
export interface IpynbDisplayData {
  /**
   * Type of cell output.
   */
  output_type: 'display_data';
  /**
   * A mime-type keyed dictionary of data
   */
  data: {
    /**
     * mimetype output (e.g. text/plain), represented as either an array of strings or a string.
     */
    [k: string]: string | string[];
  };
  /**
   * Cell output metadata.
   */
  metadata: {
    [k: string]: any;
  };
}
/**
 * Stream output from a code cell.
 */
export interface IpynbStream {
  /**
   * Type of cell output.
   */
  output_type: 'stream';
  /**
   * The name of the stream (stdout, stderr).
   */
  name: string;
  /**
   * The stream's text output, represented as an array of strings.
   */
  text: string | string[];
}
/**
 * Output of an error that occurred during code cell execution.
 */
export interface IpynbError {
  /**
   * Type of cell output.
   */
  output_type: 'error';
  /**
   * The name of the error.
   */
  ename: string;
  /**
   * The value, or message, of the error.
   */
  evalue: string;
  /**
   * The error's traceback, represented as an array of strings.
   */
  traceback: string[];
}

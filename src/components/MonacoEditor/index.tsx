import * as React from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import debounce from 'lodash.debounce';

import { EditorCell } from '../../types/notebook';
import { Xcode } from './themes/xcode';
import { DocumentUri } from './documentUri';
import { completionProvider } from './completionProvider';

monaco.editor.defineTheme('xcode', Xcode);

export type IModelContentChangedEvent = monaco.editor.IModelContentChangedEvent;

/**
 * This adds an additional padded area around the editor for the mouse
 * to move around before we decide to hide the popup. This makes the
 * transition less erratic and hopefully a smoother experience.
 */
const HOVER_BOUND_DEFAULT_PADDING: number = 5;

/**
 * Settings for configuring keyboard shortcuts with Monaco
 */
export interface IMonacoShortCutProps {
  cellType: 'python' | 'markdown';
  cellFocusDirection: string | undefined;
  setCellFocusDirection: (direction?: string) => void;
  focusCell: (payload: { id: EditorCell['cell_id']; contentRef: EditorCell['cell_id'] }) => void;
  focusAboveCellCommandMode: () => void;
  focusBelowCellCommandMode: () => void;
  insertCellBelow: (contentRef: EditorCell['cell_id'], cellType: 'python' | 'markdown') => void;
  executeCell: () => void;
  focusEditor: () => void;
  focusNextCellEditor: (setPosition?: boolean) => void;
  focusPreviousCellEditor: () => void;
  unfocusEditor: () => void;
}

/**
 * Common props passed to the editor component
 */
export interface IMonacoComponentProps {
  id: EditorCell['cell_id'];
  contentRef: string;
  theme: 'vscode' | 'xcode';
  readOnly?: boolean;
  value: string;
  editorType?: string;
  editorFocused?: boolean;
  onChange?: (value: string, event?: any) => void;
  onFocusChange?: (focus: boolean) => void;
}

/**
 * Props passed for configuring Monaco Editor
 */
export interface IMonacoConfiguration {
  /**
   * modelUri acts an identifier to query the editor model
   * without being tied to the UI
   * Calling the getModel(modelUri) API
   */
  modelUri?: monaco.Uri;
  enableCompletion?: boolean;
  shouldRegisterDefaultCompletion?: boolean;
  onCursorPositionChange?: (selection: monaco.ISelection | null) => void;
  onRegisterDocumentFormattingEditProvider?: (languageId: string) => void;
  enableFormatting?: boolean;
  onRegisterCompletionProvider?: (languageId: string) => void;
  language: string;
  lineNumbers?: boolean;
  /** set height of editor to fit the specified number of lines in display */
  numberOfLines?: number;
  indentSize?: number;
  tabSize?: number;
  options?: monaco.editor.IEditorOptions;
  shortcutsOptions?: IMonacoShortCutProps;
  shortcutsHandler?: (editor: monaco.editor.IStandaloneCodeEditor, settings?: IMonacoShortCutProps) => void;
  cursorPositionHandler?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  commandHandler?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  onDidCreateEditor?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

/**
 * Initial props for Monaco Editor received from agnostic component
 */
export type IMonacoProps = IMonacoComponentProps & IMonacoConfiguration;

/**
 * Hides widgets such as parameters and hover, that belong to a given parent HTML element.
 *
 * @private
 * @param {HTMLDivElement} widgetParent
 * @param {string[]} selectors
 * @memberof MonacoEditor
 */
const hideWidgets = (widgetParent: HTMLDivElement, selectors: string[]) => {
  for (const selector of selectors) {
    for (const widget of Array.from<HTMLDivElement>(widgetParent.querySelectorAll(selector))) {
      widget.setAttribute(
        'class',
        widget.className
          .split(' ')
          .filter((cls: string) => cls !== 'visible')
          .join(' ')
      );
      if (widget.style.visibility !== 'hidden') {
        widget.style.visibility = 'hidden';
      }
    }
  }
};

/**
 * Return true if (x,y) coordinates overlap with an element's bounding rect.
 * @param {HTMLDivElement} element
 * @param {number} x
 * @param {number} y
 * @param {number} padding
 */
const coordsInsideElement = (
  element: Element | null | undefined,
  x: number,
  y: number,
  padding: number = HOVER_BOUND_DEFAULT_PADDING
): boolean => {
  if (!element) return false;
  const clientRect = element.getBoundingClientRect();
  return (
    x >= clientRect.left - padding &&
    x <= clientRect.right + padding &&
    y >= clientRect.top - padding &&
    y <= clientRect.bottom + padding
  );
};

/**
 * Creates a MonacoEditor instance
 */
const MonacoEditor: React.FC<IMonacoProps> = ({
  id,
  contentRef,
  theme,
  readOnly,
  value,
  editorFocused,
  onChange,
  onFocusChange,
  modelUri,
  enableCompletion,
  shouldRegisterDefaultCompletion,
  onCursorPositionChange,
  onRegisterDocumentFormattingEditProvider,
  enableFormatting,
  onRegisterCompletionProvider,
  language,
  lineNumbers,
  numberOfLines,
  indentSize,
  tabSize,
  options,
  shortcutsOptions,
  shortcutsHandler,
  cursorPositionHandler,
  commandHandler,
  onDidCreateEditor,
}) => {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const editorContainerRef = React.useRef<HTMLDivElement | null>(null);
  const contentHeightRef = React.useRef<number>(0);
  const cursorPositionListener = React.useRef<monaco.IDisposable>();
  const blurEditorWidgetListener = React.useRef<monaco.IDisposable>();
  const mouseMoveListener = React.useRef<monaco.IDisposable>();

  /**
   * Toggle editor options based on if the editor is in active state (i.e. focused).
   * When the editor is not active, we want to deactivate some of the visual noise.
   * @param isActive Whether editor is active.
   */
  const toggleEditorOptions = React.useCallback((isActive: boolean) => {
    editorRef.current?.updateOptions({
      matchBrackets: isActive ? 'always' : 'never',
      occurrencesHighlight: isActive,
      renderIndentGuides: isActive,
    });
  }, []);

  const registerCursorListener = React.useCallback(() => {
    if (editorRef.current && onCursorPositionChange) {
      const selection = editorRef.current.getSelection();
      onCursorPositionChange(selection);

      if (!cursorPositionListener.current) {
        cursorPositionListener.current = editorRef.current.onDidChangeCursorSelection((event) =>
          onCursorPositionChange?.(event.selection)
        );
      }
    }
  }, [onCursorPositionChange]);

  const unregisterCursorListener = React.useCallback(() => {
    if (cursorPositionListener.current) {
      cursorPositionListener.current.dispose();
      cursorPositionListener.current = undefined;
    }
  }, []);

  const onFocus = React.useCallback(() => {
    onFocusChange?.(true);
    toggleEditorOptions(true);
    registerCursorListener();
  }, [onFocusChange, registerCursorListener, toggleEditorOptions]);

  const onBlur = React.useCallback(() => {
    onFocusChange?.(false);
    toggleEditorOptions(false);
    unregisterCursorListener();
  }, [onFocusChange, toggleEditorOptions, unregisterCursorListener]);

  /**
   * Register language features for target language. Call before setting language type to model.
   */
  const registerCompletionProvider = React.useCallback(() => {
    if (enableCompletion && language === 'python') {
      if (onRegisterCompletionProvider) {
        onRegisterCompletionProvider(language);
      } else if (shouldRegisterDefaultCompletion) {
        monaco.languages.onLanguage(language, () => {
          monaco.languages.registerCompletionItemProvider(language, completionProvider);
        });
      }
    }
  }, [enableCompletion, language, onRegisterCompletionProvider, shouldRegisterDefaultCompletion]);

  const registerDocumentFormatter = React.useCallback(() => {
    if (enableFormatting && language) {
      onRegisterDocumentFormattingEditProvider?.(language);
    }
  }, [enableFormatting, language, onRegisterDocumentFormattingEditProvider]);

  /**
   * This will hide the parameter widget if the user is not hovering over
   * the parameter widget for this monaco editor.
   *
   * Notes: See issue https://github.com/microsoft/vscode-python/issues/7851 for further info.
   * Hide the parameter widget if the following conditions have been met:
   * - Editor doesn't have focus
   * - Mouse is not over (hovering) the parameter widget
   *
   * This method is only used for blurring at the moment given that parameter widgets from
   * other cells are hidden by mouse move events.
   *
   * @private
   * @returns
   * @memberof MonacoEditor
   */
  const hideParameterWidget = React.useCallback(() => {
    if (!editorRef.current || !editorRef.current.getDomNode() || !editorContainerRef.current) {
      return;
    }

    // Find all elements that the user is hovering over.
    // It's possible the parameter widget is one of them.
    const hoverElements: Element[] = Array.prototype.slice.call(document.querySelectorAll(':hover'));

    // These are the classes that will appear on a parameter widget when they are visible.
    const parameterWidgetClasses = ['editor-widget', 'parameter-hints-widget', 'visible'];

    // Find the parameter widget the user is currently hovering over.
    const isParameterWidgetHovered = hoverElements.find((item) => {
      if (typeof item.className !== 'string') {
        return false;
      }

      // Check if user is hovering over a parameter widget.
      const classes = item.className.split(' ');

      if (!parameterWidgetClasses.every((cls) => classes.indexOf(cls) >= 0)) {
        // Not all classes required in a parameter hint widget are in this element.
        // Hence this is not a parameter widget.
        return false;
      }

      // Ok, this element that the user is hovering over is a parameter widget.
      // Next, check whether this parameter widget belongs to this monaco editor.
      // We have a list of parameter widgets that belong to this editor, hence a simple lookup.
      return editorContainerRef.current?.contains(item);
    });

    // If the parameter widget is being hovered, don't hide it.
    if (isParameterWidgetHovered) {
      return;
    }

    // If the editor has focus, don't hide the parameter widget.
    // This is the default behavior. Let the user hit `Escape` or click somewhere
    // to forcefully hide the parameter widget.
    if (editorRef.current.hasWidgetFocus()) {
      return;
    }

    // If we got here, then the user is not hovering over the parameter widgets.
    // & the editor doesn't have focus.
    // However some of the parameter widgets associated with this monaco editor are visible.
    // We need to hide them.
    // Solution: Hide the widgets manually.
    hideWidgets(editorContainerRef.current, ['.parameter-hints-widget']);
  }, []);

  /**
   * Hides the parameters widgets related to other monaco editors.
   * Use this to ensure we only display parameters widgets for current editor (by hiding others).
   *
   * @private
   * @returns
   * @memberof MonacoEditor
   */
  const hideAllOtherParameterWidgets = React.useCallback(() => {
    if (!editorContainerRef.current) {
      return;
    }
    const widgetParents: HTMLDivElement[] = Array.prototype.slice.call(
      document.querySelectorAll('div.monaco-container')
    );

    widgetParents
      .filter((widgetParent) => widgetParent !== editorContainerRef.current?.parentElement)
      .forEach((widgetParent) => hideWidgets(widgetParent, ['.parameter-hints-widget']));
  }, []);

  const _handleCoordsOutsideWidgetActiveRegion = React.useCallback(
    (x: number, y: number) =>
      debounce(() => {
        const widget = document.querySelector('.parameter-hints-widget');
        if (widget != null && !coordsInsideElement(widget, x, y)) {
          hideAllOtherParameterWidgets();
        }
      }, 50),
    [hideAllOtherParameterWidgets]
  );

  const handleCoordsOutsideWidgetActiveRegion = React.useCallback(
    (x: number, y: number) => {
      _handleCoordsOutsideWidgetActiveRegion(x, y);
    },
    [_handleCoordsOutsideWidgetActiveRegion]
  );

  const addEditorTopMargin = React.useCallback(() => {
    if (editorRef.current) {
      // Monaco editor doesn't have margins
      // https://github.com/notable/notable/issues/551
      // This is a workaround to add an editor area 12px padding at the top
      // so that cursors decorators and context menus can be rendered correctly.
      editorRef.current.changeViewZones((changeAccessor) => {
        const domNode = document.createElement('div');
        changeAccessor.addZone({
          afterLineNumber: 0,
          heightInPx: 12,
          domNode,
        });
      });
    }
  }, []);

  /**
   * Tells editor to check the surrounding container size and resize itself appropriately
   */
  const resize = React.useCallback(() => {
    if (editorRef.current && editorFocused) {
      editorRef.current.layout();
    }
  }, [editorFocused]);

  /**
   * Adjust the height of editor
   *
   * @remarks
   * The way to determine how many lines we should display in editor:
   * If numberOfLines is not set or set to 0, we adjust the height to fit the content
   * If numberOfLines is specified we respect that setting
   */
  const calculateHeight = React.useCallback(() => {
    // Make sure we have an editor
    if (!editorRef.current) {
      return;
    }

    // Make sure we have a model
    const model = editorRef.current.getModel();
    if (!model) {
      return;
    }

    if (editorContainerRef.current) {
      const expectedLines = numberOfLines ?? model.getLineCount();
      // The find & replace menu takes up 2 lines, that is why 2 line is set as the minimum number of lines
      const finalizedLines = Math.max(expectedLines, 1) + 1;
      const lineHeight = editorRef.current.getOption(monaco.editor.EditorOption.lineHeight);
      const contentHeight = finalizedLines * lineHeight;

      if (contentHeightRef.current !== contentHeight) {
        editorContainerRef.current.style.height = contentHeight + 'px';
        editorRef.current.layout();
        contentHeightRef.current = contentHeight;
      }
    }
  }, [numberOfLines]);

  const onDidChangeModelContent = React.useCallback(
    (e: monaco.editor.IModelContentChangedEvent) => {
      if (editorRef.current) {
        if (onChange) {
          onChange(editorRef.current.getValue(), e);
        }

        calculateHeight();
      }
    },
    [calculateHeight, onChange]
  );

  React.useEffect(() => {
    if (editorContainerRef.current && !editorRef.current) {
      // Register Jupyter completion provider if needed
      registerCompletionProvider();

      // Register document formatter if needed
      registerDocumentFormatter();

      // Use Monaco model uri if provided. Otherwise, create a new model uri using editor id.
      const uri = modelUri ?? monaco.Uri.file(id);

      // Only create a new model if it does not exist. For example, when we double click on a markdown cell,
      // an editor model is created for it. Once we go back to markdown preview mode that doesn't use the editor,
      // double clicking on the markdown cell will again instantiate a monaco editor. In that case, we should
      // rebind the previously created editor model for the markdown instead of recreating one. Monaco does not
      // allow models to be recreated with the same uri.
      let model = monaco.editor.getModel(uri);
      if (!model) {
        model = monaco.editor.createModel(value, language, uri);
      }

      // Update Text model options
      model.updateOptions({
        indentSize,
        tabSize,
      });

      // Create Monaco editor backed by a Monaco model.
      editorRef.current = monaco.editor.create(editorContainerRef.current, {
        autoIndent: 'advanced',
        // Allow editor pop up widgets such as context menus, signature help, hover tips to be able to be
        // displayed outside of the editor. Without this, the pop up widgets can be clipped.
        fixedOverflowWidgets: true,
        find: {
          addExtraSpaceOnTop: false, // pops the editor out of alignment if turned on
          seedSearchStringFromSelection: true, // default is true
          autoFindInSelection: 'never', // default is "never"
        },
        language,
        lineNumbers: lineNumbers ? 'on' : 'off',
        minimap: {
          enabled: false,
        },
        model,
        overviewRulerLanes: 0,
        readOnly,
        // Disable highlight current line, too much visual noise with it on.
        // VS Code also has it disabled for their notebook experience.
        renderLineHighlight: 'none',
        scrollbar: {
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
          vertical: 'hidden',
          horizontal: 'hidden',
          verticalScrollbarSize: 0,
          horizontalScrollbarSize: 0,
          arrowSize: 30,
          alwaysConsumeMouseWheel: false,
        },
        scrollBeyondLastLine: false,
        theme,
        value,
        folding: false,
        autoDetectHighContrast: false,
        // Apply custom settings from configuration
        ...options,
      });

      // Handle on create events
      onDidCreateEditor?.(editorRef.current);

      addEditorTopMargin();

      // Handle custom keyboard shortcuts
      if (shortcutsHandler && shortcutsOptions) {
        shortcutsHandler(editorRef.current, shortcutsOptions);
      }

      // Handle custom commands
      if (commandHandler) {
        commandHandler(editorRef.current);
      }

      toggleEditorOptions(!!editorFocused);

      if (editorFocused) {
        if (!editorRef.current.hasTextFocus()) {
          // Bring browser focus to the editor if text not already in focus
          editorRef.current.focus();
        }

        registerCursorListener();
      }

      // Adds listeners for undo and redo actions emitted from the toolbar
      editorContainerRef.current.addEventListener('undo', () => {
        if (editorRef.current) {
          editorRef.current.trigger('undo-event', 'undo', {});
        }
      });
      editorContainerRef.current.addEventListener('redo', () => {
        if (editorRef.current) {
          editorRef.current.trigger('redo-event', 'redo', {});
        }
      });

      editorRef.current.onDidChangeModelContent(onDidChangeModelContent);
      editorRef.current.onDidFocusEditorText(onFocus);
      editorRef.current.onDidBlurEditorText(onBlur);
      calculateHeight();

      // Ensures that the source contents of the editor (value) is consistent with the state of the editor
      editorRef.current.setValue(value);
      if (cursorPositionHandler) {
        cursorPositionHandler(editorRef.current);
      }

      // When editor loses focus, hide parameter widgets (if any currently displayed).
      blurEditorWidgetListener.current = editorRef.current.onDidBlurEditorWidget(() => {
        hideParameterWidget();
      });

      mouseMoveListener.current = editorRef.current.onMouseMove((e: any) => {
        handleCoordsOutsideWidgetActiveRegion(e.event?.pos?.x, e.event?.pos?.y);
      });
    }
  }, [
    addEditorTopMargin,
    calculateHeight,
    commandHandler,
    cursorPositionHandler,
    editorFocused,
    handleCoordsOutsideWidgetActiveRegion,
    hideParameterWidget,
    id,
    indentSize,
    language,
    lineNumbers,
    modelUri,
    onBlur,
    onDidChangeModelContent,
    onDidCreateEditor,
    onFocus,
    options,
    readOnly,
    registerCompletionProvider,
    registerCursorListener,
    registerDocumentFormatter,
    shortcutsHandler,
    shortcutsOptions,
    tabSize,
    theme,
    toggleEditorOptions,
    value,
  ]);

  React.useEffect(() => {
    editorRef.current?.onDidChangeModelContent(onDidChangeModelContent);
  }, [onBlur, onDidChangeModelContent, onFocus]);

  React.useEffect(() => {
    editorRef.current?.onDidFocusEditorText(onFocus);
  }, [onFocus]);

  React.useEffect(() => {
    editorRef.current?.onDidBlurEditorText(onBlur);
  }, [onBlur]);

  React.useEffect(() => {
    if (editorRef.current) {
      cursorPositionHandler?.(editorRef.current);
    }
  }, [cursorPositionHandler]);

  React.useEffect(() => {
    if (editorRef.current) {
      // Handle custom commands
      commandHandler?.(editorRef.current);
    }
  }, [commandHandler]);

  React.useEffect(() => {
    if (editorRef.current) {
      // Ensures that the source contents of the editor (value) is consistent with the state of the editor
      if (editorRef.current.getValue() !== value) {
        editorRef.current.setValue(value);
      }
    }
  }, [value]);

  React.useEffect(() => {
    if (editorRef.current) {
      // Register Jupyter completion provider if needed
      registerCompletionProvider();
    }
  }, [registerCompletionProvider]);

  React.useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();

      // Apply new model to the editor when the language is changed.
      if (model && language && model.getModeId() !== language) {
        // Get a reference to the current editor
        const editor = editorRef.current;

        // We need to set the model in a separate event because the `language` prop update happens before the
        // internal editor receives an update to the cursor position when invoking language magics. Additionally,
        // we need to dispose of the old model in a separate event. We cannot dispose of the model within the
        // componentDidUpdate method or else the editor will throw an exception. Zero in the timeout field
        // means execute immediately but in a seperate next event.
        setTimeout(() => {
          const newUri = DocumentUri.createCellUri(contentRef, id, language);
          if (!monaco.editor.getModel(newUri)) {
            // Save the cursor position before we set new model.
            const position = editor.getPosition();

            // Set new model targeting the changed language.
            editor.setModel(monaco.editor.createModel(value, language, newUri));
            addEditorTopMargin();

            // Restore cursor position to new model.
            if (position) {
              editor.setPosition(position);
            }

            // Set focus
            if (editorFocused && !editor.hasTextFocus()) {
              editor.focus();
            }

            // Dispose the old model
            model.dispose();
          }
        }, 0);
      }
    }
  }, [addEditorTopMargin, contentRef, editorFocused, id, language, value]);

  React.useEffect(() => {
    if (editorRef.current) {
      const monacoUpdateOptions: monaco.editor.IEditorOptions & monaco.editor.IGlobalEditorOptions = {
        readOnly,
      };

      if (theme) {
        monacoUpdateOptions.theme = theme;
      }

      editorRef.current.updateOptions(monacoUpdateOptions);
    }
  }, [readOnly, theme]);

  React.useEffect(() => {
    if (editorRef.current) {
      // In the multi-tabs scenario, when the notebook is hidden by setting "display:none",
      // Any state update propagated here would cause a UI re-layout, monaco-editor will then recalculate
      // and set its height to 5px.
      // To work around that issue, we skip updating the UI when paraent element's offsetParent is null (which
      // indicate an ancient element is hidden by display set to none)
      // We may revisit this when we get to refactor for multi-notebooks.
      if (!editorContainerRef.current?.offsetParent) {
        return;
      }

      // Set focus
      if (editorFocused && !editorRef.current.hasTextFocus()) {
        editorRef.current.focus();
      }

      // Tells the editor pane to check if its container has changed size and fill appropriately
      editorRef.current.layout();
    }
  }, [editorFocused]);

  React.useEffect(() => {
    // Adds listener under the resize window event which calls the resize method
    window.addEventListener('resize', resize);

    const editor = editorRef.current;
    const blurListener = blurEditorWidgetListener.current;
    const mouseListener = mouseMoveListener.current;

    return () => {
      if (editor) {
        try {
          const model = editor.getModel();

          window.removeEventListener('resize', resize);

          if (model) {
            model.dispose();
          }

          editor.dispose();
        } catch (error) {
          console.error(error);
        }
      }

      blurListener?.dispose();
      mouseListener?.dispose();
    };
  }, [resize]);

  return (
    <div className="monaco-container">
      <div ref={editorContainerRef} id={`editor-${id}`} />
    </div>
  );
};

export default MonacoEditor;

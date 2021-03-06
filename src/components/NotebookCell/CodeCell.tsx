import * as React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { DCell } from '@actually-colab/editor-types';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';
import { getUserColor } from '../../utils/color';
import { palette } from '../../constants/theme';
import MonacoEditor from '../MonacoEditor';

const styles = StyleSheet.create({
  codeContainer: {
    pointerEvents: 'auto',
    opacity: 1,
    width: '100%',
  },
  codeContainerLockInUse: {
    opacity: 0.5,
  },
  codeContainerLockedByOtherUser: {
    opacity: 0.7,
  },
  container: {
    position: 'relative',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  containerBlurred: {
    borderColor: palette.BASE_BORDER,
  },
  containerFocused: {
    borderColor: palette.PRIMARY,
  },
  shadow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'none',
  },
});

/**
 * A component to render a code cell with the Ace Editor
 */
const CodeCell: React.FC<{
  cell_id: EditorCell['cell_id'];
}> = ({ cell_id }) => {
  const editorRef = React.useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = React.useRef<string[]>([]);
  const cursorTimer = React.useRef<NodeJS.Timeout | null>(null);

  const uid = useSelector((state: ReduxState) => state.auth.user?.uid);
  const canEdit = useSelector(
    (state: ReduxState) =>
      state.editor.notebook?.users.find((_user) => _user.uid === uid)?.access_level === 'Full Access',
    shallowEqual
  );
  const lock_held_by = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.lock_held_by);
  const lockOwner = useSelector((state: ReduxState) => {
    const cell = state.editor.cells.get(cell_id);

    return cell?.lock_held_by
      ? state.editor.notebook?.users.find((_user) => _user.uid === cell.lock_held_by)?.name ?? ''
      : '';
  }, shallowEqual);
  const ownsLock = useSelector(
    (state: ReduxState) => state.editor.cells.get(cell_id)?.lock_held_by === uid,
    shallowEqual
  );
  const ownsNoCells = useSelector(
    (state: ReduxState) => !state.editor.lockedCells.find((lock) => lock.uid === uid),
    shallowEqual
  );
  const language = useSelector(
    (state: ReduxState) => state.editor.cells.get(cell_id)?.language ?? 'python',
    shallowEqual
  );
  const rendered = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.rendered, shallowEqual);
  const contents = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.contents ?? '');
  const cursor = useSelector((state: ReduxState) => {
    const cell = state.editor.cells.get(cell_id);

    return {
      row: cell?.cursor_row ?? null,
      col: cell?.cursor_col ?? null,
    };
  }, shallowEqual);

  const [editorNonce, setEditorNonce] = React.useState<number>(-1);
  const [showCursorLabel, setShowCursorLabel] = React.useState<boolean>(false);

  const userColor = React.useMemo(() => (lock_held_by ? getUserColor(lock_held_by) : ''), [lock_held_by]);
  const lockedByOtherUser = React.useMemo(() => !!lock_held_by && lock_held_by !== uid, [lock_held_by, uid]);
  const canLock = React.useMemo(() => !lock_held_by, [lock_held_by]);
  const markerStyle = React.useMemo<React.CSSProperties>(
    () => ({
      '--user-marker-label': showCursorLabel ? `"${lockOwner}"` : '""',
      '--user-marker-color': userColor,
      borderColor: userColor,
    }),
    [lockOwner, showCursorLabel, userColor]
  );
  const shadowStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (!ownsLock && userColor === '') {
      return undefined;
    }

    const shadow = `inset 0 0 3px ${ownsLock ? palette.PRIMARY : userColor}`;

    return {
      MozBoxShadow: shadow,
      WebkitBoxShadow: shadow,
      boxShadow: shadow,
    };
  }, [ownsLock, userColor]);
  const cursorShouldUpdate = React.useMemo(() => cursor.row === null || cursor.col === null, [cursor.col, cursor.row]);
  const readOnly = React.useMemo(() => !ownsLock, [ownsLock]);

  const dispatch = useDispatch();

  const onFocusEditor = React.useCallback(() => {
    if (!canEdit) return;

    if (canLock) {
      dispatch(_editor.lockCell(cell_id));
    }

    dispatch(_editor.selectCell(cell_id));
  }, [canEdit, canLock, cell_id, dispatch]);

  const onChange = React.useCallback(
    (changes: Partial<DCell>) => {
      dispatch(
        _editor.editCell(cell_id, {
          changes,
        })
      );
    },
    [cell_id, dispatch]
  );

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (!ownsLock) return;

      onChange({
        contents: newValue,
      });
    },
    [onChange, ownsLock]
  );

  const handleCursorChange = React.useCallback(
    (selection: monaco.ISelection | null) => {
      if (!ownsLock || !selection) return;

      onChange({
        cursor_col: selection.positionColumn,
        cursor_row: selection.positionLineNumber,
      });
    },
    [onChange, ownsLock]
  );

  const addRunCommand = React.useCallback(() => {
    editorRef.current?.addCommand(monaco.KeyMod.WinCtrl | monaco.KeyCode.Enter, () => {
      if (language === 'python') {
        dispatch(_editor.addCellToQueue(cell_id));
      } else {
        dispatch(
          _editor.editCell(cell_id, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    });
  }, [cell_id, dispatch, language]);

  const handleEditorCreated = React.useCallback((editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    setEditorNonce(Date.now());
  }, []);

  const handleFocusChange = React.useCallback(
    (focused: boolean) => {
      if (focused) onFocusEditor();
    },
    [onFocusEditor]
  );

  /**
   * Change the decorations for the current editor instance
   */
  const replaceDecorations = React.useCallback((className?: string, row?: number, col?: number) => {
    decorationsRef.current =
      editorRef.current?.deltaDecorations(
        decorationsRef.current,
        className && row != null && col != null
          ? [
              {
                range: new monaco.Range(row, col - 1, row, col),
                options: {
                  afterContentClassName: className,
                },
              },
            ]
          : []
      ) ?? [];
  }, []);

  /**
   * Set the cursor position on initial focus.
   *
   * This cannot be done in the onFocus event because the cell is not necessarily editable at that point
   */
  React.useEffect(() => {
    if (!ownsLock || !cursorShouldUpdate) return;

    const cursor_pos = editorRef.current?.getPosition();

    if (cursor_pos) {
      onChange({
        cursor_col: cursor_pos?.column,
        cursor_row: cursor_pos?.lineNumber,
      });
    }
  }, [cursorShouldUpdate, onChange, ownsLock]);

  /**
   * Hide cursor label after a short period of inactivity
   */
  React.useEffect(() => {
    if (!ownsLock && cursor.row !== null && cursor.col !== null) {
      if (cursorTimer.current !== null) {
        // Will replace the timeout
        clearTimeout(cursorTimer.current);
      } else {
        // Start showing the label
        setShowCursorLabel(true);
      }

      // Render with a label
      replaceDecorations('user-marker', cursor.row, cursor.col);

      // Hide the cursor after 2 seconds if no change
      cursorTimer.current = setTimeout(() => {
        setShowCursorLabel(false);

        if (cursor.row !== null && cursor.col !== null) {
          // Render without a label
          replaceDecorations('user-marker-blank', cursor.row, cursor.col);
        }

        cursorTimer.current = null;
      }, 3000);
    } else {
      if (cursorTimer.current !== null) {
        // Remove the timeout
        clearTimeout(cursorTimer.current);
        cursorTimer.current = null;
      }

      // Clear the decorations
      replaceDecorations();
    }
  }, [cursor.col, cursor.row, ownsLock, replaceDecorations]);

  /**
   * Add the run cell command shortcut when editor is ready
   */
  React.useEffect(() => {
    if (editorNonce) {
      addRunCommand();
    }
  }, [addRunCommand, editorNonce]);

  // Do not render if markdown is rendered
  if (language === 'markdown' && rendered) {
    return null;
  }

  return (
    <div
      className={css(
        styles.codeContainer,
        lockedByOtherUser
          ? styles.codeContainerLockedByOtherUser
          : !ownsLock && (!canLock || !ownsNoCells)
          ? styles.codeContainerLockInUse
          : undefined
      )}
    >
      <div
        className={css(
          styles.container,
          ownsLock ? styles.containerFocused : userColor === '' && styles.containerBlurred
        )}
        style={markerStyle}
      >
        <MonacoEditor
          id={cell_id}
          onDidCreateEditor={handleEditorCreated}
          contentRef="actually-colab"
          theme="xcode"
          language={language}
          lineNumbers
          enableCompletion
          shouldRegisterDefaultCompletion
          value={contents}
          readOnly={readOnly}
          onFocusChange={handleFocusChange}
          onChange={handleChange}
          onCursorPositionChange={handleCursorChange}
        />

        <div className={css(styles.shadow)} style={shadowStyle} />
      </div>
    </div>
  );
};

export default CodeCell;

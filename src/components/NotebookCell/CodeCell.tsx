import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import * as monaco from 'monaco-editor';
import { DCell } from '@actually-colab/editor-types';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';
import { randomColor } from '../../utils/color';
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
  const language = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.language);
  const rendered = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.rendered);
  const contents = useSelector((state: ReduxState) => state.editor.cells.get(cell_id)?.contents);
  const cursor = useSelector((state: ReduxState) => {
    const cell = state.editor.cells.get(cell_id);

    return {
      row: cell?.cursor_row ?? null,
      col: cell?.cursor_col ?? null,
    };
  }, shallowEqual);

  const [showCursorLabel, setShowCursorLabel] = React.useState<boolean>(false);

  const userColor = React.useMemo(
    () =>
      lock_held_by
        ? randomColor({
            seed: lock_held_by ?? undefined,
          })
        : '',
    [lock_held_by]
  );
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
  const cursorShouldUpdate = React.useMemo(() => cursor.row === null || cursor.col === null, [cursor.col, cursor.row]);

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
          onDidCreateEditor={(editor) => (editorRef.current = editor)}
          contentRef="actually-colab"
          theme="xcode"
          language={language ?? 'python'}
          lineNumbers
          value={contents ?? ''}
          readOnly={!ownsLock}
          onFocusChange={(focused) => focused && onFocusEditor()}
          onChange={handleChange}
          onCursorPositionChange={handleCursorChange}
        />
      </div>
    </div>
  );
};

export default CodeCell;

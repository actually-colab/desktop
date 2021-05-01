import React from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import AceEditor, { IMarker } from 'react-ace';
import { DCell } from '@actually-colab/editor-types';

import { ReduxState } from '../../types/redux';
import { EditorCell } from '../../types/notebook';
import { _editor } from '../../redux/actions';
import { editorOptionsActive, editorOptionsInactive } from '../../constants/editorOptions';
import { palette } from '../../constants/theme';

const styles = StyleSheet.create({
  codeContainer: {
    pointerEvents: 'auto',
    opacity: 1,
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
  const editorRef = React.useRef<AceEditor | null>(null);

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

  const lockedByOtherUser = React.useMemo(() => !!lock_held_by && lock_held_by !== uid, [lock_held_by, uid]);
  const canLock = React.useMemo(() => !lock_held_by, [lock_held_by]);
  const aceOptions = React.useMemo(() => (ownsLock ? editorOptionsActive : editorOptionsInactive), [ownsLock]);
  const wrapEnabled = React.useMemo(() => language === 'markdown', [language]);
  const markers = React.useMemo<IMarker[]>(() => {
    if (ownsLock || cursor.row === null || cursor.col === null) {
      return [];
    }

    return [
      {
        className: 'user-marker',
        type: 'text',
        startRow: cursor.row,
        startCol: cursor.col,
        endRow: cursor.row,
        endCol: cursor.col + 1,
      },
    ];
  }, [cursor.col, cursor.row, ownsLock]);
  const markerStyle = React.useMemo<any>(() => ({ '--user-marker-label': `"${lockOwner}"` }), [lockOwner]);
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
    (selection: { cursor: { row: number; column: number } }) => {
      if (!ownsLock) return;

      onChange({
        cursor_col: selection.cursor.column,
        cursor_row: selection.cursor.row,
      });
    },
    [onChange, ownsLock]
  );

  /**
   * Set the cursor position on initial focus.
   *
   * This cannot be done in the onFocus event because the cell is not necessarily editable at that point
   */
  React.useEffect(() => {
    if (ownsLock && cursorShouldUpdate && editorRef.current?.editor.isFocused()) {
      const cursor_pos = editorRef.current?.editor.getCursorPosition();

      onChange({
        cursor_col: cursor_pos.column,
        cursor_row: cursor_pos.row,
      });
    }
  }, [cursorShouldUpdate, onChange, ownsLock]);

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
        className={css(styles.container, ownsLock ? styles.containerFocused : styles.containerBlurred)}
        style={markerStyle}
      >
        <AceEditor
          ref={editorRef}
          style={{ width: '100%' }}
          name={cell_id}
          mode={language ?? 'python'}
          theme="xcode"
          setOptions={aceOptions}
          minLines={1}
          maxLines={Infinity}
          value={contents}
          onFocus={onFocusEditor}
          onChange={handleChange}
          onCursorChange={handleCursorChange}
          wrapEnabled={wrapEnabled}
          markers={markers}
        />
      </div>
    </div>
  );
};

export default CodeCell;

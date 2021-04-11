import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import AceEditor, { IMarker } from 'react-ace';
import { DCell } from '@actually-colab/editor-types';

import { ReduxState } from '../types/redux';
import { EditorCell } from '../types/notebook';
import { ImmutableEditorCell } from '../immutable';
import { editorOptionsActive, editorOptionsInactive } from '../constants/editorOptions';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
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
  cell: ImmutableEditorCell;
  onFocus?(cell_id: EditorCell['cell_id']): void;
  onBlur?(cell_id: EditorCell['cell_id']): void;
  onChange(cell_id: EditorCell['cell_id'], changes: Partial<DCell>): void;
}> = ({ cell, onFocus, onBlur, onChange }) => {
  const editorRef = React.useRef<AceEditor | null>(null);

  const user = useSelector((state: ReduxState) => state.auth.user);

  const isEditable = React.useMemo(() => cell.lock_held_by === user?.uid, [cell.lock_held_by, user?.uid]);
  const aceOptions = React.useMemo(() => (isEditable ? editorOptionsActive : editorOptionsInactive), [isEditable]);
  const cell_id = React.useMemo(() => cell.cell_id, [cell.cell_id]);
  const language = React.useMemo(() => cell.language, [cell.language]);
  const contents = React.useMemo(() => cell.contents, [cell.contents]);
  const wrapEnabled = React.useMemo(() => language === 'markdown', [language]);
  const markers = React.useMemo<IMarker[]>(() => {
    if (isEditable || cell.cursor_col === null || cell.cursor_row === null) {
      return [];
    }

    return [
      {
        className: 'user-marker-1',
        type: 'text',
        startRow: cell.cursor_row,
        startCol: cell.cursor_col,
        endRow: cell.cursor_row,
        endCol: cell.cursor_col + 1,
      },
    ];
  }, [cell.cursor_col, cell.cursor_row, isEditable]);

  const handleFocus = React.useCallback(() => {
    onFocus?.(cell_id);
  }, [cell_id, onFocus]);

  const handleBlur = React.useCallback(() => {
    onBlur?.(cell_id);
  }, [cell_id, onBlur]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      if (!isEditable) return;

      onChange(cell_id, {
        contents: newValue,
      });
    },
    [cell_id, isEditable, onChange]
  );

  const handleCursorChange = React.useCallback(
    (selection: { cursor: { row: number; column: number } }) => {
      if (!isEditable) return;

      onChange(cell_id, {
        cursor_col: selection.cursor.column,
        cursor_row: selection.cursor.row,
      });
    },
    [cell_id, isEditable, onChange]
  );

  /**
   * Set the cursor position on initial focus.
   *
   * This cannot be done in the onFocus event because the cell is not necessarily editable at that point
   */
  React.useEffect(() => {
    if (isEditable && (cell.cursor_col === null || cell.cursor_row === null) && editorRef.current?.editor.isFocused()) {
      const cursor_pos = editorRef.current?.editor.getCursorPosition();

      onChange(cell_id, {
        cursor_col: cursor_pos.column,
        cursor_row: cursor_pos.row,
      });
    }
  }, [cell.cursor_col, cell.cursor_row, cell_id, isEditable, onChange]);

  return (
    <div className={css(styles.container, isEditable ? styles.containerFocused : styles.containerBlurred)}>
      <AceEditor
        ref={editorRef}
        style={{ width: '100%' }}
        name={cell_id}
        mode={language}
        theme="xcode"
        setOptions={aceOptions}
        minLines={1}
        maxLines={Infinity}
        value={contents}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onCursorChange={handleCursorChange}
        wrapEnabled={wrapEnabled}
        markers={markers}
      />
    </div>
  );
};

export default CodeCell;

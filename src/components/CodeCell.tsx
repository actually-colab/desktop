import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import AceEditor from 'react-ace';

import { ReduxState } from '../types/redux';
import { EditorCell, ImmutableEditorCell } from '../types/notebook';
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
  editor: {
    width: '100%',
  },
});

/**
 * A component to render a code cell with the Ace Editor
 */
const CodeCell: React.FC<{
  cell: ImmutableEditorCell;
  onFocus?(cell_id: EditorCell['cell_id']): void;
  onBlur?(cell_id: EditorCell['cell_id']): void;
  onChange(cell_id: EditorCell['cell_id'], newValue: string): void;
}> = ({ cell, onFocus, onBlur, onChange }) => {
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);

  const isEditable = React.useMemo(() => lockedCellId === cell.get('cell_id'), [cell, lockedCellId]);

  const handleFocus = React.useCallback(() => {
    onFocus?.(cell.get('cell_id'));
  }, [cell, onFocus]);

  const handleBlur = React.useCallback(() => {
    onBlur?.(cell.get('cell_id'));
  }, [cell, onBlur]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      onChange(cell.get('cell_id'), newValue);
    },
    [cell, onChange]
  );

  return (
    <div className={css(styles.container, isEditable ? styles.containerFocused : styles.containerBlurred)}>
      <AceEditor
        style={{ width: '100%' }}
        name={cell.get('cell_id')}
        mode={cell.get('language')}
        theme="xcode"
        setOptions={isEditable ? editorOptionsActive : editorOptionsInactive}
        minLines={1}
        maxLines={Infinity}
        value={cell.get('contents')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        wrapEnabled={cell.get('language') === 'markdown'}
      />
    </div>
  );
};

export default CodeCell;

import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import AceEditor from 'react-ace';

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
  const user = useSelector((state: ReduxState) => state.auth.user);

  const isEditable = React.useMemo(() => cell.lock_held_by === user?.uid, [cell.lock_held_by, user?.uid]);
  const aceOptions = React.useMemo(() => (isEditable ? editorOptionsActive : editorOptionsInactive), [isEditable]);
  const cell_id = React.useMemo(() => cell.cell_id, [cell.cell_id]);
  const language = React.useMemo(() => cell.language, [cell.language]);
  const contents = React.useMemo(() => cell.contents, [cell.contents]);
  const wrapEnabled = React.useMemo(() => language === 'markdown', [language]);

  const handleFocus = React.useCallback(() => {
    onFocus?.(cell_id);
  }, [cell_id, onFocus]);

  const handleBlur = React.useCallback(() => {
    onBlur?.(cell_id);
  }, [cell_id, onBlur]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      onChange(cell_id, newValue);
    },
    [cell_id, onChange]
  );

  return (
    <div className={css(styles.container, isEditable ? styles.containerFocused : styles.containerBlurred)}>
      <AceEditor
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
        wrapEnabled={wrapEnabled}
      />
    </div>
  );
};

export default CodeCell;

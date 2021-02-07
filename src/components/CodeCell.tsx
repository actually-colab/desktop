import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import AceEditor from 'react-ace';

import { EditorCell } from '../kernel/types';
import { editorOptionsActive, editorOptionsInactive } from '../constants/editorOptions';
import { palette } from '../constants/theme';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: palette.BASE_BORDER,
  },
  editor: {
    width: '100%',
  },
});

const CodeCell: React.FC<{
  cell: EditorCell;
  onFocus(_id: string): void;
  onBlur(_id: string): void;
  onChange(_id: string, newValue: string): void;
}> = ({ cell, onFocus, onBlur, onChange }) => {
  const handleFocus = React.useCallback(() => {
    onFocus(cell._id);
  }, [cell._id, onFocus]);

  const handleBlur = React.useCallback(() => {
    onBlur(cell._id);
  }, [cell._id, onBlur]);

  const handleChange = React.useCallback(
    (newValue: string) => {
      onChange(cell._id, newValue);
    },
    [cell._id, onChange]
  );

  return (
    <div className={css(styles.container)}>
      <AceEditor
        style={{ width: '100%' }}
        name={cell._id}
        mode="python"
        theme="xcode"
        setOptions={cell.active ? editorOptionsActive : editorOptionsInactive}
        minLines={1}
        maxLines={Infinity}
        value={cell.code}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </div>
  );
};

export default CodeCell;

import React from 'react';
import { StyleSheet, css } from 'aphrodite';
import AceEditor from 'react-ace';

import { EditorCell } from '../kernel/types';
import { editorOptions } from '../constants/editorOptions';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 400,
  },
});

const CodeCell: React.FC<{
  cell: EditorCell;
  onChange(newValue: string): void;
}> = ({ cell, onChange }) => {
  return (
    <div className={css(styles.container)}>
      <AceEditor
        name={cell._id}
        mode="python"
        theme="xcode"
        value={cell.code}
        onChange={onChange}
        setOptions={editorOptions}
      />
    </div>
  );
};

export default CodeCell;

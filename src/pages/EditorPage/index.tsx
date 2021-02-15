import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';

import AceImports from '../../utils/AceImports';
import { palette, spacing } from '../../constants/theme';
import { EditorCell } from '../../types/notebook';
import { ReduxState } from '../../redux';
import { _editor } from '../../redux/actions';
import useKernel from '../../kernel/useKernel';
import { CodeCell } from '../../components';

import { EditorHeader, LeftSidebar, RightSidebar } from './components';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  page: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  editableAreaContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  editableArea: {
    flex: 1,
    padding: spacing.DEFAULT,
    overflowY: 'auto',
  },
});

const EditorPage: React.FC = () => {
  const kernel = useKernel();

  const cells = useSelector((state: ReduxState) => state.editor.cells);

  const dispatch = useDispatch();
  const dispatchEditCell = React.useCallback(
    (cellId: string, changes: Partial<EditorCell>) => dispatch(_editor.editCell(cellId, changes)),
    [dispatch]
  );

  return (
    <React.Fragment>
      {AceImports}

      <div className={css(styles.container)}>
        <EditorHeader />

        <div className={css(styles.page)}>
          <LeftSidebar />

          <div className={css(styles.editableAreaContainer)}>
            <div className={css(styles.editableArea)}>
              {cells.map((cell) => (
                <CodeCell
                  key={cell._id}
                  cell={cell}
                  onFocus={(_id) => {
                    // TODO: lock
                    dispatchEditCell(_id, {
                      active: true,
                    });
                  }}
                  onBlur={(_id) => {
                    // TODO: unlock
                    dispatchEditCell(_id, {
                      active: false,
                    });
                  }}
                  onChange={(_id, newValue) =>
                    dispatchEditCell(_id, {
                      code: newValue,
                    })
                  }
                />
              ))}
            </div>
          </div>

          <RightSidebar />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EditorPage;

import React from 'react';
import { StyleSheet, css } from 'aphrodite';

import AceImports from '../../utils/AceImports';
import { palette, spacing } from '../../constants/theme';
import useKernel from '../../kernel/useKernel';

import { EditorHeader, LeftSidebar, RightSidebar } from './components';
import { CodeCell } from '../../components';

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

const fibCode = `def fib(n):
    if n <= 1:
        return n

    return n * fib(n - 1)

for i in range(8):
    print fib(i)`;

const EditorPage: React.FC = () => {
  const kernel = useKernel();

  const [active, setActive] = React.useState<boolean>(false);
  const [code, setCode] = React.useState<string>(fibCode);

  return (
    <React.Fragment>
      {AceImports}

      <div className={css(styles.container)}>
        <EditorHeader />

        <div className={css(styles.page)}>
          <LeftSidebar />

          <div className={css(styles.editableAreaContainer)}>
            <div className={css(styles.editableArea)}>
              <CodeCell
                cell={{
                  active,
                  code,
                  _id: 'some-editor',
                  runIndex: 0,
                  output: [],
                }}
                onFocus={(_id) => setActive(true)}
                onBlur={(_id) => setActive(false)}
                onChange={(_id, newValue) => setCode(newValue)}
              />
            </div>
          </div>

          <RightSidebar />
        </div>
      </div>
    </React.Fragment>
  );
};

export default EditorPage;

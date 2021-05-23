import * as React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Modal } from 'rsuite';

import { ReduxState } from '../../types/redux';
import { palette } from '../../constants/theme';
import useKernel from '../../kernel/useKernel';

import { EditorBody, EditorHeader, LeftSidebar, RightSidebar } from './components';
import useNotebooks from './hooks/useNotebooks';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
  },
  page: {
    display: 'flex',
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  bodyContainer: {
    display: 'flex',
    flex: 1,
    backgroundColor: palette.BASE,
    flexDirection: 'column',
    overflow: 'hidden',
  },
  rightContainer: {
    display: 'flex',
  },
});

/**
 * Attach high level helpers that shouldn't trigger re-renders
 */
const Helpers: React.FC = () => {
  // Include the kernel manager once
  useKernel();
  // Include the notebooks
  useNotebooks();

  return null;
};

/**
 * An overlay that prevents interaction while connecting to the server
 */
const ConnectionOverlay: React.FC = () => {
  const clientConnectionStatus = useSelector((state: ReduxState) => state.editor.clientConnectionStatus);

  const [isFirstLoad, setIsFirstLoad] = React.useState<boolean>(true);

  /**
   * Don't show modal unless it is a reconnect
   */
  React.useEffect(() => {
    if (clientConnectionStatus === 'Connected') {
      setIsFirstLoad(false);
    }
  }, [clientConnectionStatus]);

  if (isFirstLoad) {
    return null;
  }

  return (
    <Modal show={clientConnectionStatus !== 'Connected'} backdrop="static" size="xs" keyboard={false}>
      <Modal.Title>Reconnecting...</Modal.Title>
      <Modal.Body>Thanks for being patient while we connect to our servers, this may take a moment!</Modal.Body>
    </Modal>
  );
};

/**
 * The editor page
 */
const EditorPage: React.FC = () => {
  return (
    <div className={css(styles.container)}>
      <Helpers />
      <LeftSidebar />

      <div className={css(styles.pageContainer)}>
        <EditorHeader />

        <div className={css(styles.page)}>
          <div className={css(styles.bodyContainer)}>
            <EditorBody />
          </div>

          <div className={css(styles.rightContainer)}>
            <RightSidebar />
          </div>
        </div>
      </div>

      <ConnectionOverlay />
    </div>
  );
};

export default EditorPage;

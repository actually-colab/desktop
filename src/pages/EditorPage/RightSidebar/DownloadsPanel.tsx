import React from 'react';
import { useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon } from 'rsuite';

import { spacing } from '../../../constants/theme';
import { ReduxState } from '../../../redux';
import { download } from '../../../utils/notebook';

const styles = StyleSheet.create({});

/**
 * The Downloads panel for the right sidebar
 */
const DownloadsPanel: React.FC = () => {
  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const outputs = useSelector((state: ReduxState) => state.editor.outputs);

  const isDownloadSupported = React.useMemo(() => {
    let isSupported = false;

    try {
      isSupported = !!new Blob();
    } catch (error) {}

    return isSupported;
  }, []);
  const uid = React.useMemo(() => user?.uid ?? '', [user?.uid]);

  const onClickDownload = React.useCallback(() => {
    download(notebook, uid, cells, outputs);
  }, [cells, notebook, outputs, uid]);

  return (
    <div className="markdown-container">
      <p>
        You can export your shared notebook in the <code>.ipynb</code> format. This format can be used in Jupyter
        Notebook, JupyterLab, Google Colab, etc. It also allows you to submit your work as a file if you need to do so
        for a class or for version control. Please note that we export based on the code synced to your screen, so if
        other people make edits that haven't propagated they will not be included. What you see is what you get!
      </p>

      <Button appearance="ghost" block disabled={!isDownloadSupported} onClick={onClickDownload}>
        <Icon icon="download2" style={{ marginRight: spacing.DEFAULT / 2 }} />
        Download Notebook
      </Button>
    </div>
  );
};

export default DownloadsPanel;

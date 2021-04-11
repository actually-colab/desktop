import React from 'react';
import { useSelector } from 'react-redux';
import { Dropdown, Icon } from 'rsuite';

import { spacing } from '../../../constants/theme';
import { ReduxState } from '../../../types/redux';
import { download } from '../../../utils/notebook';

/**
 * The Downloads panel for the right sidebar
 */
const DownloadsPanel: React.FC = () => {
  const notebook = useSelector((state: ReduxState) => state.editor.notebook);
  const cells = useSelector((state: ReduxState) => state.editor.cells);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const outputs = useSelector((state: ReduxState) => state.editor.outputs);
  const outputsMetadata = useSelector((state: ReduxState) => state.editor.outputsMetadata);

  const isDownloadSupported = React.useMemo(() => {
    let isSupported = false;

    try {
      isSupported = !!new Blob();
    } catch (error) {}

    return isSupported;
  }, []);

  const onClickDownload = React.useCallback(
    (type: 'ipynb' | 'py' | 'md') => {
      if (notebook === null) {
        return;
      }

      download(notebook, cells, outputs, outputsMetadata, selectedOutputsUid, type);
    },
    [cells, notebook, outputs, outputsMetadata, selectedOutputsUid]
  );

  return (
    <div className="markdown-container">
      <p>
        You can export your shared notebook in the <code>.ipynb</code> format. This format can be used in Jupyter
        Notebook, JupyterLab, Google Colab, etc. It also allows you to submit your work as a file if you need to do so
        for a class or for version control. Please note that we export based on the code synced to your screen, so if
        other people make edits that haven't propagated they will not be included. What you see is what you get!
      </p>

      <Dropdown
        title="Download"
        menuStyle={{ border: '1px solid #ddd' }}
        icon={<Icon icon="file-download" size="lg" style={{ marginRight: spacing.DEFAULT / 2 }} />}
        disabled={!isDownloadSupported || notebook === null}
        onSelect={onClickDownload}
      >
        <Dropdown.Item eventKey="ipynb">as Notebook (.ipynb)</Dropdown.Item>
        <Dropdown.Item eventKey="py">as Python (.py)</Dropdown.Item>
        <Dropdown.Item eventKey="md">as Markdown (.md)</Dropdown.Item>
      </Dropdown>
    </div>
  );
};

export default DownloadsPanel;

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, IconButton, Input, Modal } from 'rsuite';

import { ReduxState } from '../../../redux';
import { palette, spacing } from '../../../constants/theme';
import { DEFAULT_GATEWAY_URI } from '../../../constants/jupyter';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { StatusIndicator } from '../../../components';
import { openCompanionDownloadsPage } from '../../../utils/redirect';
import { _editor } from '../../../redux/actions';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },
  downloadContainer: {
    marginBottom: spacing.DEFAULT / 2,
  },
  description: {
    marginTop: spacing.DEFAULT / 4,
    marginBottom: spacing.DEFAULT / 4,
    fontSize: 12,
  },
  keyValue: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: spacing.DEFAULT / 2,
  },
  keyText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  valueText: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
});

/**
 * A key value pair component
 */
const KeyValue: React.FC<{ attributeKey: string | React.ReactNode; attributeValue: string | React.ReactNode }> = ({
  attributeKey,
  attributeValue,
}) => {
  return (
    <div className={css(styles.keyValue)}>
      <span className={css(styles.keyText)}>{attributeKey}</span>
      <span className={css(styles.valueText)}>{attributeValue}</span>
    </div>
  );
};

/**
 * The kernel panel of the left sidebar of the editor page
 */
const KernelPanel: React.FC = () => {
  const kernelStatus = useKernelStatus();

  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);

  const [showEditGatewayUri, setShowEditGatewayUri] = React.useState<boolean>(false);
  const [newGatewayUri, setNewGatewayUri] = React.useState<string>('');

  const statusColor = React.useMemo(
    () =>
      kernelStatus === 'Error'
        ? palette.ERROR
        : kernelStatus === 'Busy'
        ? palette.WARNING
        : kernelStatus === 'Idle'
        ? palette.SUCCESS
        : palette.GRAY,
    [kernelStatus]
  );

  const dispatch = useDispatch();
  const dispatchSetKernelGateway = React.useCallback((uri: string) => dispatch(_editor.setKernelGateway(uri)), [
    dispatch,
  ]);

  React.useEffect(() => {
    if (gatewayUri !== '') {
      setShowEditGatewayUri(false);
    }
  }, [gatewayUri]);

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.downloadContainer)}>
        <Button appearance="ghost" block onClick={() => openCompanionDownloadsPage()}>
          <Icon icon="download2" style={{ marginRight: spacing.DEFAULT / 2 }} />
          Download Companion
        </Button>

        <p className={css(styles.description)}>
          Our Kernel Companion manages the kernel process and allows you to run code locally. If we don't support your
          OS,{' '}
          <a
            href="https://github.com/actually-colab/desktop-launcher#the-kernel-gateway"
            target="_blank"
            rel="noreferrer"
          >
            read more here
          </a>
          .
        </p>
      </div>

      <KeyValue
        attributeKey="Gateway URI"
        attributeValue={
          <React.Fragment>
            {gatewayUri}
            <IconButton
              style={{ marginLeft: spacing.DEFAULT / 8 }}
              appearance="subtle"
              size="xs"
              icon={<Icon icon="pencil" style={{ color: palette.PRIMARY }} />}
              onClick={() => {
                setShowEditGatewayUri(true);
                setNewGatewayUri(gatewayUri);
              }}
            />
          </React.Fragment>
        }
      />

      <KeyValue
        attributeKey="Kernel Status"
        attributeValue={
          <React.Fragment>
            <StatusIndicator textPlacement="right" color={statusColor} /> {kernelStatus}
          </React.Fragment>
        }
      />

      <p className={css(styles.description)}>
        We will automatically connect to the Kernel if we discover it at the specified Gateway URI.
      </p>

      <Modal size="xs" show={showEditGatewayUri} onHide={() => setShowEditGatewayUri(false)}>
        <Modal.Header>
          <Modal.Title>Change Gateway URI</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            value={newGatewayUri}
            onChange={(value: string) => setNewGatewayUri(value)}
            placeholder={DEFAULT_GATEWAY_URI}
          />

          <Button appearance="subtle" onClick={() => setNewGatewayUri(DEFAULT_GATEWAY_URI)}>
            <Icon icon="refresh" style={{ marginRight: spacing.DEFAULT / 2 }} />
            Reset
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button appearance="subtle" onClick={() => setShowEditGatewayUri(false)}>
            Cancel
          </Button>
          <Button appearance="primary" onClick={() => dispatchSetKernelGateway(newGatewayUri)}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KernelPanel;

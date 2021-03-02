import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, IconButton, Input, Modal, Popover, Whisper } from 'rsuite';

import { ReduxState } from '../../../redux';
import { palette, spacing, timing } from '../../../constants/theme';
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
    marginBottom: spacing.DEFAULT / 2,
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
  popoverContainer: {
    maxWidth: 400,
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
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);

  const [showEditGatewayUri, setShowEditGatewayUri] = React.useState<boolean>(false);
  const [newGatewayUri, setNewGatewayUri] = React.useState<string>('');

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

      <Whisper
        placement="rightStart"
        trigger="hover"
        delayShow={timing.SHOW_DELAY}
        delayHide={timing.HIDE_DELAY}
        speaker={
          <Popover title="Setting the Gateway URI">
            <div className={css(styles.popoverContainer)}>
              <div className="markdown-container">
                <p className={css(styles.description)}>
                  The Gateway URI is usually the IP of the machine running the Kernel Gateway. This could be a machine
                  using our Kernel Companion or one running it via the terminal. You can even point to an IP of a
                  machine that isn't your own as long as it is accessible.
                </p>
                <p className={css(styles.description)}>
                  If you want to change the Gateway URI, you must first disconnect from a kernel if you have one
                </p>
              </div>
            </div>
          </Popover>
        }
      >
        <div>
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
                  disabled={kernelStatus !== 'Offline'}
                  onClick={() => {
                    setShowEditGatewayUri(true);
                    setNewGatewayUri(gatewayUri);
                  }}
                />
              </React.Fragment>
            }
          />
        </div>
      </Whisper>

      <Whisper
        placement="rightStart"
        trigger="hover"
        delayShow={timing.SHOW_DELAY}
        delayHide={timing.HIDE_DELAY}
        speaker={
          <Popover title="Understanding the status">
            <div className={css(styles.popoverContainer)}>
              <div className="markdown-container">
                <p className={css(styles.description)}>
                  <code>Offline</code> The kernel is not connected so you cannot run your code. We will automatically
                  try connecting to the kernel periodically.
                </p>
                <p className={css(styles.description)}>
                  <code>Connecting</code> We are trying to connect to the kernel.
                </p>
                <p className={css(styles.description)}>
                  <code>Reconnecting</code> The kernel connection was lost and we are trying to reestablish it. If
                  successful, it'll be like nothing happened. If we aren't, you'll need a new connection.
                </p>
                <p className={css(styles.description)}>
                  <code>Busy</code> The kernel is running your code, some jobs take longer to finish than others.
                </p>
                <p className={css(styles.description)}>
                  <code>Idle</code> The kernel is ready for you to use.
                </p>
              </div>
            </div>
          </Popover>
        }
      >
        <div>
          <KeyValue
            attributeKey="Kernel Status"
            attributeValue={
              <React.Fragment>
                <StatusIndicator textPlacement="right" color={kernelStatusColor} />
                {kernelStatus === 'Connecting' ? 'Offline' : kernelStatus}
              </React.Fragment>
            }
          />
        </div>
      </Whisper>

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

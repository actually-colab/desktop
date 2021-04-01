import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, IconButton, Input, Modal, Popover, Timeline, Toggle, Whisper } from 'rsuite';

import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { palette, spacing, timing } from '../../../constants/theme';
import { DEFAULT_GATEWAY_URI } from '../../../constants/jupyter';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { BorderContainer, StatusIndicator } from '../../../components';
import { openCompanionDownloadsPage } from '../../../utils/redirect';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    overflowY: 'hidden',
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
  output: {
    flex: 1,
    marginTop: spacing.DEFAULT / 8,
    paddingBottom: spacing.DEFAULT / 4,
    paddingTop: spacing.DEFAULT / 2,
    paddingLeft: spacing.DEFAULT / 2,
    paddingRight: spacing.DEFAULT / 4,
    borderRadius: 4,
    color: palette.ALMOST_BLACK,
    overflowX: 'auto',
    overflowY: 'auto',
    fontSize: 12,
    lineHeight: '12px',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  bold: {
    fontWeight: 'bold',
    lineHeight: '18px',
  },
  connectionContainer: {
    marginBottom: spacing.DEFAULT / 2,
  },
  autoConnectContainer: {
    marginBottom: spacing.DEFAULT / 2,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  const logsAnchorRef = React.useRef<HTMLDivElement | null>(null);

  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGatewayUri = useSelector((state: ReduxState) => state.editor.isEditingGatewayUri);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const logs = useSelector((state: ReduxState) => state.editor.logs);

  const [newGatewayUri, setNewGatewayUri] = React.useState<string>('');
  const [isLogsPinned, setIsLogsPinned] = React.useState<boolean>(true);

  const kernelActiveIsh = React.useMemo(() => kernelStatus !== 'Offline' && kernelStatus !== 'Connecting', [
    kernelStatus,
  ]);

  const dispatch = useDispatch();
  const dispatchConnectToKernelAuto = React.useCallback(
    (enable: boolean) => dispatch(_editor.connectToKernelAuto(enable)),
    [dispatch]
  );
  const dispatchDisconnectFromKernel = React.useCallback(() => dispatch(_editor.disconnectFromKernel()), [dispatch]);
  const dispatchSetKernelGateway = React.useCallback((uri: string) => dispatch(_editor.setKernelGateway(uri)), [
    dispatch,
  ]);
  const dispatchEditKernelGateway = React.useCallback(
    (editing: boolean) => dispatch(_editor.editKernelGateway(editing)),
    [dispatch]
  );

  /**
   * Auto scroll logs if pinned
   */
  React.useEffect(() => {
    if (isLogsPinned && logs.size > 0) {
      setTimeout(() => logsAnchorRef?.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [isLogsPinned, logs.size]);

  return (
    <div className={css(styles.container)}>
      <div className={css(styles.downloadContainer)}>
        <BorderContainer>
          <Button block onClick={() => openCompanionDownloadsPage()}>
            <Icon icon="download2" style={{ marginRight: spacing.DEFAULT / 2 }} />
            Download Companion
          </Button>
        </BorderContainer>

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
                  icon={
                    <Icon
                      icon="pencil"
                      style={{
                        color: kernelActiveIsh ? palette.GRAY : palette.PRIMARY,
                      }}
                    />
                  }
                  disabled={kernelActiveIsh}
                  onClick={() => {
                    setNewGatewayUri(gatewayUri);
                    dispatchEditKernelGateway(true);
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

      <p className={css(styles.keyText)}>
        Kernel Logs
        <Button appearance="subtle" size="xs" onClick={() => setIsLogsPinned((prevIsLogsPinned) => !prevIsLogsPinned)}>
          <Icon icon="thumb-tack" style={isLogsPinned ? { color: palette.PRIMARY } : undefined} />
        </Button>
      </p>
      <pre className={css(styles.output)}>
        <Timeline className="icon-timeline">
          {logs.map((log) => (
            <Timeline.Item
              dot={
                log.status === 'Success' ? (
                  <Icon icon="check" style={{ background: palette.SUCCESS, color: palette.BASE }} />
                ) : log.status === 'Warning' ? (
                  <Icon icon="exclamation" style={{ background: palette.WARNING, color: palette.BASE }} />
                ) : log.status === 'Error' ? (
                  <Icon icon="close" style={{ background: palette.ERROR, color: palette.BASE }} />
                ) : undefined
              }
            >
              <p className={css(styles.bold)}>{log.dateString}</p>
              <p>{log.message}</p>
            </Timeline.Item>
          ))}
        </Timeline>

        <div ref={logsAnchorRef} />
      </pre>

      <div className={css(styles.connectionContainer)}>
        <div className={css(styles.autoConnectContainer)}>
          <h6>Auto Connect</h6>
          <Toggle
            checked={autoConnectToKernel}
            disabled={kernelActiveIsh}
            onChange={(checked) => dispatchConnectToKernelAuto(checked)}
          />
        </div>

        <Button block disabled={!kernelActiveIsh} onClick={dispatchDisconnectFromKernel}>
          <Icon icon="ban" style={{ marginRight: spacing.DEFAULT / 2 }} />
          Disconnect
        </Button>
      </div>

      <Modal size="xs" show={isEditingGatewayUri} onHide={() => dispatchEditKernelGateway(false)}>
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
          <Button appearance="subtle" onClick={() => dispatchEditKernelGateway(false)}>
            Cancel
          </Button>
          <Button
            appearance="primary"
            disabled={kernelActiveIsh || newGatewayUri === gatewayUri}
            onClick={() => {
              dispatchSetKernelGateway(newGatewayUri);
              dispatchEditKernelGateway(false);
            }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default KernelPanel;

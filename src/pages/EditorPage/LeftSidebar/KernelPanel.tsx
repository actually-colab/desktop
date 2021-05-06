import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, InputPicker, Popover, Timeline, Toggle, Whisper } from 'rsuite';

import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { palette, spacing, timing } from '../../../constants/theme';
import { DEFAULT_GATEWAY_URI } from '../../../constants/jupyter';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { BorderContainer, StatusIndicator } from '../../../components';
import { openCompanionDownloadsPage } from '../../../utils/redirect';
import { RecentKernelGatewaysStorage } from '../../../utils/storage';

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
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginBottom: spacing.DEFAULT / 2,
  },
  keyText: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: 10,
  },
  valueText: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  popoverContainer: {
    maxWidth: 400,
  },
  inputPicker: {
    width: '100%',
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
    display: 'flex',
    flexDirection: 'column-reverse',
  },
  outputScrollContainer: {},
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
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const autoConnectToKernel = useSelector((state: ReduxState) => state.editor.autoConnectToKernel);
  const isEditingGateway = useSelector((state: ReduxState) => state.editor.isEditingGateway);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);
  const logs = useSelector((state: ReduxState) => state.editor.logs);

  const [newGatewayUri, setNewGatewayUri] = React.useState<string>('');
  const [recentGatewayUris, setRecentGatewayUris] = React.useState<string[]>(RecentKernelGatewaysStorage.values());

  const kernelActiveIsh = React.useMemo(() => kernelStatus !== 'Offline' && kernelStatus !== 'Connecting', [
    kernelStatus,
  ]);
  const gatewayOptions = React.useMemo(
    () =>
      recentGatewayUris
        .slice()
        .reverse()
        .map((item) => ({
          value: item,
          label: item,
        })),
    [recentGatewayUris]
  );

  const dispatch = useDispatch();
  const dispatchConnectToKernelAuto = React.useCallback(
    (enable: boolean) => dispatch(_editor.connectToKernelAuto(enable)),
    [dispatch]
  );
  const dispatchDisconnectFromKernel = React.useCallback(() => dispatch(_editor.disconnectFromKernel()), [dispatch]);
  const dispatchSetKernelGatewayUri = React.useCallback((uri: string) => dispatch(_editor.setKernelGateway({ uri })), [
    dispatch,
  ]);
  const dispatchSetKernelGatewayToken = React.useCallback(
    (token: string) => dispatch(_editor.setKernelGateway({ token })),
    [dispatch]
  );
  const dispatchEditKernelGateway = React.useCallback(
    (editing: boolean) => dispatch(_editor.editKernelGateway(editing)),
    [dispatch]
  );

  const onOpenGateway = React.useCallback(() => dispatchEditKernelGateway(true), [dispatchEditKernelGateway]);
  const onCloseGateway = React.useCallback(() => dispatchEditKernelGateway(false), [dispatchEditKernelGateway]);
  const onSelectGateway = React.useCallback(
    (value: string) => {
      if (value) {
        dispatchSetKernelGatewayUri(value);
        setRecentGatewayUris(RecentKernelGatewaysStorage.add(value));
      }

      dispatchEditKernelGateway(false);
    },
    [dispatchEditKernelGateway, dispatchSetKernelGatewayUri]
  );
  const onResetGateway = React.useCallback(() => {
    setRecentGatewayUris(RecentKernelGatewaysStorage.reset());
    setNewGatewayUri(DEFAULT_GATEWAY_URI);
    dispatchSetKernelGatewayUri(DEFAULT_GATEWAY_URI);
  }, [dispatchSetKernelGatewayUri]);

  React.useEffect(() => {
    if (!isEditingGateway) {
      setNewGatewayUri(gatewayUri);
    }
  }, [gatewayUri, isEditingGateway]);

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
            href="https://github.com/actually-colab/desktop-launcher#starting-the-kernel-manually"
            target="_blank"
            rel="noreferrer"
          >
            read more here
          </a>
          .
        </p>
      </div>

      <KeyValue
        attributeKey="Kernel URI"
        attributeValue={
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
                      The Gateway URI is usually the IP of the machine running the Jupyter Kernel. This could be a
                      machine using our Kernel Companion or one running it via the terminal. You can even point to an IP
                      of a machine that isn't your own as long as it is accessible from your network.
                    </p>
                    <p className={css(styles.description)}>
                      If you want to change the Kernel URI, you must first disconnect from a kernel if you have one.
                    </p>
                  </div>
                </div>
              </Popover>
            }
          >
            <InputPicker
              className={css(styles.inputPicker)}
              creatable
              cleanable={false}
              disabled={kernelActiveIsh}
              value={newGatewayUri}
              data={gatewayOptions}
              onOpen={onOpenGateway}
              onClose={onCloseGateway}
              onChange={(value: string) => setNewGatewayUri(value)}
              onSelect={onSelectGateway}
              renderExtraFooter={() => (
                <Button appearance="subtle" block onClick={onResetGateway}>
                  Reset options
                </Button>
              )}
            />
          </Whisper>
        }
      />

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

      <p className={css(styles.keyText)}>Kernel Logs</p>
      <pre className={css(styles.output)}>
        <div className={css(styles.outputScrollContainer)}>
          <Timeline className="icon-timeline">
            {logs.map((log) => (
              <Timeline.Item
                key={log.id}
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
        </div>
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
    </div>
  );
};

export default KernelPanel;

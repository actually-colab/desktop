import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Icon, Input, InputPicker, Popover, Toggle, Whisper } from 'rsuite';

import { ReduxState } from '../../../../types/redux';
import { _editor } from '../../../../redux/actions';
import { palette, spacing, timing } from '../../../../constants/theme';
import { DEFAULT_GATEWAY_URI } from '../../../../constants/jupyter';
import { openCompanionDownloadsPage } from '../../../../utils/redirect';
import { RecentKernelGatewaysStorage } from '../../../../utils/storage';
import useKernelStatus from '../../../../kernel/useKernelStatus';
import { BorderContainer, StatusIndicator } from '../../../../components';
import KernelLogs from './KernelLogs';

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
  requiredText: {
    marginLeft: spacing.DEFAULT / 2,
    color: palette.ERROR,
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
  const gatewayToken = useSelector((state: ReduxState) => state.editor.gatewayToken);

  const [newGatewayUri, setNewGatewayUri] = React.useState<string>('');
  const [recentGatewayUris, setRecentGatewayUris] = React.useState<string[]>(RecentKernelGatewaysStorage.values());
  const [newGatewayToken, setNewGatewayToken] = React.useState<string>('');
  const [showGatewayToken, setShowGatewayToken] = React.useState<boolean>(false);

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
  const gatewayTokenPlaceholder = React.useMemo(() => gatewayToken.replace(/./g, '•'), [gatewayToken]);

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
  const onFocusToken = React.useCallback(() => {
    setShowGatewayToken(true);
    dispatchEditKernelGateway(true);
  }, [dispatchEditKernelGateway]);
  const onBlurToken = React.useCallback(() => {
    dispatchSetKernelGatewayToken(newGatewayToken);
    dispatchEditKernelGateway(false);
    setShowGatewayToken(false);
  }, [dispatchEditKernelGateway, dispatchSetKernelGatewayToken, newGatewayToken]);

  /**
   * Update gateway uri state
   */
  React.useEffect(() => {
    if (!isEditingGateway) {
      setNewGatewayUri(gatewayUri);
    }
  }, [gatewayUri, isEditingGateway]);

  /**
   * Update gateway token state
   */
  React.useEffect(() => {
    if (!isEditingGateway) {
      setNewGatewayToken(gatewayToken);
    }
  }, [gatewayToken, isEditingGateway]);

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
              <Popover title="Setting the Kernel URI">
                <div className={css(styles.popoverContainer)}>
                  <div className="markdown-container">
                    <p className={css(styles.description)}>
                      The Kernel URI is usually port 8888 on the IP of the machine running the Jupyter Kernel. This
                      could be a machine using our Kernel Companion or one running it via the terminal. You can even
                      point to an IP of a machine that isn't your own as long as it is accessible from your computer.
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

      <KeyValue
        attributeKey={
          <React.Fragment>
            Kernel Token <span className={css(styles.requiredText)}>Required</span>
          </React.Fragment>
        }
        attributeValue={
          <Whisper
            placement="rightStart"
            trigger="hover"
            delayShow={timing.SHOW_DELAY}
            delayHide={timing.HIDE_DELAY}
            speaker={
              <Popover title="Securing the Kernel">
                <div className={css(styles.popoverContainer)}>
                  <div className="markdown-container">
                    <p className={css(styles.description)}>
                      The Kernel Token helps ensure that would-be intruders can't execute code on your machine. The
                      randomly generated token can be found displayed by the Kernel Companion. Copy the token from the
                      companion into this field to securely access the Jupyter Kernel.
                    </p>
                    <p className={css(styles.description)}>
                      If you aren't using the Kernel Companion, type the token that your manually started kernel process
                      is using.
                    </p>
                  </div>
                </div>
              </Popover>
            }
          >
            <Input
              className={css(styles.inputPicker)}
              placeholder="required"
              disabled={kernelActiveIsh}
              value={showGatewayToken ? newGatewayToken : gatewayTokenPlaceholder}
              onFocus={onFocusToken}
              onBlur={onBlurToken}
              onChange={(value: string) => setNewGatewayToken(value)}
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

      <KernelLogs />

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

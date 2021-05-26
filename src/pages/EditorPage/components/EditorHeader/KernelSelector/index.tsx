import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Button, Dropdown, HelpBlock, Icon, Modal, Popover, Whisper } from 'rsuite';
import { WhisperInstance } from 'rsuite/lib/Whisper';
import { DUser } from '@actually-colab/editor-types';

import { palette, spacing } from '../../../../../constants/theme';
import { ReduxState } from '../../../../../types/redux';
import { _editor } from '../../../../../redux/actions';
import { sortUsersByName } from '../../../../../utils/notebook';
import { COMPANION_DOWNLOADS_URI } from '../../../../../utils/redirect';
import { ImmutableNotebookAccessLevel, ImmutableUser } from '../../../../../immutable';
import useKernelStatus from '../../../../../kernel/useKernelStatus';
import { StatusIndicator, UserAvatar } from '../../../../../components';
import KernelConnector from './KernelConnector';
import KernelStatus from './KernelStatus';
import KernelLogs from './KernelLogs';

const styles = StyleSheet.create({
  buttonContentContainer: {
    display: 'inline-block',
    width: '100%',
  },
  buttonContent: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownIcon: {
    marginLeft: spacing.DEFAULT / 2,
  },
  helperContent: {
    ...spacing.pad({
      top: spacing.DEFAULT / 2,
    }),
    width: '100%',
  },
  helperTitleWithButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kernelIconContainer: {
    position: 'relative',
    marginRight: spacing.DEFAULT / 2,
  },
  kernelContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  kernelIcon: {
    width: 30,
    height: 30,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kernelTextContainer: {
    marginLeft: spacing.DEFAULT,
    display: 'flex',
    flexDirection: 'column',
  },
  kernelTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  kernelSubtitle: {
    fontSize: 11,
    fontWeight: 'normal',
    display: 'flex',
    flexDirection: 'row',
  },
});

/**
 * The main content of the kernel selector popover
 */
const KernelSelectorPanel: React.FC<{ closeWhisper(): void; showKernelConfig(show: boolean): void }> = ({
  closeWhisper,
  showKernelConfig,
}) => {
  const { kernelStatus, kernelStatusColor } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const users = useSelector((state: ReduxState) => state.editor.users);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const gatewayUri = useSelector((state: ReduxState) => state.editor.gatewayUri);

  const activeUsers = React.useMemo(() => users.filter((_user) => _user.uid !== user?.uid).sort(sortUsersByName), [
    user?.uid,
    users,
  ]);
  const inactiveUsers = React.useMemo(
    () =>
      notebookUsers
        ?.filter(
          (_user) => _user.uid !== user?.uid && users.findIndex((activeUser) => activeUser.uid === _user.uid) === -1
        )
        .sort(sortUsersByName),
    [notebookUsers, user?.uid, users]
  );

  const dispatch = useDispatch();
  const dispatchSelectOutputUser = React.useCallback((uid: DUser['uid']) => dispatch(_editor.selectOutputUser(uid)), [
    dispatch,
  ]);

  const handleKernelSelect = React.useCallback(
    (eventKey: string) => {
      closeWhisper();
      dispatchSelectOutputUser(eventKey);
    },
    [closeWhisper, dispatchSelectOutputUser]
  );

  const onClickConfigure = React.useCallback(() => {
    closeWhisper();
    showKernelConfig(true);
  }, [closeWhisper, showKernelConfig]);

  const renderUser = React.useCallback(
    (active: boolean) => (_user: ImmutableUser | ImmutableNotebookAccessLevel) => (
      <Dropdown.Item key={_user.uid} eventKey={_user.uid} disabled={kernelStatus === 'Busy'}>
        <div className={css(styles.kernelContent)}>
          <UserAvatar user={_user} hover={false} />

          <div className={css(styles.kernelTextContainer)}>
            <span className={css(styles.kernelTitle)}>{_user.name}</span>
            <span className={css(styles.kernelSubtitle)}>
              <StatusIndicator color={active ? palette.SUCCESS : palette.GRAY} textPlacement="right" /> View Only
            </span>
          </div>
        </div>
      </Dropdown.Item>
    ),
    [kernelStatus]
  );

  return (
    <React.Fragment>
      <Dropdown.Menu
        style={{
          width: 316,
          maxHeight: 400,
          overflowY: 'auto',
        }}
        activeKey={selectedOutputsUid}
        onSelect={handleKernelSelect}
      >
        <div className={css(styles.helperContent)}>
          <div className={css(styles.helperTitleWithButton)}>
            <h6>Connect to a kernel</h6>
            <Button appearance="primary" size="xs" onClick={onClickConfigure}>
              <Icon icon="cog" />
              &nbsp;&nbsp;Configure
            </Button>
          </div>

          <HelpBlock>
            Our&nbsp;
            <a href={COMPANION_DOWNLOADS_URI} target="_blank" rel="noreferrer">
              Companion app
            </a>
            &nbsp;manages the Jupyter Kernel automatically, so you can run code locally quickly and securely.
          </HelpBlock>
        </div>

        <Dropdown.Item eventKey="" disabled={kernelStatus === 'Busy'}>
          <div className={css(styles.kernelContent)}>
            <Icon className={css(styles.kernelIcon)} icon="related-map" size="2x" />

            <div className={css(styles.kernelTextContainer)}>
              <span className={css(styles.kernelTitle)}>Configured Kernel</span>
              <span className={css(styles.kernelSubtitle)}>
                <StatusIndicator color={kernelStatusColor} textPlacement="right" />
                {kernelStatus !== 'Offline' ? gatewayUri : 'Not Connected'}
              </span>
            </div>
          </div>
        </Dropdown.Item>

        <div className={css(styles.helperContent)} style={{ marginTop: spacing.DEFAULT / 2 }}>
          <h6>Connect to a collaborator</h6>

          <HelpBlock>
            You can view the outputs from any active collaborator. You can only run cells when your configured kernel is
            selected.
          </HelpBlock>
        </div>

        {(notebookUsers?.size ?? 0) <= 1 && (
          <div className={css(styles.helperContent)}>
            <HelpBlock>Share the notebook to add collaborators</HelpBlock>
          </div>
        )}

        {activeUsers.map(renderUser(true))}
        {inactiveUsers?.map(renderUser(false))}
      </Dropdown.Menu>
    </React.Fragment>
  );
};

/**
 * Content of the kernel selector button
 */
const KernelSelectorButton: React.FC = () => {
  const { kernelStatusColor } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const notebookUsers = useSelector((state: ReduxState) => state.editor.notebook?.users);
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);

  const selectedOutputsName = React.useMemo<DUser['uid']>(
    () =>
      (selectedOutputsUid === ''
        ? user?.name
        : notebookUsers?.find((_user) => _user.uid === selectedOutputsUid)?.name) ?? '',
    [notebookUsers, selectedOutputsUid, user?.name]
  );

  return (
    <div className={css(styles.buttonContentContainer)}>
      <div className={css(styles.buttonContent)}>
        <div className={css(styles.kernelIconContainer)}>
          {selectedOutputsUid === '' ? <StatusIndicator color={kernelStatusColor} /> : <Icon icon="eye" />}
        </div>

        {selectedOutputsUid === '' ? 'Configured Kernel' : selectedOutputsName}

        <div className={css(styles.dropdownIcon)}>
          <Icon icon="arrow-down-line" />
        </div>
      </div>
    </div>
  );
};

/**
 * Component allowing user to select which users' kernel to view outputs from
 */
const KernelSelector: React.FC = () => {
  const whisperRef = React.useRef<WhisperInstance | null>(null);

  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);

  const [showingKernelConfig, setShowingKernelConfig] = React.useState<boolean>(false);

  const closeWhisper = React.useCallback(() => {
    whisperRef.current?.close();
  }, []);

  const showKernelConfig = React.useCallback((show: boolean) => {
    setShowingKernelConfig(show);
  }, []);

  const onHideKernelConfig = React.useCallback(() => showKernelConfig(false), [showKernelConfig]);

  return (
    <React.Fragment>
      <Whisper
        ref={whisperRef}
        trigger="click"
        placement="bottomEnd"
        speaker={
          <Popover full style={{ border: '1px solid #ddd' }}>
            <KernelSelectorPanel closeWhisper={closeWhisper} showKernelConfig={showKernelConfig} />
          </Popover>
        }
      >
        <Button
          size="sm"
          appearance={selectedOutputsUid === '' ? 'default' : 'ghost'}
          style={{ alignSelf: 'flex-start' }}
        >
          <KernelSelectorButton />
        </Button>
      </Whisper>

      <Modal show={showingKernelConfig} size="xs" onHide={onHideKernelConfig}>
        <KernelConnector />
        <KernelStatus />
        <KernelLogs />

        <Modal.Footer>
          <Button onClick={onHideKernelConfig} appearance="primary">
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default KernelSelector;

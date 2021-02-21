import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Divider, Dropdown } from 'rsuite';

import { palette, spacing } from '../../../constants/theme';
import { ReduxState } from '../../../redux';
import useKernelStatus from '../../../kernel/useKernelStatus';
import { ColoredIconButton, Header, PopoverDropdown, StatusIndicator, UserAvatar } from '../../../components';
import { StatusIndicatorProps } from '../../../components/StatusIndicator';
import { _editor } from '../../../redux/actions';

const styles = StyleSheet.create({
  header: {
    paddingLeft: 263,
    paddingRight: 4,
    display: 'flex',
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerNoDrag: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '-webkit-app-region': 'no-drag',
  },
  avatarsContainer: {},
  avatar: {
    marginRight: spacing.DEFAULT / 2,
  },
});

/**
 * The header for the editor page
 */
const EditorHeader: React.FC = () => {
  const localKernelStatus = useKernelStatus();

  const connectToKernelErrorMessage = useSelector((state: ReduxState) => state.editor.connectToKernelErrorMessage);
  const isAddingCell = useSelector((state: ReduxState) => state.editor.isAddingCell);
  const isDeletingCell = useSelector((state: ReduxState) => state.editor.isDeletingCell);
  const isEditingCell = useSelector((state: ReduxState) => state.editor.isEditingCell);
  const isExecutingCode = useSelector((state: ReduxState) => state.editor.isExecutingCode);
  const lockedCellId = useSelector((state: ReduxState) => state.editor.lockedCellId);

  const [tempKernelSelection, setTempKernelSelection] = React.useState<string>('localhost');

  const kernelStatus = React.useMemo(() => (tempKernelSelection === 'localhost' ? localKernelStatus : 'Offline'), [
    localKernelStatus,
    tempKernelSelection,
  ]);

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

  const statusTooltip = React.useMemo<StatusIndicatorProps['tooltipOptions']>(
    () => ({
      placement: 'bottomEnd',
      text: kernelStatus === 'Error' ? `Error: ${connectToKernelErrorMessage}` : kernelStatus,
    }),
    [connectToKernelErrorMessage, kernelStatus]
  );

  const isStable = React.useMemo(() => !(isAddingCell || isDeletingCell || isEditingCell || isExecutingCode), [
    isAddingCell,
    isDeletingCell,
    isEditingCell,
    isExecutingCode,
  ]);

  const dispatch = useDispatch();
  const dispatchAddCell = React.useCallback((index: number) => dispatch(_editor.addCell(index)), [dispatch]);
  const dispatchDeleteCell = React.useCallback(() => dispatch(_editor.deleteCell(lockedCellId)), [
    dispatch,
    lockedCellId,
  ]);

  const handleKernelSelect = React.useCallback((eventKey: string) => {
    setTempKernelSelection(eventKey);
  }, []);

  return (
    <Header>
      <div className={css(styles.header)}>
        <div className={css(styles.headerNoDrag)}>
          <ColoredIconButton
            icon="step-forward"
            tooltipText="Run the next cell"
            tooltipDirection="bottom"
            loading={isExecutingCode}
            disabled={!isStable}
            onClick={() => console.log('TODO')}
          />
          <ColoredIconButton
            icon="stop"
            tooltipText="Interrupt the kernel"
            tooltipDirection="bottom"
            onClick={() => console.log('TODO')}
          />

          <Divider vertical />

          <ColoredIconButton
            icon="plus"
            tooltipText="Create a new cell"
            tooltipDirection="bottom"
            loading={isAddingCell}
            disabled={!isStable}
            onClick={() => dispatchAddCell(-1)}
          />
          <ColoredIconButton
            icon="trash2"
            tooltipText="Delete the current cell"
            tooltipDirection="bottom"
            loading={isDeletingCell}
            disabled={!isStable || lockedCellId === ''}
            onClick={dispatchDeleteCell}
          />
        </div>

        <div className={css(styles.headerNoDrag)}>
          <div className={css(styles.avatarsContainer)}>
            <div className={css(styles.avatar)}>
              <UserAvatar
                placement="bottomEnd"
                user={{
                  uid: 1, // TODO
                  name: 'Bailey Tincher',
                  email: 'bailey@test.com',
                }}
                statusColor={palette.SUCCESS}
              />
            </div>
          </div>

          <PopoverDropdown
            placement="bottomEnd"
            activeKey={tempKernelSelection}
            buttonContent={
              <React.Fragment>
                {tempKernelSelection !== '' && (
                  <StatusIndicator textPlacement="right" color={statusColor} tooltipOptions={statusTooltip} />
                )}

                {tempKernelSelection}
              </React.Fragment>
            }
            onSelect={handleKernelSelect}
          >
            <Dropdown.Item eventKey="localhost">localhost</Dropdown.Item>
          </PopoverDropdown>
        </div>
      </div>
    </Header>
  );
};

export default EditorHeader;

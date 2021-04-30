import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import { StyleSheet, css } from 'aphrodite';
import { Icon } from 'rsuite';

import { ReduxState } from '../../types/redux';
import { ImmutableEditorCell } from '../../immutable';
import { palette } from '../../constants/theme';
import useKernelStatus from '../../kernel/useKernelStatus';
import ColoredIconButton from '../ColoredIconButton';
import IconTextButton from '../IconTextButton';
import Timer from '../Timer';

const styles = StyleSheet.create({
  cellToolbar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cellToolbarStart: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  cellToolbarEnd: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  lockOwnerContainer: {
    paddingLeft: 8,
    color: palette.GRAY,
  },
  lockOwnerText: {
    marginLeft: 4,
    fontSize: 12,
  },
});

/**
 * The toolbar rendered under a code cell
 */
const CellToolbar: React.FC<{
  cell: ImmutableEditorCell;
  lockOwner: {
    uid: string | null;
    name: string;
  } | null;
  ownsCell: boolean;
  isRunning: boolean;
  canEdit: boolean;
  canLock: boolean;
  onClickLock(): void;
  onClickUnlock(): void;
  onClickPlay(): void;
}> = ({ cell, lockOwner, ownsCell, isRunning, canEdit, canLock, onClickLock, onClickUnlock, onClickPlay }) => {
  const { kernelIsConnected } = useKernelStatus();

  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const isLocking = useSelector((state: ReduxState) => state.editor.lockingCellId === cell.cell_id, shallowEqual);
  const isUnlocking = useSelector((state: ReduxState) => state.editor.unlockingCellId === cell.cell_id, shallowEqual);

  return (
    <div className={css(styles.cellToolbar)}>
      <div className={css(styles.cellToolbarStart)}>
        <ColoredIconButton
          icon="play"
          color={palette.SUCCESS}
          size="xs"
          loading={isRunning}
          disabled={
            ((!kernelIsConnected || selectedOutputsUid !== '') && cell.language === 'python') ||
            (cell.language === 'markdown' && cell.rendered)
          }
          onClick={onClickPlay}
        />

        {ownsCell ? (
          <IconTextButton
            icon="unlock-alt"
            text={isUnlocking ? 'Unlocking...' : 'Unlock'}
            bgColor="transparent"
            tooltipText="Allow others to edit"
            tooltipDirection="bottom"
            color={palette.PRIMARY}
            disabled={!canEdit || isUnlocking}
            onClick={onClickUnlock}
          />
        ) : lockOwner !== null ? (
          <div className={css(styles.lockOwnerContainer)}>
            <Icon icon="pencil" />
            <span className={css(styles.lockOwnerText)}>{lockOwner.name}</span>
          </div>
        ) : (
          <IconTextButton
            icon="lock"
            text={isLocking ? 'Locking...' : 'Lock'}
            bgColor="transparent"
            tooltipText="Lock for editing"
            tooltipDirection="bottom"
            color={palette.GRAY}
            disabled={!canEdit || !canLock || isLocking}
            onClick={onClickLock}
          />
        )}
      </div>

      <div className={css(styles.cellToolbarEnd)}>
        <Timer active={isRunning} alwaysRender={cell.runIndex !== -1} nonce={cell.runIndex} />
      </div>
    </div>
  );
};

export default CellToolbar;

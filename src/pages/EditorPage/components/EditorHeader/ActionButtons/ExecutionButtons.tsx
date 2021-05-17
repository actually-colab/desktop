import * as React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';

import { ReduxState } from '../../../../../types/redux';
import { _editor } from '../../../../../redux/actions';
import useKernelStatus from '../../../../../kernel/useKernelStatus';
import { RegularIconButton } from '../../../../../components';

/**
 * Header buttons to control kernel execution
 */
const ExecutionButtons: React.FC = () => {
  const { kernelIsConnected } = useKernelStatus();

  const user = useSelector((state: ReduxState) => state.auth.user);
  const cell_ids = useSelector((state: ReduxState) => state.editor.notebook?.cell_ids);
  const lockedCellId = useSelector(
    (state: ReduxState) => state.editor.lockedCells.find((lock) => lock.uid === user?.uid)?.cell_id ?? '',
    shallowEqual
  );
  const selectedOutputsUid = useSelector((state: ReduxState) => state.editor.selectedOutputsUid);
  const selectedCellId = useSelector((state: ReduxState) => state.editor.selectedCellId);

  const selectedCellProperties = useSelector((state: ReduxState) => {
    const cell =
      state.editor.cells.get(selectedCellId) ??
      (cell_ids ? (cell_ids.size > 0 ? state.editor.cells.get(cell_ids.get(0) ?? '') ?? null : null) : null);

    if (!cell) {
      return cell;
    }

    return {
      language: cell?.language,
      rendered: cell?.rendered,
    };
  }, shallowEqual);

  const dispatch = useDispatch();
  const onClickPlayNext = React.useCallback(() => {
    if (!selectedCellProperties) {
      return;
    }

    if (selectedCellProperties.language === 'python') {
      dispatch(_editor.addCellToQueue(selectedCellId));
    } else {
      if (!selectedCellProperties.rendered) {
        dispatch(
          _editor.editCell(selectedCellId, {
            metaChanges: {
              rendered: true,
            },
          })
        );
      }
    }

    dispatch(_editor.selectNextCell());
  }, [dispatch, selectedCellId, selectedCellProperties]);
  const dispatchStopCodeExecution = React.useCallback(
    () => lockedCellId !== '' && dispatch(_editor.stopCodeExecution(lockedCellId)),
    [dispatch, lockedCellId]
  );

  return (
    <React.Fragment>
      <RegularIconButton
        size="sm"
        icon="step-forward"
        tooltipText="Run and advance"
        tooltipDirection="bottom"
        disabled={(!kernelIsConnected || selectedOutputsUid !== '') && selectedCellProperties?.language === 'python'}
        onClick={onClickPlayNext}
      />
      <RegularIconButton
        size="sm"
        icon="stop"
        tooltipText="Interrupt the kernel"
        tooltipDirection="bottom"
        disabled={!kernelIsConnected || selectedOutputsUid !== ''}
        onClick={dispatchStopCodeExecution}
      />
    </React.Fragment>
  );
};

export default ExecutionButtons;

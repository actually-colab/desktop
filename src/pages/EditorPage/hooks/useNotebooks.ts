import * as React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { isOlderThan } from '../../../utils/date';

/**
 * Hook to keep track and fetch notebooks
 */
const useNotebooks = (): null => {
  const isAuthenticated = useSelector((state: ReduxState) => state.auth.isAuthenticated);
  const clientConnectionStatus = useSelector((state: ReduxState) => state.editor.clientConnectionStatus);
  const isGettingNotebooks = useSelector((state: ReduxState) => state.editor.isGettingNotebooks);
  const getNotebooksErrorMessage = useSelector((state: ReduxState) => state.editor.getNotebooksErrorMessage);
  const getNotebooksTimestamp = useSelector((state: ReduxState) => state.editor.getNotebooksTimestamp);
  const isGettingWorkshops = useSelector((state: ReduxState) => state.editor.isGettingWorkshops);
  const getWorkshopsErrorMessage = useSelector((state: ReduxState) => state.editor.getWorkshopsErrorMessage);
  const getWorkshopsTimestamp = useSelector((state: ReduxState) => state.editor.getWorkshopsTimestamp);

  const dispatch = useDispatch();

  /**
   * Get the latest notebooks
   */
  React.useEffect(() => {
    if (
      isAuthenticated &&
      clientConnectionStatus === 'Connected' &&
      !isGettingNotebooks &&
      getNotebooksErrorMessage === '' &&
      isOlderThan(getNotebooksTimestamp, { minutes: 5 })
    ) {
      dispatch(_editor.getNotebooks());
    }
  }, [
    clientConnectionStatus,
    dispatch,
    getNotebooksErrorMessage,
    getNotebooksTimestamp,
    isAuthenticated,
    isGettingNotebooks,
  ]);

  /**
   * Get the lateste workshops
   */
  React.useEffect(() => {
    if (
      isAuthenticated &&
      clientConnectionStatus === 'Connected' &&
      !isGettingWorkshops &&
      getWorkshopsErrorMessage === '' &&
      isOlderThan(getWorkshopsTimestamp, { minutes: 5 })
    ) {
      dispatch(_editor.getWorkshops());
    }
  }, [
    clientConnectionStatus,
    dispatch,
    getWorkshopsErrorMessage,
    getWorkshopsTimestamp,
    isAuthenticated,
    isGettingWorkshops,
  ]);

  return null;
};

export default useNotebooks;

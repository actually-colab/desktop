import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ReduxState } from '../../../types/redux';
import { _editor } from '../../../redux/actions';
import { isOlderThan } from '../../../utils/date';

/**
 * Hook to keep track and fetch notebooks
 */
const useNotebooks = (): null => {
  const isAuthenticated = useSelector((state: ReduxState) => state.auth.isAuthenticated);
  const isGettingNotebooks = useSelector((state: ReduxState) => state.editor.isGettingNotebooks);
  const getNotebooksErrorMessage = useSelector((state: ReduxState) => state.editor.getNotebooksErrorMessage);
  const getNotebooksTimestamp = useSelector((state: ReduxState) => state.editor.getNotebooksTimestamp);

  const dispatch = useDispatch();

  /**
   * Get the latest notebooks
   */
  React.useEffect(() => {
    if (
      isAuthenticated &&
      !isGettingNotebooks &&
      getNotebooksErrorMessage === '' &&
      isOlderThan(getNotebooksTimestamp, { minutes: 5 })
    ) {
      dispatch(_editor.getNotebooks());
    }
  }, [dispatch, getNotebooksErrorMessage, getNotebooksTimestamp, isAuthenticated, isGettingNotebooks]);

  return null;
};

export default useNotebooks;

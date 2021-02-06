import React from 'react';
import debounce from 'lodash.debounce';

/**
 * Hook to create a debounced callback
 */
const useDebounce = <F extends (...args: any[]) => void>(callback: F, delay: number) => {
  /* eslint-disable react-hooks/exhaustive-deps */
  const debouncedCallback = React.useCallback(
    debounce((...args: Parameters<F>) => callback(...args), delay),
    [callback, delay]
  );
  /* eslint-enable react-hooks/exhaustive-deps */

  return debouncedCallback;
};

export default useDebounce;

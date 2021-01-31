import React from 'react';
import { IKernel } from 'jupyter-js-services';
import { connectToKernel } from './jupyter';

/**
 * Hook to connect to a kernel
 */
const useKernel = () => {
  const [kernel, setKernel] = React.useState<IKernel | null>(null);

  const connect = React.useCallback(async () => {
    const res = await connectToKernel();

    if (res.success) {
      setKernel(res.kernel);
    }
  }, []);

  React.useEffect(() => {
    if (kernel === null) {
      connect();
    }
  }, [connect, kernel]);

  return kernel;
};

export default useKernel;

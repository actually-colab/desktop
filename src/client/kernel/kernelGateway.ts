import { promiseExec } from '../../shared/system/process';

/**
 * Install the kernel gateway using pip
 */
export const installKernelGateway = async () => {
  const { stdout, stderr } = await promiseExec('python3 -m pip install jupyter_kernel_gateway');

  if (stderr) {
    console.error(stderr);
    return {
      success: false,
      error: stderr,
    };
  }

  console.log(stdout);
  return {
    success: true,
  };
};

/**
 * Start the kernel gateway with CORS allowing cross-origin requests
 */
export const startKernelGateway = async () => {
  const { stdout, stderr } = await promiseExec('jupyter kernelgateway');

  if (stderr) {
    console.error(stderr);
    return {
      success: false,
      error: stderr,
    };
  }

  console.log(stdout);
  return {
    success: true,
  };
};

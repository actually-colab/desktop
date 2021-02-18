import { exec } from 'child_process';
import util from 'util';

const execWithPromise = util.promisify(exec);

/**
 * Install the kernel gateway using pip
 */
export const installKernelGateway = async () => {
  const { stdout, stderr } = await execWithPromise('python3 -m pip install jupyter_kernel_gateway');

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
  const { stdout, stderr } = await execWithPromise('jupyter kernelgateway');

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

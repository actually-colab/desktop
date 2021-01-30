import { exec } from 'child_process';
import util from 'util';

const execWithPromise = util.promisify(exec);

export const installKernelGateway = async () => {
  const { stdout, stderr } = await execWithPromise(
    'python3 -m pip install jupyter_kernel_gateway'
  );

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

import { IKernel, Kernel as JupyterKernel } from 'jupyter-js-services';

import { GATEWAY_BASE_URI } from '../constants/jupyter';
import { httpToWebSocket } from '../utils/request';

const GATEWAY_STEM = `${GATEWAY_BASE_URI}:`;

/**
 * Get the gateway URI from the kernel message
 */
export const extractGatewayUri = (message: string): string => {
  const index = message.indexOf(GATEWAY_STEM);

  if (index >= 0) {
    return message.substring(index).trim();
  }

  return '';
};

/**
 * Connect to the kernel with the given URI
 */
export const connectToKernel = async (
  uri: string
): Promise<
  | {
      success: true;
      kernel: IKernel;
    }
  | {
      success: false;
      error: {
        message: string;
      };
    }
> => {
  let kernelSpecs: JupyterKernel.ISpecModels | undefined;

  try {
    kernelSpecs = await JupyterKernel.getSpecs({
      baseUrl: uri,
    });
  } catch (error) {
    console.log('Error fetching kernel specs');
    console.error(error);

    return {
      success: false,
      error: {
        message: error?.xhr?.statusText?.message ?? error.message ?? `Could not connect to gateway ${uri}`,
      },
    };
  }

  console.log('Available kernelspecs', kernelSpecs);

  try {
    const kernel = await JupyterKernel.startNew({
      baseUrl: uri,
      wsUrl: httpToWebSocket(uri),
      name: 'python3',
    });

    console.log('Kernel started');
    return {
      success: true,
      kernel,
    };
  } catch (error) {
    console.log('Error starting new kernel');
    console.error(error);

    return {
      success: false,
      error: {
        message: error?.xhr?.statusText?.message ?? error.message ?? 'Unknown error',
      },
    };
  }
};

/**
 * Interrupt the given kernel
 */
export const interrupt = (gatewayUri: string, kernel_id: string): Promise<Response> =>
  fetch(`${gatewayUri}/api/kernels/${kernel_id}/interrupt`, { method: 'POST' });

/**
 * Restart the given kernel
 */
export const restart = (gatewayUri: string, kernel_id: string): Promise<Response> =>
  fetch(`${gatewayUri}/api/kernels/${kernel_id}/restart`, { method: 'POST' });

/**
 * Kill the given kernel
 */
export const kill = (gatewayUri: string, kernel_id: string): Promise<Response> =>
  fetch(`${gatewayUri}/api/kernels/${kernel_id}`, { method: 'DELETE' });

import { KernelManager, KernelSpecAPI, ServerConnection } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

import { GATEWAY_BASE_URI } from '../constants/jupyter';

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
  settings: ServerConnection.ISettings,
  kernelManager: KernelManager
): Promise<
  | {
      success: true;
      kernel: IKernelConnection;
    }
  | {
      success: false;
      error: {
        message: string;
      };
    }
> => {
  let kernelSpecs: KernelSpecAPI.ISpecModels | undefined;

  try {
    kernelSpecs = await KernelSpecAPI.getSpecs(settings);
  } catch (error) {
    console.log('Error fetching kernel specs');
    console.error(error);

    if (error.message === 'Forbidden') {
      return {
        success: false,
        error: {
          message: 'Kernel token was incorrect!',
        },
      };
    }

    return {
      success: false,
      error: {
        message: error.xhr?.statusText?.message ?? error.message ?? `Could not connect to gateway ${settings.baseUrl}`,
      },
    };
  }

  console.log('Available kernelspecs', kernelSpecs);

  try {
    const kernel = await kernelManager.startNew({
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

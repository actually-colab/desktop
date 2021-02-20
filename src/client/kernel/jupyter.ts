import { IKernel, Kernel } from 'jupyter-js-services';

import { GATEWAY_BASE_URI } from '../../shared/constants/jupyter';

const GATEWAY_STEM = `${GATEWAY_BASE_URI}:`;

/**
 * Get the gateway URI from the kernel message
 */
export const extractGatewayUri = (message: string) => {
  const index = message.indexOf(GATEWAY_STEM);

  if (index >= 0) {
    return message.substring(index).trim();
  }

  return '';
};

/**
 * Convert the gateway uri to a websocket uri
 */
export const getGatewayWebSocketUri = (uri: string) => {
  return uri.replace('http://', 'ws://');
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
  try {
    const kernelSpecs = await Kernel.getSpecs({
      baseUrl: uri,
    });

    console.log('Available kernelspecs', kernelSpecs);

    try {
      const kernel = await Kernel.startNew({
        baseUrl: uri,
        wsUrl: getGatewayWebSocketUri(uri),
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
          message: error?.xhr?.statusText?.message ?? 'Unknown error',
        },
      };
    }
  } catch (error) {
    console.log('Error fetching kernel specs');
    console.error(error);

    return {
      success: false,
      error: {
        message: error?.xhr?.statusText?.message ?? 'Unknown error',
      },
    };
  }
};

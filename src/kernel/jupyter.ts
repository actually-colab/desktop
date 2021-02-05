// @ts-ignore
import xmlhttprequest from 'xmlhttprequest';
import { IKernel, Kernel } from 'jupyter-js-services';

global.XMLHttpRequest = xmlhttprequest.XMLHttpRequest;

const gatewayUrl = 'http://localhost:8888';
const gatewayWsUrl = 'ws://localhost:8888';

export const connectToKernel = async (): Promise<
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
      baseUrl: gatewayUrl,
    });

    console.log('Available kernelspecs', kernelSpecs);

    try {
      const kernel = await Kernel.startNew({
        baseUrl: gatewayUrl,
        wsUrl: gatewayWsUrl,
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

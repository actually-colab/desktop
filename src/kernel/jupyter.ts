// @ts-ignore
import xmlhttprequest from 'xmlhttprequest';
import { IKernel, Kernel, KernelMessage } from 'jupyter-js-services';

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
      error: Error;
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
        error,
      };
    }
  } catch (error) {
    console.log('Error fetching kernel specs');
    console.error(error);

    return {
      success: false,
      error,
    };
  }
};

export const executeCode = (kernel: IKernel, code: string) =>
  new Promise<KernelMessage.IIOPubMessage[]>((resolve) => {
    console.log('Running code', code);
    const output: KernelMessage.IIOPubMessage[] = [];

    const future = kernel.execute({
      code,
    });

    future.onIOPub = (msg) => {
      output.push(msg);
    };

    future.onDone = () => {
      console.log(output);
      resolve(output);
    };
  });

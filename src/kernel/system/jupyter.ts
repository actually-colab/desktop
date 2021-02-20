import { promiseExec } from '../../shared/system/process';

/**
 * Get the version of the kernel gateway on the host. This serves as a way of verifying the gateway is operational
 */
export const getGatewayVersion = async (): Promise<string | null> => {
  const { stdout, stderr } = await promiseExec('jupyter kernelgateway --version');

  if (stderr) {
    return null;
  }

  return stdout;
};

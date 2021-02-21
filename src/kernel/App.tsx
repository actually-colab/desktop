import React from 'react';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { getGatewayVersion, installGateway } from './system/jupyter';
import { sendKernelProcessToMain } from './utils/ipc';

const EntryPoint: React.FC = () => {
  const kernelProcess = React.useRef<ChildProcessWithoutNullStreams | null>(null);
  const [gatewayVersion, setGatewayVersion] = React.useState<string>('');
  const [pid, setPid] = React.useState<number>(-1);
  const [kernelError, setKernelError] = React.useState<string>('');

  /**
   * Manage the kernel process main event loop
   */
  const startKernelProcess = React.useCallback(async () => {
    if (kernelProcess.current !== null) {
      return;
    }

    // Check if the kernel gateway is available
    let version = await getGatewayVersion();
    setGatewayVersion(version ?? 'Unknown');

    console.log('Kernel gateway version:', version);

    if (!version) {
      version = await installGateway();
      setGatewayVersion(version ?? 'Install failed');

      console.log('Kernel gateway installed version', version);
    }

    if (!version) {
      console.log('Failed to install kernel gateway');
      return;
    }

    try {
      // Spawn the kernel gateway
      kernelProcess.current = spawn('jupyter', ['kernelgateway', '--KernelGatewayApp.allow_origin="*"']);

      kernelProcess.current.stderr.setEncoding('utf-8');
      kernelProcess.current.stderr.on('data', (message: string) => {
        console.log('Kernel:', { message });

        sendKernelProcessToMain({
          type: 'stdout',
          message,
        });
      });

      // Notify main process the kernel is ready
      console.log('Kernel gateway started', kernelProcess.current.pid);

      setPid(kernelProcess.current.pid);
      sendKernelProcessToMain({
        type: 'start',
        pid: kernelProcess.current.pid,
      });

      kernelProcess.current.on('close', () => {
        // Notify main process the kernel is closed to safely exit
        console.log('Kernel gateway closed');
        sendKernelProcessToMain({
          type: 'end',
          pid: kernelProcess.current?.pid ?? -1,
        });
      });
    } catch (error) {
      console.error(error);
      setKernelError(error.message);
    }
  }, []);

  /**
   * Manage the kernel process
   */
  React.useEffect(() => {
    startKernelProcess();
  }, [startKernelProcess]);

  return (
    <div>
      <pre>gateway_version: {gatewayVersion}</pre>
      <pre>state_pid: {pid}</pre>
      <pre>error: {kernelError}</pre>
    </div>
  );
};

export default function App() {
  return <EntryPoint />;
}

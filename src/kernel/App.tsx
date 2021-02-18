import React from 'react';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { sendKernelProcessToMain } from './utils/ipc';

const EntryPoint: React.FC = () => {
  const kernelProcess = React.useRef<ChildProcessWithoutNullStreams | null>(null);
  const [kernelError, setKernelError] = React.useState<string>('');

  React.useEffect(() => {
    if (kernelProcess.current === null) {
      try {
        // Spawn the kernel gateway
        kernelProcess.current = spawn('jupyter', ['kernelgateway', '--KernelGatewayApp.allow_origin="*"']);

        kernelProcess.current.stdout.on('data', (message) => {
          console.log(message);
        });

        // Notify main process the kernel is ready
        console.log('Kernel gateway started', kernelProcess.current.pid);
        sendKernelProcessToMain({
          type: 'start',
          pid: kernelProcess.current.pid,
        });

        kernelProcess.current.on('close', () => {
          // Notify main process the kernel is closed to safely exit
          console.log('Kernel gateway closed');
          sendKernelProcessToMain({
            type: 'end',
          });
        });
      } catch (error) {
        console.error(error);
        setKernelError(error.message);
      }
    }
  }, []);

  return (
    <div>
      <pre>process_pid: {kernelProcess.current?.pid}</pre>
      <pre>error: {kernelError}</pre>
    </div>
  );
};

export default function App() {
  return <EntryPoint />;
}

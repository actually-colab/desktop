import React from 'react';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { sendKernelProcessToMain } from './utils/ipc';

const EntryPoint: React.FC = () => {
  const kernelProcess = React.useRef<ChildProcessWithoutNullStreams | null>(null);
  const [pid, setPid] = React.useState<number>(-1);
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
    }
  }, []);

  return (
    <div>
      <pre>state_pid: {pid}</pre>
      <pre>error: {kernelError}</pre>
    </div>
  );
};

export default function App() {
  return <EntryPoint />;
}

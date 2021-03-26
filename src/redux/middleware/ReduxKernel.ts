import { Middleware } from 'redux';
import { IKernel } from 'jupyter-js-services';

import { ReduxState } from '../../types/redux';
import { KERNEL } from '../../types/redux/editor';
import { KernelApi } from '../../api';
import { BaseKernelOutput, KernelOutput } from '../../types/notebook';
import { IpynbOutput } from '../../types/ipynb';
import { syncSleep } from '../../utils/sleep';
import { ReduxActions, _editor, _ui } from '../actions';

/**
 * A redux middleware to manage the Jupyter Kernel
 */
const ReduxKernel = (): Middleware<{}, ReduxState, any> => {
  let kernel: IKernel | null = null;
  let kernelUri: string = '';

  /**
   * Attempt to shutdown the kernel on page exit
   */
  const shutdownOnUnmount = () => {
    try {
      kernel?.shutdown();
      syncSleep(400);
    } catch (error) {}
  };

  return (store) => (next) => (action: ReduxActions) => {
    switch (action.type) {
      /**
       * Started connecting to the kernel
       */
      case KERNEL.CONNECT.START: {
        if (kernel !== null) {
          console.error('Already connected to kernel');
          return; // Cancel the action
        }

        (async () => {
          const res = await KernelApi.connectToKernel(action.uri);

          if (res.success) {
            kernel = res.kernel;
            kernelUri = action.uri;

            // Kernel needs to be shutdown on close
            window.addEventListener('beforeunload', shutdownOnUnmount);

            store.dispatch(
              _editor.connectToKernelSuccess({
                uri: action.uri,
                id: kernel.id,
                status: 'Idle',
              })
            );

            // Allows us to track if the kernel was in the disconnect state before this message
            let disconnected = false;

            // Listen to the kernel status
            res.kernel.statusChanged.connect((newKernel) => {
              if (newKernel.status === 'reconnecting') {
                disconnected = true;

                store.dispatch(
                  _ui.notify({
                    level: 'warning',
                    title: 'Kernel connection lost',
                    message:
                      'The kernel disconnected, attempting to reconnect. If the kernel does not reconnect in the next couple minutes, the connection is dead.',
                    duration: 5000,
                  })
                );
                store.dispatch(
                  _editor.appendKernelLog({
                    status: 'Warning',
                    message: `Kernel ${newKernel.id} connection lost`,
                  })
                );

                store.dispatch(_editor.connectToKernelReconnecting());
              } else if (newKernel.status === 'dead') {
                store.dispatch(
                  _ui.notify({
                    level: 'error',
                    title: 'Kernel connection died',
                    message: 'Could not reconnect to the kernel after multiple tries. The connection is now dead.',
                    duration: 5000,
                  })
                );
                store.dispatch(
                  _editor.appendKernelLog({
                    status: 'Error',
                    message: `Kernel ${newKernel.id} connection died`,
                  })
                );

                kernel = null;
                kernelUri = '';

                store.dispatch(_editor.disconnectFromKernelSuccess());
              } else {
                if (disconnected) {
                  disconnected = false;

                  store.dispatch(
                    _ui.notify({
                      level: 'success',
                      title: 'Kernel reconnected',
                      message: 'The kernel reconnected, kernel state should be intact',
                      duration: 5000,
                    })
                  );
                  store.dispatch(
                    _editor.appendKernelLog({
                      status: 'Success',
                      message: `Kernel ${newKernel.id} reconnected`,
                    })
                  );

                  store.dispatch(_editor.connectToKernelReconnected());
                }
              }
            });

            store.dispatch(
              _editor.appendKernelLog({
                status: 'Success',
                message: `Kernel ${res.kernel.id} connected`,
              })
            );
          } else {
            if (action.displayError) {
              store.dispatch(
                _ui.notify({
                  level: 'error',
                  title: "Couldn't connect to the kernel",
                  message: res.error.message,
                  duration: 5000,
                })
              );
            }

            store.dispatch(_editor.connectToKernelFailure(res.error.message));
          }
        })();
        break;
      }
      /**
       * Started disconnecting from the kernel
       */
      case KERNEL.DISCONNECT.START: {
        if (kernel === null) {
          console.error('Not connected to a kernel');
          return; // Cancel the action
        }

        (async () => {
          try {
            await kernel.shutdown();
          } catch (error) {
            kernel.dispose();
          }

          // Kernel needs to be shutdown on close
          window.removeEventListener('beforeunload', shutdownOnUnmount);

          store.dispatch(
            _editor.appendKernelLog({
              status: 'Success',
              message: `Kernel ${kernel.id} disconnected`,
            })
          );

          // Clear the stored values
          kernel = null;
          kernelUri = '';

          store.dispatch(_editor.disconnectFromKernelSuccess());
        })();
        break;
      }
      /**
       * Started restarting the kernel
       */
      case KERNEL.RESTART.START: {
        if (kernel === null) {
          console.error('Not connected to a kernel');
          return; // Cancel the action
        }

        (async () => {
          try {
            await KernelApi.restart(kernelUri, kernel.id);

            console.log('Kernel was restarted');
            store.dispatch(_editor.restartKernelSuccess());
          } catch (error) {
            console.error(error);
          }
        })();
        break;
      }
      /**
       * Started executing code on the kernel
       */
      case KERNEL.EXECUTE.START: {
        if (kernel === null) {
          console.error('Not connected to a kernel');
          return; // Cancel the action
        }

        (async () => {
          const future = kernel.execute({
            code: action.cell.get('contents'),
          });

          const startTimestamp = Date.now();

          let runIndex = -1;
          let messageIndex = 0;
          const messageQueue: KernelOutput[] = [];
          let threwError = false;

          future.onIOPub = (message) => {
            let kernelOutput: KernelOutput | null = null;

            try {
              if (message.content.execution_count !== undefined && runIndex === -1) {
                // execution metadata
                runIndex = message.content.execution_count as number;

                // Update the current run
                store.dispatch(_editor.updateRunIndex(action.cell.get('cell_id'), runIndex));
                store.dispatch(
                  _editor.appendKernelLog({
                    status: 'Info',
                    message: `Started run #${runIndex} on cell ${action.cell.get('cell_id')}`,
                  })
                );
              }

              const baseKernelOutput: BaseKernelOutput = {
                uid: store.getState().auth.user?.uid ?? '',
                output_id: message.header.msg_id,
                cell_id: action.cell.get('cell_id'),
                runIndex: -1,
                messageIndex,
              };

              // Only catch valid message types
              switch (message.header.msg_type) {
                case 'stream':
                case 'display_data':
                case 'execute_result':
                case 'error':
                  kernelOutput = {
                    ...baseKernelOutput,
                    output: {
                      ...((message.content as unknown) as IpynbOutput),
                      output_type: message.header.msg_type,
                    } as IpynbOutput,
                  };
                  break;
              }

              // Errors need to be separated so it knows to cancel the run queue
              if (message.header.msg_type === 'error') {
                threwError = true;
              }

              console.log({ message, kernelOutput });
            } catch (error) {
              console.error(error);
            }

            if (kernelOutput !== null) {
              messageIndex++;

              if (runIndex !== -1) {
                // No need to queue
                store.dispatch(
                  _editor.receiveKernelMessage(action.cell.get('cell_id'), [
                    {
                      ...kernelOutput,
                      runIndex,
                    },
                  ])
                );
              } else {
                // Store messages until execution count message is received
                messageQueue.push(kernelOutput);
              }
            } else if (runIndex !== -1 && messageQueue.length > 0) {
              // process any messages in queue
              store.dispatch(
                _editor.receiveKernelMessage(
                  action.cell.get('cell_id'),
                  messageQueue.map((oldMessage) => ({ ...oldMessage, runIndex }))
                )
              );
            }
          };

          future.onDone = () => {
            store.dispatch(
              _editor.appendKernelLog({
                status: threwError ? 'Error' : 'Success',
                message: `Finished run #${runIndex} on cell ${action.cell.get('cell_id')} in ${
                  (Date.now() - startTimestamp) / 1000
                }s`,
              })
            );

            if (threwError) {
              store.dispatch(_editor.executeCodeFailure(action.cell.get('cell_id'), runIndex, 'Code threw an error'));
            } else {
              store.dispatch(_editor.executeCodeSuccess(action.cell.get('cell_id'), runIndex));
            }
          };
        })();
        break;
      }
      /**
       * Started interrupting the kernel execution
       */
      case KERNEL.INTERRUPT.START: {
        if (kernel === null) {
          console.error('Not connected to a kernel');
          return; // Cancel the action
        }

        (async () => {
          try {
            await KernelApi.interrupt(kernelUri, kernel.id);

            console.log('Kernel was interrupted');
            store.dispatch(_editor.interruptKernelSuccess(action.cell_id));
          } catch (error) {
            console.error(error);
          }
        })();
        break;
      }
    }

    return next(action);
  };
};

export default ReduxKernel;

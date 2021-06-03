import { Middleware } from 'redux';
import { KernelManager, ServerConnection } from '@jupyterlab/services';
import { IKernelConnection } from '@jupyterlab/services/lib/kernel/kernel';

import { ReduxState } from '../../types/redux';
import { KERNEL, NOTEBOOKS } from '../../types/redux/editor';
import { KernelApi } from '../../api';
import { BaseKernelOutput, KernelOutput } from '../../types/notebook';
import { IpynbOutput } from '../../types/ipynb';
import { LOG_LEVEL } from '../../constants/logging';
import { syncSleep } from '../../utils/sleep';
import { httpToWebSocket } from '../../utils/request';
import { KernelTokenStorage } from '../../utils/storage';
import { ReduxActions, _editor, _ui } from '../actions';
import { connectToKernelIfReady } from './helpers/ReduxKernel';

export let settings: ServerConnection.ISettings | null = null;
export let kernelManager: KernelManager | null = null;
export let kernel: IKernelConnection | null = null;

/**
 * Safely dispose of the kernel manager
 */
const disposeOfKernelManager = (): void => {
  try {
    if (!kernelManager?.isDisposed && kernelManager?.isReady) {
      kernelManager.dispose();
    }
  } catch (error) {
    console.error(error);
  }

  kernelManager = null;
};

/**
 * A redux middleware to manage the Jupyter Kernel
 */
const ReduxKernel = (): Middleware<Record<string, unknown>, ReduxState, any> => {
  let kernelUri: string = '';
  let connectionTimeout: NodeJS.Timeout | null = null;

  /**
   * Attempt to shutdown the kernel on page exit
   */
  const shutdownOnUnmount = () => {
    try {
      if (kernel) {
        kernel.shutdown();
        syncSleep(400);
      }
    } catch (error) {}
  };

  /**
   * Clear the connection timeout
   */
  const clearConnectionTimeout = (): void => {
    if (connectionTimeout !== null) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
  };

  return (store) => (next) => (action: ReduxActions) => {
    switch (action.type) {
      /**
       * The user opened a notebook successfully
       */
      case NOTEBOOKS.OPEN.SUCCESS: {
        next(action);

        clearConnectionTimeout();

        // Attempt to connect to a kernel if auto connect enabled
        if (store.getState().editor.autoConnectToKernel) {
          connectToKernelIfReady(store, true);
        }
        return;
      }

      /**
       * Changed editing the kernel connection
       */
      case KERNEL.GATEWAY.EDIT: {
        next(action);

        // Cancel the connection timeout
        clearConnectionTimeout();

        if (action.editing) {
          // Disconnect from a kernel if there is one
          if (kernel !== null) {
            store.dispatch(_editor.disconnectFromKernel());
          }
        } else {
          // Attempt to connect to a kernel if auto connect enabled
          if (store.getState().editor.autoConnectToKernel) {
            connectToKernelIfReady(store, true);
          }
        }
        return;
      }

      /**
       * The user toggled auto connect
       */
      case KERNEL.CONNECT.AUTO: {
        next(action);

        if (action.enable) {
          connectToKernelIfReady(store, true);
        } else {
          clearConnectionTimeout();
        }
        return;
      }

      /**
       * Started connecting to the kernel
       */
      case KERNEL.CONNECT.START: {
        if (kernel !== null || kernelManager !== null) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Already connected to kernel');
          }
          return; // Cancel the action
        }

        if (store.getState().editor.isEditingGateway) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Cannot connect while editing the kernel gateway');
          }
          return; // Cancel the action
        }

        clearConnectionTimeout();

        next(action);

        // Build the connection settings
        settings = ServerConnection.makeSettings({
          baseUrl: action.uri,
          wsUrl: httpToWebSocket(action.uri),
          appUrl: process.env.REACT_APP_BASE_URL,
          token: action.token,
          appendToken: true,
        });

        kernelManager = new KernelManager({
          serverSettings: settings,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          standby: true,
        });

        (async () => {
          const res = await KernelApi.connectToKernel(settings, kernelManager);

          if (res.success) {
            kernel = res.kernel;
            kernelUri = action.uri;

            // Kernel needs to be shutdown on close
            window.addEventListener('beforeunload', shutdownOnUnmount);

            // Remember the token in local storage
            KernelTokenStorage.set(action.token);

            // Allows us to track if the kernel was in the disconnect state before this message
            let disconnected = false;

            // Listen to the kernel status
            res.kernel.statusChanged.connect((newKernel) => {
              if (newKernel.status === 'unknown') {
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
                if (kernelUri === '') {
                  // Purposefully killed kernel can be ignored
                  return;
                }

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

                disposeOfKernelManager();

                store.dispatch(_editor.disconnectFromKernelSuccess());
              } else if (newKernel.status === 'idle' || newKernel.status === 'busy') {
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
              _ui.notify({
                level: 'success',
                title: 'Connected to kernel',
                message: 'The kernel is connected and ready to use!',
                duration: 3000,
              })
            );

            store.dispatch(
              _editor.connectToKernelSuccess({
                uri: action.uri,
                id: kernel.id,
                status: 'Idle',
              })
            );

            store.dispatch(
              _editor.appendKernelLog({
                status: 'Success',
                message: `Kernel ${res.kernel.id} connected`,
              })
            );
          } else {
            disposeOfKernelManager();

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

            // Refresh the timeout if auto connect is enabled
            if (store.getState().editor.autoConnectToKernel && connectionTimeout === null) {
              connectionTimeout = setTimeout(() => connectToKernelIfReady(store), 5000);
            }
          }
        })();
        break;
      }

      /**
       * Started disconnecting from the kernel
       */
      case KERNEL.DISCONNECT.START: {
        if (kernel === null) {
          if (LOG_LEVEL === 'verbose') {
            console.log('Not connected to a kernel');
          }
          return; // Cancel the action
        }

        next(action);

        (async () => {
          const kernelId = kernel.id;
          // Change the uri before shutting down to avoid the connection is dead notification
          kernelUri = '';

          try {
            await kernel.shutdown();
          } catch (error) {
            kernel.dispose();
          }

          disposeOfKernelManager();

          // Kernel does not need to be shutdown on close
          window.removeEventListener('beforeunload', shutdownOnUnmount);

          store.dispatch(
            _editor.appendKernelLog({
              status: 'Success',
              message: `Kernel ${kernelId} disconnected`,
            })
          );

          // Clear the stored values
          kernel = null;
          kernelUri = '';

          store.dispatch(_editor.disconnectFromKernelSuccess());

          // Auto connect if enabled
          if (store.getState().editor.autoConnectToKernel && connectionTimeout === null) {
            connectionTimeout = setTimeout(() => connectToKernelIfReady(store), 5000);
          }
        })();
        break;
      }

      /**
       * Started restarting the kernel
       */
      case KERNEL.RESTART.START: {
        if (kernel === null) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Not connected to a kernel');
          }
          return; // Cancel the action
        }

        (async () => {
          try {
            await kernel.restart();

            if (LOG_LEVEL === 'verbose') {
              console.log('Kernel was restarted');
            }

            store.dispatch(_editor.restartKernelSuccess());
          } catch (error) {
            console.error(error);
            console.error(error.response);
          }
        })();
        break;
      }

      /**
       * A cell is added to the queue
       */
      case KERNEL.EXECUTE.QUEUE: {
        next(action);

        // Don't execute if already executing a cell
        if (store.getState().editor.isExecutingCode) {
          break;
        }

        const runQueue = store.getState().editor.runQueue;

        // Run the next cell in the queue
        if (runQueue.size > 0) {
          const cell = store.getState().editor.cells.get(runQueue.get(0) ?? '');

          if (cell) {
            store.dispatch(_editor.executeCode(cell));
          }
        }
        break;
      }

      /**
       * Started executing code on the kernel
       */
      case KERNEL.EXECUTE.START: {
        if (kernel === null) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Not connected to a kernel');
          }
          return; // Cancel the action
        }

        if (store.getState().editor.isExecutingCode) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Already executing code');
          }
          return; // Cancel the action
        }

        next(action);

        (async () => {
          const future = kernel.requestExecute(
            {
              code: action.cell.contents,
            },
            true
          );

          const startTimestamp = Date.now();

          let runIndex = -1;
          let messageIndex = 0;
          const messageQueue: KernelOutput[] = [];
          let threwError = false;

          future.onIOPub = (message) => {
            let kernelOutput: KernelOutput | null = null;

            try {
              if ('execution_count' in message.content && message.content.execution_count != null && runIndex === -1) {
                // execution metadata
                runIndex = message.content.execution_count;

                // Update the current run
                store.dispatch(_editor.updateRunIndex(action.cell.cell_id, runIndex));
                store.dispatch(
                  _editor.appendKernelLog({
                    status: 'Info',
                    message: `Started run #${runIndex} on cell ${action.cell.cell_id}`,
                  })
                );
              }

              const baseKernelOutput: BaseKernelOutput = {
                uid: store.getState().auth.user?.uid ?? '',
                output_id: message.header.msg_id,
                cell_id: action.cell.cell_id,
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
                      ...message.content,
                      output_type: message.header.msg_type,
                    } as IpynbOutput,
                  };
                  break;
              }

              // Errors need to be separated so it knows to cancel the run queue
              if (message.header.msg_type === 'error') {
                threwError = true;
              }

              if (LOG_LEVEL === 'verbose') {
                console.log({ message, kernelOutput });
              }
            } catch (error) {
              console.error(error);
            }

            if (kernelOutput !== null) {
              messageIndex++;

              if (runIndex !== -1) {
                // No need to queue
                store.dispatch(
                  _editor.receiveKernelMessage(action.cell.cell_id, runIndex, [
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
                  action.cell.cell_id,
                  runIndex,
                  messageQueue.map((oldMessage) => ({ ...oldMessage, runIndex }))
                )
              );
            }
          };

          await future.done;

          store.dispatch(
            _editor.appendKernelLog({
              status: threwError ? 'Error' : 'Success', // lgtm [js/trivial-conditional]
              message: `Finished run #${runIndex} on cell ${action.cell.cell_id} in ${
                (Date.now() - startTimestamp) / 1000
              }s`,
            })
          );

          if (threwError) {
            store.dispatch(_editor.executeCodeFailure(action.cell.cell_id, runIndex, 'Code threw an error'));
          } else {
            store.dispatch(_editor.executeCodeSuccess(action.cell.cell_id, runIndex));
          }
        })();
        break;
      }

      /**
       * Finished executing code successfully
       */
      case KERNEL.EXECUTE.SUCCESS: {
        next(action);

        const runQueue = store.getState().editor.runQueue;

        // Run the next cell in the queue
        if (runQueue.size > 0) {
          const cell = store.getState().editor.cells.get(runQueue.get(0) ?? '');

          if (cell) {
            store.dispatch(_editor.executeCode(cell));
          }
        }
        break;
      }

      /**
       * Started interrupting the kernel execution
       */
      case KERNEL.INTERRUPT.START: {
        if (kernel === null) {
          if (LOG_LEVEL === 'verbose') {
            console.error('Not connected to a kernel');
          }
          return; // Cancel the action
        }

        if (!store.getState().editor.isExecutingCode) {
          if (LOG_LEVEL === 'verbose') {
            console.log('No cell to interrupt');
          }
          return; // Cancel the action
        }

        next(action);

        (async () => {
          try {
            await kernel.interrupt();

            if (LOG_LEVEL === 'verbose') {
              console.log('Kernel was interrupted');
            }

            store.dispatch(_editor.interruptKernelSuccess(action.cell_id));
          } catch (error) {
            console.error(error);
            console.error(error.response);
          }
        })();
        break;
      }

      default: {
        return next(action);
      }
    }
  };
};

export default ReduxKernel;

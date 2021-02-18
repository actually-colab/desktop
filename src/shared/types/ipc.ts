type IpcKernelProcessReady = {
  type: 'ready';
};

type IpcKernelProcessStart = {
  type: 'start';
  pid: number;
};

type IpcKernelProcessEnd = {
  type: 'end';
};

type IpcKernelProcessStdout = {
  type: 'stdout';
  message: string;
};

export const IPC_KERNEL_PROCESS_CHANNEL = 'kernel-process';
export type IpcKernelProcessPayload =
  | IpcKernelProcessReady
  | IpcKernelProcessStart
  | IpcKernelProcessEnd
  | IpcKernelProcessStdout;

type IpcMainToKernelRequestClose = {
  type: 'request-close';
};

export const IPC_MAIN_TO_KERNEL_CHANNEL = 'main-to-kernel';
export type IpcMainToKernelPayload = IpcMainToKernelRequestClose;

type IpcLoginSuccess = {
  type: 'success';
  url: string;
};

export const IPC_LOGIN_CHANNEL = 'main-to-client-login';
export type IpcLoginPayload = IpcLoginSuccess;

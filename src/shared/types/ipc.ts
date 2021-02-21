type IpcKernelProcessReady = {
  type: 'ready';
};

type IpcKernelProcessStart = {
  type: 'start';
  pid: number;
  version: string;
};

type IpcKernelProcessEnd = {
  type: 'end';
  pid: number;
};

export type StdoutMessage = {
  id: number;
  message: string;
  date: Date;
};

type IpcKernelProcessStdout = {
  type: 'stdout';
} & StdoutMessage;

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

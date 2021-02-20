/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import treeKill from 'tree-kill';

import MenuBuilder from './menu';
import { IpcKernelProcessPayload, IPC_KERNEL_PROCESS_CHANNEL } from './shared/types/ipc';
import { sendKernelProcessToClient, sendLoginToClient } from './main/utils/ipc';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;
let kernelWindow: BrowserWindow | null = null;
/**
 * Track the kernel gateway process
 */
let kernelPid = -1;
let isClientReady = false;
const messageQueue: string[] = [];

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    minWidth: 960,
    minHeight: 840,
    width: 1280,
    height: 840,
    title: 'Actually Colab',
    titleBarStyle: 'hiddenInset',
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
  });

  kernelWindow = new BrowserWindow({
    show: false,
    width: 640,
    height: 840,
    title: 'Kernel [hidden in prod]',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(`file://${__dirname}/client/index.html`);
  kernelWindow.loadURL(`file://${__dirname}/kernel/index.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  kernelWindow.webContents.on('did-finish-load', () => {
    if (!kernelWindow) {
      throw new Error('"kernelWindow" is not defined');
    }

    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      // Only show the kernel window in development so console logs are available
      kernelWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;

    // Quit if the main window is closed
    app.quit();
  });

  kernelWindow.on('close', (event) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
      // Prevent closing the kernel window completely since it can't be reopened
      if (mainWindow) {
        event.preventDefault();
      }
    }
  });

  kernelWindow.on('closed', () => {
    kernelWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  // Ignore quit to safely exit
});

app.on('before-quit', (event) => {
  if (kernelPid !== -1) {
    // Wait for the kernel to close
    event.preventDefault();

    // Attempt to kill the kernel
    console.log('Tree killing', kernelPid);
    treeKill(kernelPid, 'SIGINT', (err) => {
      if (!err) {
        // Can safely exit
        console.log('Safely killed', kernelPid);
        kernelPid = -1;
        app.quit();
        return;
      }

      // SIGKILL if SIGINT fails
      treeKill(kernelPid, 'SIGKILL', () => {
        console.log('Dangerously killed', kernelPid);
        kernelPid = -1;
        app.quit();
      });
    });
  }
});

app.whenReady().then(createWindow).catch(console.log);

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

// Register to handle redirect requests
app.setAsDefaultProtocolClient('actuallycolab');

// MacOS specific. Use process.argv for Windows and Linux
app.on('open-url', (_, url) => {
  // Handle the login URI
  sendLoginToClient(mainWindow, { type: 'success', url });
});

// Handle UI dialogs
ipcMain.on(
  'display-dialog',
  (_, data?: { type: 'message'; message: string } | { type: 'error'; errorMessage: string }) => {
    if (data?.type === 'message' && mainWindow !== null) {
      dialog.showMessageBox(mainWindow, {
        message: data.message,
      });
    }

    if (data?.type === 'error') {
      dialog.showErrorBox('Uh oh', data.errorMessage);
    }
  }
);

// Handle kernel process messages
ipcMain.on(IPC_KERNEL_PROCESS_CHANNEL, (_, data: IpcKernelProcessPayload) => {
  switch (data.type) {
    case 'ready':
      console.log('Client is ready', kernelPid);

      isClientReady = true;

      if (kernelPid !== -1) {
        sendKernelProcessToClient(mainWindow, {
          type: 'start',
          pid: kernelPid,
        });
      }

      break;
    case 'start':
      console.log('Received kernel PID', data.pid);
      kernelPid = data.pid;

      if (isClientReady) {
        sendKernelProcessToClient(mainWindow, data);
      }
      break;
    case 'end':
      console.log('Quitting all processes');
      kernelPid = -1;

      sendKernelProcessToClient(mainWindow, data);
      break;
    case 'stdout':
      console.log('Received stdout', data.message);

      if (isClientReady) {
        if (messageQueue.length > 0) {
          // Empty the message queue
          for (const message of messageQueue) {
            sendKernelProcessToClient(mainWindow, {
              type: 'stdout',
              message,
            });
          }
        }

        sendKernelProcessToClient(mainWindow, {
          type: 'stdout',
          message: data.message,
        });
      } else {
        // Save the message until the client is ready to receive it
        messageQueue.push(data.message);
      }
      break;
    default:
      break;
  }
});

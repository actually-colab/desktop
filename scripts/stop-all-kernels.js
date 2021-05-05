/* eslint-disable */
const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const httpSearchString = 'http://';

async function stopAllKernels() {
  const kernelListOutput = await promiseExec('jupyter notebook list');

  console.log(kernelListOutput.stdout);

  const lines = kernelListOutput.stdout.split('\n');

  for (const line of lines) {
    try {
      const httpIndex = line.indexOf(httpSearchString);

      if (httpIndex >= 0) {
        const postHttp = line.substring(httpIndex + httpSearchString.length);
        const port = postHttp.substring(postHttp.indexOf(':') + 1, postHttp.indexOf('/?'));

        console.log(`Stopping port ${port}`);

        if (port.length > 0 && port.length < 6) {
          const kernelStopOutput = await promiseExec(`jupyter notebook stop ${port}`);

          console.log(kernelStopOutput.stdout || kernelStopOutput.stderr);
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
}

stopAllKernels();

/* eslint-disable */
const { exec } = require('child_process');
const { promisify } = require('util');

const promiseExec = promisify(exec);

const httpSearchString = 'http://';

/**
 * Find and kill all jupyter notebook instances
 */
async function stopAllKernels() {
  const kernelListOutput = await promiseExec('jupyter notebook list');

  console.log(kernelListOutput.stdout);

  const lines = kernelListOutput.stdout.split('\n');

  await Promise.all(
    lines.map((line) => {
      try {
        const httpIndex = line.indexOf(httpSearchString);

        if (httpIndex >= 0) {
          const postHttp = line.substring(httpIndex + httpSearchString.length);
          const port = postHttp.substring(postHttp.indexOf(':') + 1, postHttp.indexOf('/?'));

          console.log(`Stopping port ${port}`);

          if (port.length > 0 && port.length < 6) {
            return promiseExec(`jupyter notebook stop ${port}`)
              .then((res) => {
                console.log(res.stdout || res.stderr);
              })
              .catch((error) => {
                console.error(error);
              });
          }
        }
      } catch (error) {
        console.error(error);
      }
    })
  );
}

stopAllKernels();

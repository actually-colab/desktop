/* eslint-disable */
const HTTP_SEARCH_STRING = 'http://';

/**
 * Find and kill all jupyter notebook instances
 */
const kernelListOutput = await $`jupyter notebook list`;

const lines = kernelListOutput.stdout.split('\n');

await Promise.all(
  lines.map(async (line) => {
    try {
      const httpIndex = line.indexOf(HTTP_SEARCH_STRING);

      if (httpIndex >= 0) {
        const postHttp = line.substring(httpIndex + HTTP_SEARCH_STRING.length);
        const port = postHttp.substring(postHttp.indexOf(':') + 1, postHttp.indexOf('/?'));

        console.log(`Stopping port ${port}`);

        if (port.length > 0 && port.length < 6) {
          await $`jupyter notebook stop ${port}`;
        }
      }
    } catch (error) {
      console.error(error);
    }
  })
);

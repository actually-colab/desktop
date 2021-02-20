import { exec } from 'child_process';
import { promisify } from 'util';

/**
 * A promisified exec function
 */
export const promiseExec = promisify(exec);

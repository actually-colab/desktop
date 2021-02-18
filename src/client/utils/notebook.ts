import { KernelOutput } from '../types/notebook';

/**
 * A comparator for sorting kernel outputs by their message indices
 */
export const sortOutputByMessageIndex = (a: KernelOutput, b: KernelOutput) => a.messageIndex - b.messageIndex;

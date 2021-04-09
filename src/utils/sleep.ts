/**
 * Sleep in-sync to delay close. Only use if you cannot use promises and timeouts
 */
export const syncSleep = (delay: number): void => {
  const start = new Date().getTime();
  while (new Date().getTime() < start + delay);
};

/**
 * Sleep async to delay
 */
export const asyncSleep = (delay: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), delay);
  });
};

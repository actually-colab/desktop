/**
 * Sleep in-sync to delay close. Only use if you cannot use promises and timeouts
 */
export const syncSleep = (delay: number) => {
  const start = new Date().getTime();
  while (new Date().getTime() < start + delay);
};

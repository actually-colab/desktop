/**
 * Sleep in-sync to delay close
 */
export const syncSleep = (delay: number) => {
  const start = new Date().getTime();
  while (new Date().getTime() < start + delay);
};

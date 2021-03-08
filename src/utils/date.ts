import { Duration, isAfter, sub } from 'date-fns';

/**
 * Check if a given date is more than a duration ago
 */
export const isOlderThan = (date: Date | null, duration: Duration) => {
  if (date === null) {
    return true;
  }

  return isAfter(sub(new Date(), duration), date);
};

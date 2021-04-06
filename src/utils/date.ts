import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  Duration,
  isAfter,
  sub,
} from 'date-fns';

/**
 * Check if a given date is more than a duration ago
 */
export const isOlderThan = (date: Date | number | null, duration: Duration) => {
  if (date === null) {
    return true;
  }

  return isAfter(sub(Date.now(), duration), date);
};

export const timeSince = (date: Date | number) => {
  const now = Date.now();
  const minutes = differenceInMinutes(now, date);

  if (isNaN(minutes)) {
    return '';
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = differenceInHours(now, date);

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = differenceInDays(now, date);

  if (days < 7) {
    return `${days}d`;
  }

  const weeks = differenceInWeeks(now, date);

  if (weeks < 4) {
    return `${weeks}w`;
  }

  const months = differenceInMonths(now, date);

  if (months < 12) {
    return `${months}M`;
  }

  return `${differenceInYears(now, date)}y`;
};

import React from 'react';
import { differenceInSeconds } from 'date-fns';

const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/**
 * A basic timer component that counts from 0 up and renders hours, minutes, and seconds
 */
const Timer: React.FC<{ active: boolean; alwaysRender?: boolean; nonce: string | number }> = ({
  active,
  alwaysRender = true,
  nonce,
}) => {
  const startTime = React.useRef<Date | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = React.useState<number>(0);

  const hours = React.useMemo(() => Math.floor(elapsedSeconds / SECONDS_PER_HOUR), [elapsedSeconds]);
  const minutes = React.useMemo(() => Math.floor((elapsedSeconds - hours * SECONDS_PER_HOUR) / SECONDS_PER_MINUTE), [
    elapsedSeconds,
    hours,
  ]);
  const seconds = React.useMemo(() => elapsedSeconds - hours * SECONDS_PER_HOUR - minutes * SECONDS_PER_MINUTE, [
    elapsedSeconds,
    hours,
    minutes,
  ]);

  const shouldRenderHours = React.useMemo(() => hours > 0, [hours]);
  const shouldRenderMinutes = React.useMemo(() => hours > 0 || minutes > 0, [hours, minutes]);
  const shouldRenderSeconds = React.useMemo(() => hours > 0 || minutes > 0 || seconds > 0 || alwaysRender, [
    alwaysRender,
    hours,
    minutes,
    seconds,
  ]);

  /**
   * Start and stop the timer based on the active flag
   */
  React.useEffect(() => {
    if (active) {
      if (intervalRef.current === null) {
        console.log('Start');
        startTime.current = new Date();
        intervalRef.current = setInterval(() => {
          console.log('Test');
          setElapsedSeconds(differenceInSeconds(new Date(), startTime.current ?? new Date()));
        }, 1000);
      }
    } else {
      console.log('Stop', intervalRef.current, startTime.current);
      if (intervalRef.current !== null) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [active]);

  /**
   * Reset the timer based on the nonce
   */
  React.useEffect(() => {
    console.log(nonce);
    if (nonce !== '' && nonce !== -1) {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        startTime.current = null;
      }
    }
  }, [nonce]);

  React.useEffect(() => {
    console.log('Mount');
    return () => {
      console.log('unmount');
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <code>
      {shouldRenderHours && `${hours}h`}
      {shouldRenderMinutes && `${minutes}m`}
      {shouldRenderSeconds && `${seconds}s`}
    </code>
  );
};

export default Timer;

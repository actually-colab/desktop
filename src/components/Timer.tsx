import React from 'react';

const MILLISECONDS_PER_HOUR = 3600000;
const MILLISECONDS_PER_MINUTE = 60000;
const MILLISECONDS_PER_SECOND = 1000;

/**
 * A basic timer component that counts from 0 up and renders hours, minutes, and seconds
 */
const Timer: React.FC<{ active: boolean; alwaysRender?: boolean; nonce: string | number }> = ({
  active,
  alwaysRender = true,
  nonce,
}) => {
  const startTime = React.useRef<number | null>(null);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  const [elapsedMilliseconds, setElapsedMilliseconds] = React.useState<number>(0);

  const hours = React.useMemo(() => Math.floor(elapsedMilliseconds / MILLISECONDS_PER_HOUR), [elapsedMilliseconds]);
  const minutes = React.useMemo(
    () => Math.floor((elapsedMilliseconds - hours * MILLISECONDS_PER_HOUR) / MILLISECONDS_PER_MINUTE),
    [elapsedMilliseconds, hours]
  );
  const seconds = React.useMemo(
    () =>
      (elapsedMilliseconds - hours * MILLISECONDS_PER_HOUR - minutes * MILLISECONDS_PER_MINUTE) /
      MILLISECONDS_PER_SECOND,
    [elapsedMilliseconds, hours, minutes]
  );

  const shouldRenderHours = React.useMemo(() => hours > 0, [hours]);
  const shouldRenderMinutes = React.useMemo(() => hours > 0 || minutes > 0, [hours, minutes]);
  const shouldRenderSeconds = React.useMemo(() => hours > 0 || minutes > 0 || seconds > 0 || alwaysRender, [
    alwaysRender,
    hours,
    minutes,
    seconds,
  ]);
  const renderFractionalSeconds = React.useMemo(() => elapsedMilliseconds < MILLISECONDS_PER_SECOND, [
    elapsedMilliseconds,
  ]);

  /**
   * Start and stop the timer based on the active flag
   */
  React.useEffect(() => {
    if (active) {
      if (intervalRef.current === null) {
        startTime.current = Date.now();
        intervalRef.current = setInterval(() => {
          setElapsedMilliseconds(startTime.current !== null ? Date.now() - startTime.current : 0);
        }, 500);
      }
    } else if (nonce !== null) {
      // Update the time upon finishing
      if (startTime.current !== null) {
        setElapsedMilliseconds(startTime.current !== null ? Date.now() - startTime.current : 0);
      }

      // Clear the interval
      if (intervalRef.current !== null) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [active, nonce]);

  /**
   * Clear interval on unmount
   */
  React.useEffect(() => {
    return () => {
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
      {shouldRenderSeconds && `${renderFractionalSeconds ? seconds.toFixed(1) : Math.round(seconds)}s`}
    </code>
  );
};

export default Timer;

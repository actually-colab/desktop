export type LogLevel = 'verbose' | 'minimal';

export const LOG_LEVEL: LogLevel = (process.env.REACT_APP_LOG_LEVEL ?? 'minimal') as LogLevel;

export type LogLevel = 'log' | 'warn' | 'error';

interface LogData {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  error?: Error;
  extras?: Record<string, unknown>;
}

interface LogOptions {
  level: LogLevel;
  timestamp: string;
  context?: string;
}

function getTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');

  const hours = pad(now.getHours());
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const millis = now.getMilliseconds().toString().padStart(3, '0');

  return `${hours}:${minutes}:${seconds}.${millis}`;
}

function formatMessage(options: LogOptions, message: string, ...args: unknown[]): string {
  const { level, timestamp, context } = options;
  const contextStr = context ? `[${context}] ` : '';
  return `${timestamp} [${level.toUpperCase()}] ${contextStr}${message}`;
}

function logToConsole(data: LogData, ...args: unknown[]): void {
  if (__DEV__) {
    const { level, message, timestamp, context } = data;

    const formattedMessage = formatMessage({ level, timestamp, context }, message);

    switch (level) {
      case 'log':
        console.log(formattedMessage, ...args);
        break;
      case 'warn':
        console.warn(formattedMessage, ...args);
        break;
      case 'error':
        const errorObj = data.error instanceof Error ? data.error : undefined;
        console.error(formattedMessage, errorObj || data.error, ...args);
        if (errorObj?.stack) {
          console.log(`\nStack trace:\n${errorObj.stack}\n`);
        }
        break;
    }
  }
}

// Extension point for Sentry or other error tracking services
function captureLog(data: LogData, ...args: unknown[]): void {
  logToConsole(data, ...args);

  if (__DEV__) {
    return;
  }

}

export function log(message: string, ...args: unknown[]): void {
  const data: LogData = {
    level: 'log',
    message,
    timestamp: getTimestamp(),
  };
  captureLog(data, ...args);
}

export function warn(message: string, ...args: unknown[]): void {
  const data: LogData = {
    level: 'warn',
    message,
    timestamp: getTimestamp(),
  };
  captureLog(data, ...args);
}

export function error(message: string, err?: unknown, ...args: unknown[]): void {
  const errorObj = err instanceof Error ? err : undefined;
  const data: LogData = {
    level: 'error',
    message,
    timestamp: getTimestamp(),
    error: errorObj,
  };
  captureLog(data, ...args);
}

export function apiLog(method: string, url: string, body?: unknown): void {
  const maskedBody = body ? maskSensitiveData(body) : undefined;
  const data: LogData = {
    level: 'log',
    message: `API Request: ${method} ${url}`,
    timestamp: getTimestamp(),
    extras: {
      method,
      url,
      body: maskedBody,
    },
  };
  captureLog(data);
}

export function apiResponse(url: string, status: number, success: boolean): void {
  const statusStr = success ? '✓' : '✗';
  const data: LogData = {
    level: success ? 'log' : 'error',
    message: `API Response: ${statusStr} ${status} ${url}`,
    timestamp: getTimestamp(),
    extras: {
      url,
      status,
      success,
    },
  };
  captureLog(data);
}

function maskSensitiveData(data: unknown): unknown {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const obj = data as Record<string, unknown>;
  const masked = { ...obj };

  const sensitiveKeys = ['password', 'passwordConfirm', 'token', 'secret'];
  for (const key of sensitiveKeys) {
    if (key in masked) {
      masked[key] = '***MASKED***';
    }
  }

  return masked;
}

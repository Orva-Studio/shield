export type LogLevel = 'log' | 'warn' | 'error';

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

export function log(message: string, ...args: unknown[]): void {
  if (__DEV__) {
    const timestamp = getTimestamp();
    console.log(formatMessage({ level: 'log', timestamp }, message), ...args);
  }
}

export function warn(message: string, ...args: unknown[]): void {
  if (__DEV__) {
    const timestamp = getTimestamp();
    console.warn(formatMessage({ level: 'warn', timestamp }, message), ...args);
  }
}

export function error(message: string, error?: unknown, ...args: unknown[]): void {
  if (__DEV__) {
    const timestamp = getTimestamp();
    const errorObj = error instanceof Error ? error : undefined;
    
    console.error(formatMessage({ level: 'error', timestamp }, message), errorObj || error, ...args);
    
    if (errorObj?.stack) {
      console.log(`\nStack trace:\n${errorObj.stack}\n`);
    }
  }
}

export function apiLog(method: string, url: string, body?: unknown): void {
  if (__DEV__) {
    const timestamp = getTimestamp();
    const bodyStr = body ? JSON.stringify(maskSensitiveData(body)) : '';
    console.log(`${timestamp} [API] ${method} ${url}${bodyStr ? ` ${bodyStr}` : ''}`);
  }
}

export function apiResponse(url: string, status: number, success: boolean): void {
  if (__DEV__) {
    const timestamp = getTimestamp();
    const statusStr = success ? '✓' : '✗';
    console.log(`${timestamp} [API] ${statusStr} ${status} ${url}`);
  }
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

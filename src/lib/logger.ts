/**
 * Structured Logger for DataGN Application
 * Provides consistent logging format with context and levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogContext {
  userId?: string;
  workspaceId?: string;
  requestId?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  duration?: number;
}

class Logger {
  private readonly context: LogContext;
  private readonly isDevelopment: boolean;

  constructor(context: LogContext = {}) {
    this.context = context;
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * Create a child logger with additional context
   */
  child(additionalContext: LogContext): Logger {
    return new Logger({ ...this.context, ...additionalContext });
  }

  /**
   * Set context for all subsequent logs
   */
  setContext(context: LogContext): void {
    Object.assign(this.context, context);
  }

  private formatEntry(level: LogLevel, message: string, context?: LogContext, error?: Error): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: { ...this.context, ...context },
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      };
    }

    return entry;
  }

  private output(entry: LogEntry): void {
    const output = JSON.stringify(entry);

    switch (entry.level) {
      case 'fatal':
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'debug':
        if (this.isDevelopment) {
          console.debug(output);
        }
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, context?: LogContext): void {
    const entry = this.formatEntry('debug', message, context);
    this.output(entry);
  }

  info(message: string, context?: LogContext): void {
    const entry = this.formatEntry('info', message, context);
    this.output(entry);
  }

  warn(message: string, context?: LogContext): void {
    const entry = this.formatEntry('warn', message, context);
    this.output(entry);
  }

  error(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatEntry('error', message, context, error);
    this.output(entry);
  }

  fatal(message: string, error?: Error, context?: LogContext): void {
    const entry = this.formatEntry('fatal', message, context, error);
    this.output(entry);
  }

  /**
   * Log API request
   */
  request(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    this.info(`HTTP ${method} ${path}`, {
      ...context,
      http: {
        method,
        path,
        statusCode,
        duration,
      },
    });
  }

  /**
   * Log database operation
   */
  db(operation: string, table: string, duration: number, context?: LogContext): void {
    this.debug(`DB ${operation} on ${table}`, {
      ...context,
      db: {
        operation,
        table,
        duration,
      },
    });
  }

  /**
   * Log AI operation
   */
  ai(operation: string, model: string, tokensIn?: number, tokensOut?: number, context?: LogContext): void {
    this.info(`AI ${operation}`, {
      ...context,
      ai: {
        operation,
        model,
        tokensIn,
        tokensOut,
      },
    });
  }

  /**
   * Time a function execution
   */
  async time<T>(label: string, fn: () => Promise<T>, context?: LogContext): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.debug(`${label} completed`, { ...context, duration: Math.round(duration) });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed`, error as Error, { ...context, duration: Math.round(duration) });
      throw error;
    }
  }
}

// Default logger instance
export const logger = new Logger();

// Create logger with context
export function createLogger(context: LogContext): Logger {
  return new Logger(context);
}

// Export type
export type { LogContext, LogLevel, LogEntry };

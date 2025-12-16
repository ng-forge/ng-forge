import { DynamicFormLogger } from './logger.interface';
import { LogLevel } from './log-level';

/**
 * Console-based logger implementation.
 * Respects log level configuration to filter messages.
 */
export class ConsoleLogger implements DynamicFormLogger {
  private readonly prefix = '[Dynamic Forms]';

  constructor(private readonly level: LogLevel) {}

  debug(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.Debug) {
      console.debug(this.prefix, message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.Info) {
      console.info(this.prefix, message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.Warn) {
      console.warn(this.prefix, message, ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.level >= LogLevel.Error) {
      console.error(this.prefix, message, ...args);
    }
  }
}

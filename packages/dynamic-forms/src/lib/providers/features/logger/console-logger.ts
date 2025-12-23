import type { Logger } from './logger.interface';

/**
 * Console-based logger implementation.
 */
export class ConsoleLogger implements Logger {
  private readonly prefix = '[Dynamic Forms]';

  debug(message: string, ...args: unknown[]): void {
    console.debug(this.prefix, message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    console.info(this.prefix, message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.warn(this.prefix, message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    console.error(this.prefix, message, ...args);
  }
}

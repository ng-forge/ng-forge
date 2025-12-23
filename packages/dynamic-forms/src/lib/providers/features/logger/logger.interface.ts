/**
 * Interface for dynamic forms logger implementations.
 * Allows custom logging integrations (Sentry, DataDog, etc.)
 */
export interface Logger {
  /**
   * Log a debug message.
   * Use for detailed diagnostic information during development.
   */
  debug(message: string, ...args: unknown[]): void;

  /**
   * Log an info message.
   * Use for general operational information.
   */
  info(message: string, ...args: unknown[]): void;

  /**
   * Log a warning message.
   * Use for potentially problematic situations that don't prevent operation.
   */
  warn(message: string, ...args: unknown[]): void;

  /**
   * Log an error message.
   * Use for error conditions that may affect functionality.
   */
  error(message: string, ...args: unknown[]): void;
}

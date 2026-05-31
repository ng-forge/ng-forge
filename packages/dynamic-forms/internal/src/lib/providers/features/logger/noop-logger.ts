import type { Logger } from './logger.interface';

/**
 * No-operation logger implementation.
 * All methods are no-ops - used in production by default.
 */
export class NoopLogger implements Logger {
  debug(): void {
    // Intentionally empty
  }

  info(): void {
    // Intentionally empty
  }

  warn(): void {
    // Intentionally empty
  }

  error(): void {
    // Intentionally empty
  }
}

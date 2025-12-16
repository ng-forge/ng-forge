import { DynamicFormLogger } from './logger.interface';

/**
 * No-operation logger implementation.
 * All methods are no-ops - used in production by default.
 */
export class NoopLogger implements DynamicFormLogger {
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

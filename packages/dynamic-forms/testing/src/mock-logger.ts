import { vi, type Mock } from 'vitest';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { NoopLogger } from '@ng-forge/dynamic-forms';

/**
 * Mock logger with vitest spies for testing.
 */
export interface MockLogger extends DynamicFormLogger {
  debug: Mock;
  info: Mock;
  warn: Mock;
  error: Mock;
}

/**
 * Creates a mock logger with vitest spies for all methods.
 * Useful for testing code that uses the logger.
 */
export function createMockLogger(): MockLogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
}

/**
 * Creates a silent logger that doesn't output anything.
 * Useful for tests where logging output is not relevant.
 */
export function createSilentLogger(): DynamicFormLogger {
  return new NoopLogger();
}

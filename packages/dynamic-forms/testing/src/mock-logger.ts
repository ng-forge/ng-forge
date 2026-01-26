import { Provider } from '@angular/core';
import { vi, type Mock } from 'vitest';
import { DynamicFormLogger } from '../../src/lib/providers/features/logger/logger.token';
import { ConsoleLogger } from '../../src/lib/providers/features/logger/console-logger';
import { Logger } from '../../src/lib/providers/features/logger/logger.interface';

/**
 * Mock logger with vitest spies for testing.
 */
export interface MockLogger extends Logger {
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
 * Provider for a console logger in tests.
 * Add this to TestBed.configureTestingModule providers when not using provideDynamicForm().
 */
export function provideTestLogger(): Provider {
  return { provide: DynamicFormLogger, useValue: new ConsoleLogger() };
}

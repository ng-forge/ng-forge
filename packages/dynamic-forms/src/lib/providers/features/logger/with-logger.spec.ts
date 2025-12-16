import { describe, it, expect, vi } from 'vitest';
import { withLogger } from './with-logger';
import { LogLevel } from './log-level';
import { DYNAMIC_FORM_LOGGER } from './logger.token';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';
import { DynamicFormLogger } from './logger.interface';

describe('withLogger', () => {
  describe('Feature structure', () => {
    it('should return a DynamicFormFeature with kind "logger"', () => {
      const feature = withLogger();

      expect(feature.ɵkind).toBe('logger');
    });

    it('should contain providers array', () => {
      const feature = withLogger();

      expect(feature.ɵproviders).toBeDefined();
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(1);
    });

    it('should provide DYNAMIC_FORM_LOGGER token', () => {
      const feature = withLogger();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: unknown };

      expect(provider.provide).toBe(DYNAMIC_FORM_LOGGER);
    });
  });

  describe('Default options', () => {
    it('should use ConsoleLogger with Warn level by default', () => {
      const feature = withLogger();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: DynamicFormLogger };

      expect(provider.useValue).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe('LogLevel options', () => {
    it('should use ConsoleLogger with specified level', () => {
      const feature = withLogger({ level: LogLevel.Debug });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: DynamicFormLogger };

      expect(provider.useValue).toBeInstanceOf(ConsoleLogger);
    });

    it('should use NoopLogger when level is Off', () => {
      const feature = withLogger({ level: LogLevel.Off });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: DynamicFormLogger };

      expect(provider.useValue).toBeInstanceOf(NoopLogger);
    });
  });

  describe('Custom logger', () => {
    it('should use custom logger when provided', () => {
      const customLogger: DynamicFormLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const feature = withLogger({ logger: customLogger });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: DynamicFormLogger };

      expect(provider.useValue).toBe(customLogger);
    });

    it('should ignore level when custom logger is provided', () => {
      const customLogger: DynamicFormLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const feature = withLogger({ level: LogLevel.Off, logger: customLogger });
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: DynamicFormLogger };

      // Custom logger should be used, not NoopLogger
      expect(provider.useValue).toBe(customLogger);
      expect(provider.useValue).not.toBeInstanceOf(NoopLogger);
    });
  });
});

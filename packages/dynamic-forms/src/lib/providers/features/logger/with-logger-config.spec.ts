import { describe, it, expect } from 'vitest';
import { withLoggerConfig } from './with-logger-config';
import { DynamicFormLogger } from './logger.token';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';
import type { Logger } from './logger.interface';

describe('withLoggerConfig', () => {
  describe('Feature structure', () => {
    it('should return a DynamicFormFeature with kind "logger"', () => {
      const feature = withLoggerConfig();

      expect(feature.ɵkind).toBe('logger');
    });

    it('should contain providers array', () => {
      const feature = withLoggerConfig();

      expect(feature.ɵproviders).toBeDefined();
      expect(Array.isArray(feature.ɵproviders)).toBe(true);
      expect(feature.ɵproviders.length).toBe(1);
    });

    it('should provide DynamicFormLogger token', () => {
      const feature = withLoggerConfig();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: unknown };

      expect(provider.provide).toBe(DynamicFormLogger);
    });
  });

  describe('Default behavior', () => {
    it('should use ConsoleLogger when called with no arguments', () => {
      const feature = withLoggerConfig();
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: Logger };

      expect(provider.useValue).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe('Boolean parameter', () => {
    it('should use ConsoleLogger when enabled is true', () => {
      const feature = withLoggerConfig(true);
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: Logger };

      expect(provider.useValue).toBeInstanceOf(ConsoleLogger);
    });

    it('should use NoopLogger when enabled is false', () => {
      const feature = withLoggerConfig(false);
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: Logger };

      expect(provider.useValue).toBeInstanceOf(NoopLogger);
    });
  });

  describe('Function parameter', () => {
    it('should use ConsoleLogger when function returns true', () => {
      const feature = withLoggerConfig(() => true);
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: Logger };

      expect(provider.useValue).toBeInstanceOf(ConsoleLogger);
    });

    it('should use NoopLogger when function returns false', () => {
      const feature = withLoggerConfig(() => false);
      const provider = feature.ɵproviders[0] as { provide: unknown; useValue: Logger };

      expect(provider.useValue).toBeInstanceOf(NoopLogger);
    });
  });
});

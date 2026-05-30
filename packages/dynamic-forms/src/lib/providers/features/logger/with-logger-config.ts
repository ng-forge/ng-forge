import { InjectionToken } from '@angular/core';
import { createFeature, DynamicFormFeature } from '../dynamic-form-feature';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { ConsoleLogger } from './console-logger';
import { NoopLogger } from './noop-logger';
import { DerivationLogConfig, DerivationLogLevel, createDefaultDerivationLogConfig } from '@ng-forge/dynamic-forms/internal';

/**
 * Injection token for derivation logging configuration.
 *
 * @internal
 */
export const DERIVATION_LOG_CONFIG = new InjectionToken<DerivationLogConfig>('DERIVATION_LOG_CONFIG', {
  providedIn: 'root',
  factory: createDefaultDerivationLogConfig,
});

/** Configuration options for the logger feature. */
export interface LoggerConfigOptions {
  /**
   * Whether general logging is enabled.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Derivation logging level.
   *
   * @default 'none'
   */
  derivations?: DerivationLogLevel;
}

/**
 * Configure logging for dynamic forms.
 *
 * @param config - Boolean to enable/disable logging, a function returning boolean, or a config object
 * @returns A DynamicFormFeature that configures logging
 */
export function withLoggerConfig(config: boolean | (() => boolean) | LoggerConfigOptions = true): DynamicFormFeature<'logger'> {
  // Handle boolean or function
  if (typeof config === 'boolean' || typeof config === 'function') {
    const isEnabled = typeof config === 'function' ? config() : config;
    const logger = isEnabled ? new ConsoleLogger() : new NoopLogger();
    return createFeature('logger', [{ provide: DynamicFormLogger, useValue: logger }]);
  }

  // Handle config object
  const isEnabled = config.enabled !== false;
  const logger = isEnabled ? new ConsoleLogger() : new NoopLogger();

  const providers: { provide: InjectionToken<unknown>; useValue: unknown }[] = [{ provide: DynamicFormLogger, useValue: logger }];

  // Add derivation log config if specified
  if (config.derivations !== undefined) {
    providers.push({
      provide: DERIVATION_LOG_CONFIG,
      useValue: { level: config.derivations },
    });
  }

  return createFeature('logger', providers);
}

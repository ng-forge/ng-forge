import { inject } from '@angular/core';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import { FormConfig } from '@ng-forge/dynamic-forms/internal';
import { FIELD_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import { Logger } from '@ng-forge/dynamic-forms/internal';
import { AddonWarning, formatAddonWarning } from './addon-warning';
import { walkAndValidateAddons } from './validate-field-addons';

/** Options accepted by {@link sanitizeFormConfig}. */
export interface SanitizeFormConfigOptions {
  /**
   * Whether the config originated from JSON (server-driven) or inline
   * TypeScript code.
   */
  source?: 'json' | 'inline';
}

/** Result of a `sanitizeFormConfig` call. */
export interface SanitizedFormConfig {
  /** Sanitized config — invalid addons stripped from the field tree. */
  sanitized: FormConfig;
  /** Structured list of every addon that was dropped, and why. */
  warnings: readonly AddonWarning[];
}

/**
 * Walk a `FormConfig`, validate every field's addons against the active
 * `FIELD_REGISTRY` and `ADDON_TYPE_REGISTRY`, and return a sanitized copy
 * plus a list of dropped-addon warnings.
 *
 * @Component({ ... })
 * class AdminFormBuilder {
 *   private readonly check = (cfg: FormConfig) => {
 *     const { sanitized, warnings } = sanitizeFormConfig(cfg, { source: 'json' });
 *     if (warnings.length > 0) {
 *       this.diagnostics.set(warnings);
 *     }
 *     return sanitized;
 *   };
 * }
 * ```
 */
export function sanitizeFormConfig(config: FormConfig, options: SanitizeFormConfigOptions = {}): SanitizedFormConfig {
  const fieldRegistry = inject(FIELD_REGISTRY);
  const typeRegistry = inject(ADDON_TYPE_REGISTRY);
  const source = options.source ?? 'inline';

  const { fields, warnings } = walkAndValidateAddons(
    (config.fields ?? []) as readonly FieldDef<unknown>[],
    fieldRegistry,
    typeRegistry,
    source,
  );

  return {
    sanitized: { ...config, fields: fields as FormConfig['fields'] },
    warnings,
  };
}

/**
 * Default warning sink. Pass a `DynamicFormLogger` to route through the
 * form's configured logger (respects `NoopLogger` opt-out); omit it to
 * fall back to `console.warn` for build-time / admin-UI use cases that
 * run outside an Angular injection context.
 */
export function logAddonWarnings(warnings: readonly AddonWarning[], logger?: Logger): void {
  for (const w of warnings) {
    if (logger) {
      logger.warn(formatAddonWarning(w));
    } else {
      console.warn('[Dynamic Forms]', formatAddonWarning(w));
    }
  }
}

/**
 * DI-free variant of {@link sanitizeFormConfig} for tooling that lives
 * outside Angular's injector — build-time linters, MCP-side checks, CLI
 * scripts.
 */
export function sanitizeFormConfigPure(
  config: FormConfig,
  fieldRegistry: ReadonlyMap<string, import('@ng-forge/dynamic-forms/internal').FieldTypeDefinition>,
  typeRegistry: ReadonlyMap<string, import('@ng-forge/dynamic-forms/internal').AddonTypeDefinition>,
  options: SanitizeFormConfigOptions = {},
): SanitizedFormConfig {
  const source = options.source ?? 'inline';
  const { fields, warnings } = walkAndValidateAddons(
    (config.fields ?? []) as readonly FieldDef<unknown>[],
    fieldRegistry,
    typeRegistry,
    source,
  );
  return { sanitized: { ...config, fields: fields as FormConfig['fields'] }, warnings };
}

export { formatAddonWarning } from './addon-warning';
export type { AddonWarning } from './addon-warning';
export { validateFieldAddons, walkAndValidateAddons } from './validate-field-addons';

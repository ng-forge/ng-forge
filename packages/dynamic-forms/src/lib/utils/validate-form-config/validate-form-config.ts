import { inject } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { ADDON_KIND_REGISTRY } from '../../models/addon/addon-kind';
import { FormConfig } from '../../models/form-config';
import { FIELD_REGISTRY } from '../../models/field-type';
import { Logger } from '../../providers/features/logger/logger.interface';
import { AddonWarning, formatAddonWarning } from './addon-warning';
import { walkAndValidateAddons } from './validate-field-addons';

/**
 * Options accepted by {@link sanitizeFormConfig}.
 */
export interface SanitizeFormConfigOptions {
  /**
   * Whether the config originated from JSON (server-driven) or inline
   * TypeScript code.
   *
   * - `'inline'` (default): keeps everything; assumes the config is
   *   authored in code and code-only constructs (inline `action`
   *   functions, `component` kind) are intentional. The default avoids
   *   silently stripping inline behaviour during in-process authoring.
   * - `'json'`: drops code-only addon kinds (`component`, inline
   *   `action: function`) with a warning, since they cannot survive
   *   serialization. Use this when sanitising configs received from a
   *   backend / form-builder UI.
   */
  source?: 'json' | 'inline';
}

/**
 * Result of a `sanitizeFormConfig` call.
 */
export interface SanitizedFormConfig {
  /** Sanitized config — invalid addons stripped from the field tree. */
  sanitized: FormConfig;
  /** Structured list of every addon that was dropped, and why. */
  warnings: readonly AddonWarning[];
}

/**
 * Walk a `FormConfig`, validate every field's addons against the active
 * `FIELD_REGISTRY` and `ADDON_KIND_REGISTRY`, and return a sanitized copy
 * plus a list of dropped-addon warnings.
 *
 * Distinct from the INTERNAL `validateFormConfig` in
 * `utils/config-validation/config-validator.ts` (which throws on
 * structural errors like duplicate keys / unknown field types). This
 * helper is the PUBLIC, lenient addon-shape pass — renamed to
 * `sanitizeFormConfig` to avoid the name collision.
 *
 * Lenient by design: invalid addons are dropped (with warnings) rather than
 * thrown. The form keeps rendering even when the backend ships an addon the
 * FE doesn't understand.
 *
 * `<df-dynamic-form>` already runs this internally at form init — calling
 * the public helper AND passing the original config to the form will
 * double-emit warnings. Use this entry point only when you need the
 * sanitized config or warning list outside the form (e.g., admin-UI
 * diagnostics, build-time lints).
 *
 * Must be called within an Angular injection context — typically inside
 * an admin-UI component or a `runInInjectionContext()` block on the server.
 *
 * @example
 * ```typescript
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
  const kindRegistry = inject(ADDON_KIND_REGISTRY);
  const source = options.source ?? 'inline';

  const { fields, warnings } = walkAndValidateAddons(
    (config.fields ?? []) as readonly FieldDef<unknown>[],
    fieldRegistry,
    kindRegistry,
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
 *
 * Caller passes the registries explicitly; the result has the same shape
 * as the DI-bound version.
 */
export function sanitizeFormConfigPure(
  config: FormConfig,
  fieldRegistry: ReadonlyMap<string, import('../../models/field-type').FieldTypeDefinition>,
  kindRegistry: ReadonlyMap<string, import('../../models/addon/addon-kind').AddonKindDefinition>,
  options: SanitizeFormConfigOptions = {},
): SanitizedFormConfig {
  const source = options.source ?? 'inline';
  const { fields, warnings } = walkAndValidateAddons(
    (config.fields ?? []) as readonly FieldDef<unknown>[],
    fieldRegistry,
    kindRegistry,
    source,
  );
  return { sanitized: { ...config, fields: fields as FormConfig['fields'] }, warnings };
}

export { formatAddonWarning } from './addon-warning';
export type { AddonWarning } from './addon-warning';
export { validateFieldAddons, walkAndValidateAddons } from './validate-field-addons';

import { inject } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { ADDON_KIND_REGISTRY } from '../../models/addon/addon-kind';
import { FormConfig } from '../../models/form-config';
import { FIELD_REGISTRY } from '../../models/field-type';
import { AddonWarning, formatAddonWarning } from './addon-warning';
import { walkAndValidateAddons } from './validate-field-addons';

/**
 * Options accepted by {@link validateFormConfig}.
 */
export interface ValidateFormConfigOptions {
  /**
   * Whether the config originated from JSON (server-driven) or inline
   * TypeScript code.
   *
   * - `'json'` (default for server-driven flows): drops code-only addon
   *   kinds (`component`, inline `action: function`) with a warning, since
   *   they cannot survive serialization.
   * - `'inline'`: keeps everything; assumes the config is authored in code
   *   and code-only constructs are intentional.
   *
   * Defaults to `'inline'` for safety — explicit opt-in to JSON-mode
   * behaviour avoids accidentally stripping inline actions during dev.
   */
  source?: 'json' | 'inline';
}

/**
 * Result of a `validateFormConfig` call.
 */
export interface ValidatedFormConfig {
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
 * Lenient by design: invalid addons are dropped (with warnings) rather than
 * thrown. The form keeps rendering even when the backend ships an addon the
 * FE doesn't understand.
 *
 * Must be called within an Angular injection context — typically inside
 * an admin-UI component or a `runInInjectionContext()` block on the server.
 *
 * @example
 * ```typescript
 * @Component({ ... })
 * class AdminFormBuilder {
 *   private readonly check = (cfg: FormConfig) => {
 *     const { sanitized, warnings } = validateFormConfig(cfg, { source: 'json' });
 *     if (warnings.length > 0) {
 *       this.diagnostics.set(warnings);
 *     }
 *     return sanitized;
 *   };
 * }
 * ```
 */
export function validateFormConfig(config: FormConfig, options: ValidateFormConfigOptions = {}): ValidatedFormConfig {
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
 * Default warning sink — emits each warning as a `console.warn` line. Adapter
 * tests / admin UIs can capture warnings from `validateFormConfig` directly
 * instead of relying on console output.
 */
export function logAddonWarnings(warnings: readonly AddonWarning[]): void {
  for (const w of warnings) {
    console.warn(formatAddonWarning(w));
  }
}

export { formatAddonWarning } from './addon-warning';
export type { AddonWarning } from './addon-warning';

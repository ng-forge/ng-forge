import { WritableSignal } from '@angular/core';
import { AddonActionContext, AddonActionPreset } from '../models/addon/addon-action';
import type { Logger } from '../providers/features/logger/logger.interface';

/**
 * Optional collaborators a preset may need beyond the base context. Passed
 * by the button kind component which has access to its own DI scope.
 *
 * Adapter input components fill in the collaborators their preset semantics
 * require:
 * - `mat-input` / `bs-input` / `prime-input` / `ion-input` populate
 *   `typeOverride` + `fieldValueSetter` + `fieldDefaultValueGetter` +
 *   `baselineType` from their own DI scope.
 * - Addons rendered outside any input field receive `{ logger }` only and
 *   the input-specific presets warn-and-no-op.
 */
export interface PresetCollaborators {
  /** Per-field input-type override signal — populated only inside an input field. */
  readonly typeOverride?: WritableSignal<string | undefined>;
  /** Writer that pushes a value into the host field's tree. */
  readonly fieldValueSetter?: (next: unknown) => void;
  /**
   * Read the host field's configured default value (from the form's
   * `defaultValues` map keyed by `field.key`). Used by the `'reset'`
   * preset; absent when the addon is rendered outside an active field
   * context, in which case `'reset'` falls back to clearing.
   */
  readonly fieldDefaultValueGetter?: () => unknown;
  /**
   * Baseline configured input type (from `props().type`), read at preset-run
   * time. Used by `toggle-password-visibility` to refuse to corrupt
   * `'email'`/`'number'`/etc. inputs into `'password'` when no override is
   * yet set.
   */
  readonly baselineType?: () => string | undefined;
  /**
   * Logger for warnings about presets that can't be fulfilled in this context.
   *
   * Passed via collaborators (rather than injected) because `runPresetAction`
   * is a DI-free pure function shared across adapters — each adapter's
   * `ADDON_PRESET_HANDLER` factory injects `DynamicFormLogger` itself and
   * forwards it here. The `[Dynamic Forms]` prefix comes from
   * `ConsoleLogger`'s implementation, so the final console line is identical
   * to one logged directly via `inject(DynamicFormLogger)`.
   */
  readonly logger: Logger;
}

/**
 * Apply a built-in preset action against the addon's host field. Shared
 * across all adapters — each adapter's `ADDON_PRESET_HANDLER` provider
 * delegates here.
 *
 * Presets that require adapter-specific UI mechanics (clipboard, type
 * override) are best-effort — they no-op with a warning when the necessary
 * collaborator isn't available (e.g., toggle-password-visibility outside an
 * input field).
 *
 * @param adapterLabel Used in warnings — `'Material'` / `'Bootstrap'` / etc.
 * @param fieldLabel   Used in warnings — `'mat-input'` / `'bs-input'` / etc.
 */
export async function runPresetAction(
  preset: AddonActionPreset,
  ctx: AddonActionContext,
  collaborators: PresetCollaborators,
  adapterLabel: string,
  fieldLabel: string,
): Promise<void> {
  // Guard against orphan dispatches — none of the built-in presets do
  // anything useful without a host field, except `copy` and `paste` which
  // only need the clipboard API. The canonical discriminant per the
  // `AddonActionContext` discriminated union is `ctx.form` — non-null on
  // the field-bound variant, null on the orphan variant. `field.key` was
  // unreliable for nested-array scenarios where keys can legitimately be
  // empty strings.
  if (ctx.form === null && preset !== 'copy' && preset !== 'paste') {
    collaborators.logger.warn(`preset '${String(preset)}' fired without a host field context — ignoring.`);
    return;
  }

  switch (preset) {
    case 'clear': {
      // Preserve type semantics: strings clear to `''` (browser-friendly for
      // input.value), everything else clears to `undefined` (numeric / object
      // / date fields would otherwise become a string and break their type).
      const next = typeof ctx.value === 'string' ? '' : undefined;
      collaborators.fieldValueSetter?.(next);
      return;
    }

    case 'reset': {
      const defaultValue = collaborators.fieldDefaultValueGetter?.();
      collaborators.fieldValueSetter?.(defaultValue !== undefined ? defaultValue : typeof ctx.value === 'string' ? '' : undefined);
      return;
    }

    case 'paste': {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        collaborators.logger.warn(`preset 'paste' requires a browser clipboard API (not available in this environment).`);
        return;
      }
      try {
        const text = await navigator.clipboard.readText();
        collaborators.fieldValueSetter?.(text);
      } catch (error) {
        collaborators.logger.warn(`preset 'paste' clipboard read failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }

    case 'copy': {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        collaborators.logger.warn(`preset 'copy' requires a browser clipboard API (not available in this environment).`);
        return;
      }
      try {
        // Explicit null check — `String(null) === 'null'` would write the
        // literal string "null" to the clipboard.
        const v = ctx.value;
        await navigator.clipboard.writeText(v == null ? '' : String(v));
      } catch (error) {
        collaborators.logger.warn(`preset 'copy' clipboard write failed: ${error instanceof Error ? error.message : String(error)}`);
      }
      return;
    }

    case 'toggle-password-visibility': {
      const override = collaborators.typeOverride;
      if (!override) {
        collaborators.logger.warn(`preset 'toggle-password-visibility' has no effect outside a '${fieldLabel}' field.`);
        return;
      }
      // Refuse to flip non-password inputs. Re-check on EVERY dispatch (not
      // just when override is undefined) because `props().type` can change
      // reactively after the first toggle — e.g., 'password' → 'email'. Once
      // the override is touched, only the override is canonical for the
      // current visible/hidden state; the baseline still gates whether
      // toggling makes semantic sense for this field.
      const baseline = collaborators.baselineType?.();
      if (baseline !== undefined && baseline !== 'password') {
        collaborators.logger.warn(
          `preset 'toggle-password-visibility' refused: host '${fieldLabel}' has type '${baseline}', not 'password'.`,
        );
        return;
      }
      const current = override();
      override.set(current === 'text' ? 'password' : 'text');
      return;
    }

    default:
      collaborators.logger.warn(`preset '${String(preset)}' is not implemented in the ${adapterLabel} adapter.`);
  }
}

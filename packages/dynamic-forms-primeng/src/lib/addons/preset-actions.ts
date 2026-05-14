import { WritableSignal } from '@angular/core';
import type { AddonActionContext, AddonActionPreset } from '@ng-forge/dynamic-forms';
import type { Logger } from '@ng-forge/dynamic-forms';

/**
 * Optional collaborators a preset may need beyond the base context. Passed
 * by the button kind component which has access to its own DI scope.
 */
export interface PresetCollaborators {
  /** Per-field input-type override signal — populated only inside `prime-input`. */
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
  /** Logger for warnings about presets that can't be fulfilled in this context. */
  readonly logger: Logger;
}

/**
 * Apply a preset action against the addon's host field.
 *
 * Handles the universal presets shipped by core. Presets that require
 * adapter-specific UI mechanics (clipboard, type override) are best-effort
 * — they no-op with a warning when the necessary collaborator isn't
 * available (e.g., toggle-password-visibility outside an input field).
 */
export async function runPiPresetAction(
  preset: AddonActionPreset,
  ctx: AddonActionContext,
  collaborators: PresetCollaborators,
): Promise<void> {
  switch (preset) {
    case 'clear':
      collaborators.fieldValueSetter?.('');
      return;

    case 'reset': {
      // Restore to the field's configured default when the host field
      // exposes one (via FIELD_SIGNAL_CONTEXT.defaultValues); fall back to
      // empty when no default is reachable (e.g., addon rendered outside an
      // active field context).
      const defaultValue = collaborators.fieldDefaultValueGetter?.();
      collaborators.fieldValueSetter?.(defaultValue !== undefined ? defaultValue : '');
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
        collaborators.logger.warn(`preset 'paste' clipboard read failed: ${String(error)}`);
      }
      return;
    }

    case 'copy': {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        collaborators.logger.warn(`preset 'copy' requires a browser clipboard API (not available in this environment).`);
        return;
      }
      try {
        await navigator.clipboard.writeText(String(ctx.value ?? ''));
      } catch (error) {
        collaborators.logger.warn(`preset 'copy' clipboard write failed: ${String(error)}`);
      }
      return;
    }

    case 'toggle-password-visibility': {
      const override = collaborators.typeOverride;
      if (!override) {
        collaborators.logger.warn(`preset 'toggle-password-visibility' has no effect outside a 'prime-input' field.`);
        return;
      }
      const current = override();
      override.set(current === 'text' ? 'password' : 'text');
      return;
    }

    default:
      collaborators.logger.warn(`preset '${String(preset)}' is not implemented in the PrimeNG adapter.`);
  }
}

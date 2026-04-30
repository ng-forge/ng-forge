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
  /** Reactive view of the field's current value (when modifiable). */
  readonly fieldValueSetter?: (next: unknown) => void;
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

    case 'reset':
      // No-default-restore today — empties the field, mirroring 'clear'.
      // Restoring the configured default value requires `FormStateManager`
      // integration; tracked as follow-up work. Documented in the addon
      // README so users picking 'reset' for "restore default" aren't
      // surprised.
      collaborators.fieldValueSetter?.('');
      return;

    case 'paste': {
      try {
        const text = await navigator.clipboard.readText();
        collaborators.fieldValueSetter?.(text);
      } catch (error) {
        collaborators.logger.warn(`preset 'paste' clipboard read failed: ${String(error)}`);
      }
      return;
    }

    case 'copy': {
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

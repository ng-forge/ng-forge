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
      // Reset to empty for now — full default-value restoration is field-internal
      // and would require coupling to FormStateManager. Acceptable MVP behaviour.
      collaborators.fieldValueSetter?.('');
      return;

    case 'submit':
      // Delegated to the form's existing submit pipeline by dispatching from
      // the host field. The button-as-submit pattern is normally handled by
      // the dedicated submit field; here we no-op with a hint.
      collaborators.logger.warn(
        `[Dynamic Forms] preset 'submit' on a button addon is not directly supported — ` + `use a 'submit' field type instead.`,
      );
      return;

    case 'paste': {
      try {
        const text = await navigator.clipboard.readText();
        collaborators.fieldValueSetter?.(text);
      } catch (error) {
        collaborators.logger.warn(`[Dynamic Forms] preset 'paste' clipboard read failed: ${String(error)}`);
      }
      return;
    }

    case 'copy': {
      try {
        await navigator.clipboard.writeText(String(ctx.value ?? ''));
      } catch (error) {
        collaborators.logger.warn(`[Dynamic Forms] preset 'copy' clipboard write failed: ${String(error)}`);
      }
      return;
    }

    case 'toggle-password-visibility': {
      const override = collaborators.typeOverride;
      if (!override) {
        collaborators.logger.warn(`[Dynamic Forms] preset 'toggle-password-visibility' has no effect outside a 'prime-input' field.`);
        return;
      }
      const current = override();
      override.set(current === 'text' ? 'password' : 'text');
      return;
    }

    default:
      collaborators.logger.warn(`[Dynamic Forms] preset '${String(preset)}' is not implemented in the PrimeNG adapter.`);
  }
}

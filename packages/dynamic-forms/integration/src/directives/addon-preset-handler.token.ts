import { InjectionToken } from '@angular/core';
import { AddonActionContext } from '@ng-forge/dynamic-forms';

/**
 * Adapter-supplied resolver for `preset` addon actions (e.g., `'clear'`,
 * `'toggle-password-visibility'`). The universal click-dispatch directive
 * (`NgForgeAddonAction`) delegates to this when an addon configures a
 * `preset`; the adapter wires concrete preset semantics in its own
 * provider scope.
 */
export interface AddonPresetHandler {
  run(preset: string, ctx: AddonActionContext): void | Promise<void>;
}

export const ADDON_PRESET_HANDLER = new InjectionToken<AddonPresetHandler>('ADDON_PRESET_HANDLER');

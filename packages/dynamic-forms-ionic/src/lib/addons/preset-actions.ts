import type { AddonActionContext, AddonActionPreset, PresetCollaborators } from '@ng-forge/dynamic-forms';
import { runPresetAction } from '@ng-forge/dynamic-forms';

export type { PresetCollaborators };

/** Ionic adapter binding for the shared preset runner. */
export function runIonicPresetAction(
  preset: AddonActionPreset,
  ctx: AddonActionContext,
  collaborators: PresetCollaborators,
): Promise<void> {
  return runPresetAction(preset, ctx, collaborators, 'Ionic', 'ion-input');
}

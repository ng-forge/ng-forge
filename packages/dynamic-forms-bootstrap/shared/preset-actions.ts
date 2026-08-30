import type { AddonActionContext, AddonActionPreset } from '@ng-forge/dynamic-forms';
import { runPresetAction, type PresetCollaborators } from '@ng-forge/dynamic-forms/integration';

export type { PresetCollaborators };

/** Bootstrap adapter binding for the shared preset runner. */
export function runBsPresetAction(
  preset: AddonActionPreset,
  context: AddonActionContext,
  collaborators: PresetCollaborators,
): Promise<void> {
  return runPresetAction(preset, context, collaborators, 'Bootstrap', 'bs-input');
}

import type { AddonActionContext, AddonActionPreset } from '@ng-forge/dynamic-forms';
import { runPresetAction, type PresetCollaborators } from '@ng-forge/dynamic-forms/integration';

export type { PresetCollaborators };

/** Material adapter binding for the shared preset runner. */
export function runMatPresetAction(
  preset: AddonActionPreset,
  context: AddonActionContext,
  collaborators: PresetCollaborators,
): Promise<void> {
  return runPresetAction(preset, context, collaborators, 'Material', 'mat-input');
}

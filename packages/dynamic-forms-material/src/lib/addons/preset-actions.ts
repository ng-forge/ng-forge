import type { AddonActionContext, AddonActionPreset } from '@ng-forge/dynamic-forms';
import type { PresetCollaborators } from '@ng-forge/dynamic-forms/integration';
import { runPresetAction } from '@ng-forge/dynamic-forms/integration';

export type { PresetCollaborators };

/** Material adapter binding for the shared preset runner. */
export function runMatPresetAction(preset: AddonActionPreset, ctx: AddonActionContext, collaborators: PresetCollaborators): Promise<void> {
  return runPresetAction(preset, ctx, collaborators, 'Material', 'mat-input');
}

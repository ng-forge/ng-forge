import type { AddonActionContext, AddonActionPreset, PresetCollaborators } from '@ng-forge/dynamic-forms';
import { runPresetAction } from '@ng-forge/dynamic-forms';

export type { PresetCollaborators };

/** Material adapter binding for the shared preset runner. */
export function runMatPresetAction(preset: AddonActionPreset, ctx: AddonActionContext, collaborators: PresetCollaborators): Promise<void> {
  return runPresetAction(preset, ctx, collaborators, 'Material', 'mat-input');
}

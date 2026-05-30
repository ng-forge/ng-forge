import type { AddonActionContext, AddonActionPreset } from '@ng-forge/dynamic-forms';
import type { PresetCollaborators } from '@ng-forge/dynamic-forms/integration';
import { runPresetAction } from '@ng-forge/dynamic-forms/integration';

export type { PresetCollaborators };

/** PrimeNG adapter binding for the shared preset runner. */
export function runPrimePresetAction(
  preset: AddonActionPreset,
  ctx: AddonActionContext,
  collaborators: PresetCollaborators,
): Promise<void> {
  return runPresetAction(preset, ctx, collaborators, 'PrimeNG', 'prime-input');
}

import { isSignal, Signal, untracked } from '@angular/core';

/**
 * Resolves a record of external-data signals to their current values without
 * establishing reactive dependencies.
 *
 * @internal
 */
export function resolveExternalData(
  externalDataSignal: Signal<Record<string, Signal<unknown>> | undefined> | undefined,
): Record<string, unknown> | undefined {
  const externalDataRecord = untracked(() => externalDataSignal?.());

  if (!externalDataRecord) return undefined;

  const resolved: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(externalDataRecord)) {
    if (isSignal(value)) {
      resolved[key] = untracked(() => value());
    } else {
      resolved[key] = value;
    }
  }

  return resolved;
}

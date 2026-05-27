/**
 * Shared shape for DI-scoped warning trackers that dedupe log output.
 *
 * @internal
 */
export interface WarningTracker {
  warnedKeys: Set<string>;
}

/**
 * Creates a fresh warning tracker instance with an empty key set.
 * DI-scoped per form instance — never module-scoped (SSR-unsafe).
 *
 * @internal
 */
export function createWarningTracker(): WarningTracker {
  return { warnedKeys: new Set<string>() };
}

/**
 * Shared shape for DI-scoped warning trackers that dedupe log output.
 *
 * Used by both the derivation-warning tracker (keys are field paths) and the
 * deprecation-warning tracker (keys are deprecation IDs). The property is
 * generic so the same shape works for any string-keyed warning domain.
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

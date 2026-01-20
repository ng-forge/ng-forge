import { inject, Injectable } from '@angular/core';
import { DEFAULT_DEBOUNCE_MS } from '../../utils/debounce/debounce';
import { isArrayPlaceholderPath, extractArrayPath } from '../../utils/path-utils/path-utils';
import { DERIVATION_ENTRIES } from './derivation-tokens';
import { DerivationEntry } from './derivation-types';

/**
 * Provides lazy-computed lookup maps for derivation entries.
 *
 * Instead of pre-computing all lookup maps at collection time (which caused
 * hidden mutation and bloated the DerivationCollection god object), this class
 * computes maps lazily on first access and caches them.
 *
 * @example
 * ```typescript
 * const lookup = inject(DerivationLookup);
 *
 * // Lazy-computed on first access
 * const entriesForQuantity = lookup.byDependency.get('quantity');
 * const onChangeEntries = lookup.getOnChangeEntries();
 * ```
 */
@Injectable()
export class DerivationLookup {
  private readonly entriesSignal = inject(DERIVATION_ENTRIES);

  // Track the entries array reference to auto-invalidate on change
  private _cachedEntriesRef?: DerivationEntry[];

  // Cached lookup maps (built lazily on first access)
  private _byTarget?: Map<string, DerivationEntry[]>;
  private _bySource?: Map<string, DerivationEntry[]>;
  private _byDependency?: Map<string, DerivationEntry[]>;
  private _byArrayPath?: Map<string, DerivationEntry[]>;
  private _wildcardEntries?: DerivationEntry[];
  private _onChangeEntries?: DerivationEntry[];
  private _debouncedEntriesByMs?: Map<number, DerivationEntry[]>;

  /**
   * Current derivation entries (from signal).
   * Auto-invalidates cache if entries reference changed.
   */
  get entries(): DerivationEntry[] {
    const currentEntries = this.entriesSignal();

    // Auto-invalidate if entries reference changed (schema was updated)
    if (this._cachedEntriesRef !== currentEntries) {
      this.invalidateCache();
      this._cachedEntriesRef = currentEntries;
    }

    return currentEntries;
  }

  /**
   * Map of target field key to entries that modify it.
   * Used for quick lookup when processing derivations.
   */
  get byTarget(): Map<string, DerivationEntry[]> {
    return (this._byTarget ??= this.buildByTargetMap());
  }

  /**
   * Map of source field key to entries defined on it.
   * Used for finding derivations when a field's value changes.
   */
  get bySource(): Map<string, DerivationEntry[]> {
    return (this._bySource ??= this.buildBySourceMap());
  }

  /**
   * Map of dependency field key to entries that depend on it.
   * Used for efficient O(1) lookup when filtering by changed fields.
   */
  get byDependency(): Map<string, DerivationEntry[]> {
    return (this._byDependency ??= this.buildByDependencyMap());
  }

  /**
   * Map of array path to entries that derive array item values.
   * Used for O(1) lookup when an array field changes.
   */
  get byArrayPath(): Map<string, DerivationEntry[]> {
    return (this._byArrayPath ??= this.buildByArrayPathMap());
  }

  /**
   * Entries that have wildcard (*) dependency.
   * These entries depend on all form values and must always be considered.
   */
  get wildcardEntries(): DerivationEntry[] {
    return (this._wildcardEntries ??= this.buildWildcardEntries());
  }

  /**
   * Gets entries that should be processed based on changed fields.
   *
   * Uses O(k) lookup via indexed maps instead of O(n*m) filter,
   * where k = number of changed fields, n = total entries, m = avg deps per entry.
   */
  getEntriesForChangedFields(changedFields: Set<string>): DerivationEntry[] {
    const entrySet = new Set<DerivationEntry>();

    // Add entries triggered by each changed field via byDependency map
    for (const fieldKey of changedFields) {
      const entries = this.byDependency.get(fieldKey);
      if (entries) {
        for (const entry of entries) {
          entrySet.add(entry);
        }
      }

      // Check if this changed field is an array path - O(1) lookup
      const arrayEntries = this.byArrayPath.get(fieldKey);
      if (arrayEntries) {
        for (const entry of arrayEntries) {
          entrySet.add(entry);
        }
      }
    }

    // Add all wildcard entries - O(w) where w = number of wildcard entries
    for (const entry of this.wildcardEntries) {
      entrySet.add(entry);
    }

    return Array.from(entrySet);
  }

  /**
   * Gets entries with trigger 'onChange' (or no trigger, which defaults to onChange).
   */
  getOnChangeEntries(): DerivationEntry[] {
    return (this._onChangeEntries ??= this.entries.filter((e) => e.trigger !== 'debounced'));
  }

  /**
   * Gets entries with trigger 'debounced' for a specific debounce period.
   */
  getDebouncedEntries(debounceMs: number): DerivationEntry[] {
    if (!this._debouncedEntriesByMs) {
      this._debouncedEntriesByMs = this.buildDebouncedEntriesMap();
    }
    return this._debouncedEntriesByMs.get(debounceMs) ?? [];
  }

  /**
   * Gets all unique debounce periods that have entries.
   */
  getDebouncePeriods(): number[] {
    if (!this._debouncedEntriesByMs) {
      this._debouncedEntriesByMs = this.buildDebouncedEntriesMap();
    }
    return Array.from(this._debouncedEntriesByMs.keys());
  }

  /**
   * Invalidates cached maps. Call this when entries change.
   */
  invalidateCache(): void {
    this._byTarget = undefined;
    this._bySource = undefined;
    this._byDependency = undefined;
    this._byArrayPath = undefined;
    this._wildcardEntries = undefined;
    this._onChangeEntries = undefined;
    this._debouncedEntriesByMs = undefined;
  }

  // ─────────────────────────────────────────────────────────────────
  // Private builders
  // ─────────────────────────────────────────────────────────────────

  private buildByTargetMap(): Map<string, DerivationEntry[]> {
    const map = new Map<string, DerivationEntry[]>();
    for (const entry of this.entries) {
      const targetEntries = map.get(entry.targetFieldKey) ?? [];
      targetEntries.push(entry);
      map.set(entry.targetFieldKey, targetEntries);
    }
    return map;
  }

  private buildBySourceMap(): Map<string, DerivationEntry[]> {
    const map = new Map<string, DerivationEntry[]>();
    for (const entry of this.entries) {
      const sourceEntries = map.get(entry.sourceFieldKey) ?? [];
      sourceEntries.push(entry);
      map.set(entry.sourceFieldKey, sourceEntries);
    }
    return map;
  }

  private buildByDependencyMap(): Map<string, DerivationEntry[]> {
    const map = new Map<string, DerivationEntry[]>();
    for (const entry of this.entries) {
      for (const dep of entry.dependsOn) {
        if (dep !== '*') {
          const depEntries = map.get(dep) ?? [];
          depEntries.push(entry);
          map.set(dep, depEntries);
        }
      }
    }
    return map;
  }

  private buildByArrayPathMap(): Map<string, DerivationEntry[]> {
    const map = new Map<string, DerivationEntry[]>();
    for (const entry of this.entries) {
      if (isArrayPlaceholderPath(entry.targetFieldKey)) {
        const arrayPath = extractArrayPath(entry.targetFieldKey);
        if (arrayPath) {
          const arrayEntries = map.get(arrayPath) ?? [];
          arrayEntries.push(entry);
          map.set(arrayPath, arrayEntries);
        }
      }
    }
    return map;
  }

  private buildWildcardEntries(): DerivationEntry[] {
    return this.entries.filter((entry) => entry.dependsOn.includes('*'));
  }

  private buildDebouncedEntriesMap(): Map<number, DerivationEntry[]> {
    const map = new Map<number, DerivationEntry[]>();
    for (const entry of this.entries) {
      if (entry.trigger === 'debounced') {
        const ms = entry.debounceMs ?? DEFAULT_DEBOUNCE_MS;
        const group = map.get(ms) ?? [];
        group.push(entry);
        map.set(ms, group);
      }
    }
    return map;
  }
}

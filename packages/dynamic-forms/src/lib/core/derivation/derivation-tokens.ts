import { InjectionToken, Signal } from '@angular/core';
import { DerivationEntry } from './derivation-types';

/**
 * Injection token for the collected derivation entries.
 *
 * Provided at form level, contains the topologically sorted entries
 * after validation. This is the "core data" that other derivation
 * components consume.
 *
 * @example
 * ```typescript
 * // In a component or service
 * private readonly entries = inject(DERIVATION_ENTRIES);
 *
 * // Access the current entries
 * const currentEntries = this.entries();
 * ```
 */
export const DERIVATION_ENTRIES = new InjectionToken<Signal<DerivationEntry[]>>('DerivationEntries');

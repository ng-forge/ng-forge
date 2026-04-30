import { Signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Generic reactive value — a static value, an Angular Signal, or an RxJS Observable.
 *
 * Generalises {@link DynamicText} for arbitrary value types. Used by
 * cross-cutting properties that need to react to form state without forcing
 * every consumer to deal with reactivity (e.g., `hidden` / `disabled` on
 * addons).
 *
 * @example
 * ```typescript
 * const a: DynamicValue<boolean> = true;
 * const b: DynamicValue<boolean> = signal(false);
 * const c: DynamicValue<boolean> = isValid$;
 * ```
 */
export type DynamicValue<T> = T | Signal<T> | Observable<T>;

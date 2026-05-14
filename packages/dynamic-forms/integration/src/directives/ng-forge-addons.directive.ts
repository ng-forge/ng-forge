import { computed, Directive, inject, Injector, input, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { AnyAddon, resolveDynamicValue } from '@ng-forge/dynamic-forms';
import type { AssertTupleLockstep } from './assert-input-lockstep';

/**
 * Composable directive owning the universal addon-array plumbing every
 * adapter field needs once it opts into addons: signal-cached `hidden`
 * resolution and slot bucketing.
 *
 * Pair with `NgForgeFieldHost` (or `NgForgeActionHost`) via `hostDirectives`
 * and read the resolved signals through `injectNgForgeAddons<TAddon>()`.
 * Adapter-specific markup (`<p-inputgroup>`, `<mat-form-field>` slots,
 * `.input-group`, Ionic `slot="start"`/`"end"`) stays in the field component.
 *
 * The `fieldInputs` bag forwarded to each `<df-addon-slot>` is the host's
 * own concern — declare it as a class input on the component (so
 * `DfFieldOutlet.pushRawInputs` via `setInputIfDeclared` can write it
 * through `reflectComponentType`).
 *
 * @example
 * ```ts
 * \@Component({
 *   hostDirectives: [NgForgeFieldHost, NgForgeAddons],
 *   template: `
 *     @if (ngfa.hasAddons()) {
 *       <p-inputgroup>
 *         @for (a of ngfa.prefixAddons(); track $index) {
 *           <df-addon-slot [addon]="a" [hidden]="ngfa.hiddenSignalCache().get(a)" />
 *         }
 *         <input ngForgeControl ... />
 *       </p-inputgroup>
 *     }
 *   `,
 * })
 * export class MyInputField {
 *   protected readonly ngfa = injectNgForgeAddons<MyInputAddon>();
 * }
 * ```
 */
@Directive({})
export class NgForgeAddons {
  /** Capture the host's injector so `toSignal` (inside `resolveDynamicValue`) ties to the host's `DestroyRef`. */
  private readonly hostInjector = inject(Injector);

  /** Addon array mapped from `FieldDef.addons` by `buildBaseInputs`. */
  readonly addons = input<ReadonlyArray<AnyAddon> | undefined>(undefined);

  /**
   * Per-addon `hidden` signal cache. Each Observable-typed `hidden` is
   * subscribed at most once per addon. Built via `explicitEffect` rather
   * than `computed` because `toSignal` (called inside `resolveDynamicValue`
   * for Observable inputs) is disallowed in reactive contexts (NG0602).
   */
  private readonly _hiddenSignalCache = signal<ReadonlyMap<AnyAddon, Signal<boolean>>>(new Map());
  readonly hiddenSignalCache: Signal<ReadonlyMap<AnyAddon, Signal<boolean>>> = this._hiddenSignalCache.asReadonly();

  /** Addons whose resolved `hidden` evaluates to `false`. */
  readonly visibleAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => {
    const list = this.addons() ?? [];
    const cache = this.hiddenSignalCache();
    return list.filter((a) => !(cache.get(a)?.() ?? false));
  });

  /** `true` when at least one addon is visible — gate adapter wrapper markup on this. */
  readonly hasAddons: Signal<boolean> = computed(() => this.visibleAddons().length > 0);

  /** Visible addons with `slot === 'prefix'`. */
  readonly prefixAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => this.visibleAddons().filter((a) => a.slot === 'prefix'));

  /** Visible addons with `slot === 'suffix'`. */
  readonly suffixAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => this.visibleAddons().filter((a) => a.slot === 'suffix'));

  /**
   * Visible addons grouped by their `slot` string. Convenience view for
   * adapters with non-universal slots (e.g., Ionic `start` / `end`) — the
   * universal `prefixAddons` / `suffixAddons` cover the common case.
   */
  readonly addonsBySlot: Signal<ReadonlyMap<string, ReadonlyArray<AnyAddon>>> = computed(() => {
    const map = new Map<string, AnyAddon[]>();
    for (const a of this.visibleAddons()) {
      const bucket = map.get(a.slot) ?? [];
      bucket.push(a);
      map.set(a.slot, bucket);
    }
    return map as ReadonlyMap<string, ReadonlyArray<AnyAddon>>;
  });

  constructor() {
    // Rebuild the cache whenever the addons array changes by identity.
    // Runs synchronously on each change so consumers reading
    // `hiddenSignalCache()` immediately see the new entries.
    explicitEffect([this.addons], ([list]) => {
      const map = new Map<AnyAddon, Signal<boolean>>();
      for (const a of list ?? []) {
        map.set(a, resolveDynamicValue(a.hidden, false, this.hostInjector));
      }
      this._hiddenSignalCache.set(map);
    });
  }
}

/**
 * Inputs forwarded onto `NgForgeAddons` via `hostDirectives`. Most adapter
 * authors don't need to reference this directly — add `NgForgeAddons` to
 * the component's `hostDirectives` array directly.
 */
export const NG_FORGE_ADDONS_INPUTS = ['addons'] as const;

// Compile-time lockstep: NG_FORGE_ADDONS_INPUTS must equal the declared
// `input()` properties on NgForgeAddons. Drift in either direction fails the build.
const _NG_FORGE_ADDONS_INPUTS_LOCKSTEP: AssertTupleLockstep<NgForgeAddons, typeof NG_FORGE_ADDONS_INPUTS, 'NG_FORGE_ADDONS_INPUTS'> = true;
void _NG_FORGE_ADDONS_INPUTS_LOCKSTEP;

/**
 * `NgForgeAddons` typed for a specific addon union. Same cast-narrowing
 * pattern as `injectNgForgeField<T>()` — the directive stores `addons` as
 * `Signal<ReadonlyArray<AnyAddon> | undefined>` at runtime; this type
 * narrows the array element type at the inject site.
 */
export type TypedNgForgeAddons<TAddon extends AnyAddon = AnyAddon> = Omit<
  NgForgeAddons,
  'addons' | 'visibleAddons' | 'prefixAddons' | 'suffixAddons'
> & {
  readonly addons: Signal<ReadonlyArray<TAddon> | undefined>;
  readonly visibleAddons: Signal<ReadonlyArray<TAddon>>;
  readonly prefixAddons: Signal<ReadonlyArray<TAddon>>;
  readonly suffixAddons: Signal<ReadonlyArray<TAddon>>;
};

/**
 * Typed wrapper around `inject(NgForgeAddons)`. The generic narrows
 * `addons` (and the visibility-filtered views) to the calling field's
 * addon union for IDE narrowing in templates. The cast is unchecked — the
 * runtime contract is that mappers forward an `addons` array whose
 * elements match the field-type definition.
 */
export function injectNgForgeAddons<TAddon extends AnyAddon = AnyAddon>(): TypedNgForgeAddons<TAddon> {
  return inject(NgForgeAddons) as unknown as TypedNgForgeAddons<TAddon>;
}

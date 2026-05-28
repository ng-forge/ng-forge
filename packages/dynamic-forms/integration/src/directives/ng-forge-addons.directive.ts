import { computed, Directive, inject, Injector, input, Signal, signal } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { AnyAddon, resolveDynamicValue } from '@ng-forge/dynamic-forms';
import type { AssertTupleLockstep } from './assert-input-lockstep';

/**
 * Universal addon-array plumbing: signal-cached `hidden` resolution and
 * slot bucketing. Used internally by the `NgForgeAddons` host wrapper —
 * consumers should compose `NgForgeAddons` directly and inject the
 * directive instance via `injectNgForgeAddons<TAddon>()`.
 */
@Directive({})
export class NgForgeAddonsBase {
  /** Capture the host's injector so `toSignal` (inside `resolveDynamicValue`) ties to the host's `DestroyRef`. */
  private readonly hostInjector = inject(Injector);

  /** Addon array mapped from `FieldDef.addons` by `buildBaseInputs`. */
  readonly addons = input<ReadonlyArray<AnyAddon> | undefined>(undefined);

  /**
   * Per-addon `hidden` signal cache. Built via `explicitEffect` rather
   * than `computed` because `toSignal` (inside `resolveDynamicValue` for
   * Observable inputs) is disallowed in reactive contexts (NG0602).
   */
  private readonly _hiddenSignalCache = signal<ReadonlyMap<AnyAddon, Signal<boolean>>>(new Map());
  readonly hiddenSignalCache: Signal<ReadonlyMap<AnyAddon, Signal<boolean>>> = this._hiddenSignalCache.asReadonly();

  readonly visibleAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => {
    const list = this.addons() ?? [];
    const cache = this.hiddenSignalCache();
    return list.filter((a) => !(cache.get(a)?.() ?? false));
  });

  readonly hasAddons: Signal<boolean> = computed(() => this.visibleAddons().length > 0);
  readonly prefixAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => this.visibleAddons().filter((a) => a.slot === 'prefix'));
  readonly suffixAddons: Signal<ReadonlyArray<AnyAddon>> = computed(() => this.visibleAddons().filter((a) => a.slot === 'suffix'));

  /**
   * Visible addons grouped by their `slot` string. Convenience view for
   * adapters with non-universal slots (e.g., Ionic `start` / `end`).
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

  /** Secondary index keyed by `hidden` value identity. Catches the common case
   *  where a FormConfig re-emit produces structurally-different-but-content-
   *  identical addon objects — without this, every re-emit would spawn a new
   *  `toSignal` subscription for each addon's hidden axis. */
  private readonly _hiddenByValue = new WeakMap<object, Signal<boolean>>();

  constructor() {
    explicitEffect([this.addons], ([list]) => {
      const prev = this._hiddenSignalCache();
      const next = new Map<AnyAddon, Signal<boolean>>();
      for (const a of list ?? []) {
        // Tier 1: reference identity — the cheapest hit when the same addon
        // object is reused across emissions.
        let resolved = prev.get(a);
        if (!resolved) {
          // Tier 2: hidden-value identity — when `hidden` is an object
          // (Signal / Observable / function), the same instance can be passed
          // through multiple new addon objects on FormConfig re-emit.
          const h = a.hidden;
          const valueKey = typeof h === 'object' && h !== null ? h : null;
          resolved = valueKey ? this._hiddenByValue.get(valueKey) : undefined;
          if (!resolved) {
            resolved = resolveDynamicValue(a.hidden, false, this.hostInjector);
            if (valueKey) this._hiddenByValue.set(valueKey, resolved);
          }
        }
        next.set(a, resolved);
      }
      this._hiddenSignalCache.set(next);
    });
  }
}

/** Forwarded onto `NgForgeAddonsBase` via the `NgForgeAddons` wrapper. */
export const NG_FORGE_ADDONS_INPUTS = ['addons'] as const;

// Compile-time lockstep — drift between the tuple and the declared inputs fails the build.
const _NG_FORGE_ADDONS_INPUTS_LOCKSTEP: AssertTupleLockstep<NgForgeAddonsBase, typeof NG_FORGE_ADDONS_INPUTS, 'NG_FORGE_ADDONS_INPUTS'> =
  true;
void _NG_FORGE_ADDONS_INPUTS_LOCKSTEP;

/**
 * Host wrapper for `NgForgeAddonsBase`. Consumers compose this directly:
 *
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
 *
 * The wrapper exists so `hostDirectives: [NgForgeAddons]` resolves
 * cross-package — same constraint that drives `NgForgeFieldHost`.
 */
@Directive({
  hostDirectives: [{ directive: NgForgeAddonsBase, inputs: [...NG_FORGE_ADDONS_INPUTS] }],
})
export class NgForgeAddons {}

/** Narrowed view of `NgForgeAddonsBase` returned by `injectNgForgeAddons<TAddon>()`. */
export type TypedNgForgeAddons<TAddon extends AnyAddon = AnyAddon> = Omit<
  NgForgeAddonsBase,
  'addons' | 'visibleAddons' | 'prefixAddons' | 'suffixAddons'
> & {
  readonly addons: Signal<ReadonlyArray<TAddon> | undefined>;
  readonly visibleAddons: Signal<ReadonlyArray<TAddon>>;
  readonly prefixAddons: Signal<ReadonlyArray<TAddon>>;
  readonly suffixAddons: Signal<ReadonlyArray<TAddon>>;
};

/**
 * Typed inject helper. Always resolves to the underlying
 * `NgForgeAddonsBase` instance — the wrapper class has no instance
 * fields of its own.
 */
export function injectNgForgeAddons<TAddon extends AnyAddon = AnyAddon>(): TypedNgForgeAddons<TAddon> {
  return inject(NgForgeAddonsBase) as unknown as TypedNgForgeAddons<TAddon>;
}

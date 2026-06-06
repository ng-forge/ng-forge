import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, Signal, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { AnyAddon } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { resolveDynamicValue } from '@ng-forge/dynamic-forms/internal';
import { injectAddonTypeRegistry } from '../utils/inject-addon-type-registry/inject-addon-type-registry';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';

/**
 * Dispatcher component that renders an addon by looking up its `type` in
 * `ADDON_TYPE_REGISTRY` and instantiating the registered component.
 */
@Component({
  selector: 'df-addon-slot',
  imports: [NgComponentOutlet],
  template: `
    @if (resolvedComponent(); as cmp) {
      <ng-container *ngComponentOutlet="cmp; inputs: typeInputs()" />
    }
  `,
  host: {
    '[attr.slot]': 'slotAttr()',
    '[class]': 'className()',
    '[style.display]': 'isHidden() ? "none" : null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DfAddonSlot {
  private readonly registry = injectAddonTypeRegistry();
  private readonly logger = inject(DynamicFormLogger);
  private readonly hostInjector = inject(Injector);

  readonly addon = input.required<AnyAddon>();
  /**
   * Optional read-only view of the host field's mapped inputs — same shape
   * wrappers receive (`field?: ReadonlyFieldTree`, `key`, `props`, etc.).
   * Forwarded to type components so they can read field state without
   * re-injecting `FIELD_SIGNAL_CONTEXT` and rebuilding context themselves.
   */
  readonly fieldInputs = input<WrapperFieldInputs | undefined>();
  /**
   * Pre-resolved `hidden` signal supplied by the host field. When provided,
   * the dispatcher reads this instead of re-resolving `addon.hidden` —
   * lets the host (e.g., `prime-input`) share a single subscription per
   * Observable-typed `hidden` between its own visibility filter and the
   * slot's `[style.display]` binding.
   */
  readonly hidden = input<Signal<boolean> | undefined>(undefined);

  /** `slot` HTML attribute forwarded to host — needed for Ionic shadow projection. */
  protected readonly slotAttr = computed(() => this.addon().slot);
  protected readonly className = computed(() => this.addon().className ?? null);

  /**
   * Locally-resolved `hidden` signal — always reflects `addon.hidden`
   * regardless of whether the host supplied a pre-resolved signal.
   * Populated via `explicitEffect` so `resolveDynamicValue` (which may call
   * `toSignal` for Observable-typed values) does NOT run inside a reactive
   * context (NG0602). The WeakMap caches per `hidden`-value identity, so
   * swapping `addon` inputs that share the same Observable reuses the
   * subscription instead of leaking a fresh one per swap.
   */
  private readonly _hiddenByValue = new WeakMap<object, Signal<boolean>>();
  private readonly _resolvedHidden = signal<Signal<boolean> | undefined>(undefined);

  /**
   * `hidden` resolved from `DynamicValue<boolean>` to a flat `Signal<boolean>`.
   * Prefers the host-supplied signal when present (avoids duplicate `toSignal`
   * subscriptions for Observable-typed `hidden`); falls back to the locally-
   * resolved signal, which is always populated by the addon-tracking effect.
   */
  protected readonly isHidden = computed(() => {
    const pre = this.hidden();
    if (pre) return pre();
    const local = this._resolvedHidden();
    return local ? local() : false;
  });

  /**
   * Latest async-loaded `{ type, component }` pair. Tagging the result with
   * its type lets `resolvedComponent` filter stale loads structurally — no
   * monotonic token needed. When `addon.type` changes mid-load, the prior
   * load still completes and writes here, but the computed ignores it
   * because the recorded type no longer matches the current one.
   */
  private readonly asyncLoaded = signal<{ type: string; component: Type<unknown> } | undefined>(undefined);

  /**
   * Resolved type component — composed declaratively from two sources of
   * truth: the registry's synchronous cache (warm hits, e.g., a second
   * `<df-addon-slot>` for an already-loaded type) and the type-tagged async
   * loader result. Reading `addon().type` first makes the computed react to
   * addon swaps and naturally invalidate stale async-load results.
   */
  protected readonly resolvedComponent = computed<Type<unknown> | undefined>(() => {
    const type = this.addon().type;
    const cached = this.registry.getLoadedTypeComponent(type);
    if (cached) return cached;
    const loaded = this.asyncLoaded();
    return loaded?.type === type ? loaded.component : undefined;
  });

  /** Inputs passed to the type component — addon plus the wrapper-style host bag. */
  protected readonly typeInputs = computed(() => ({
    addon: this.addon(),
    fieldInputs: this.fieldInputs(),
  }));

  constructor() {
    // Resolve `addon.hidden` outside any reactive context AND unconditionally —
    // the host-supplied signal is a perf hint, not a precondition. Keeping
    // `_resolvedHidden` always-fresh closes a race where `isHidden` could
    // return `false` between a host-`hidden` clear and the effect re-running.
    explicitEffect([this.addon], ([addon]) => {
      const h = addon.hidden;
      const valueKey = typeof h === 'object' && h !== null ? h : null;
      let resolved = valueKey ? this._hiddenByValue.get(valueKey) : undefined;
      if (!resolved) {
        resolved = resolveDynamicValue(addon.hidden, false, this.hostInjector);
        if (valueKey) this._hiddenByValue.set(valueKey, resolved);
      }
      this._resolvedHidden.set(resolved);
    });

    // Kick off async loads on cache miss. `resolvedComponent` filters stale
    // results by type identity, so this effect is a pure side-effect dispatcher.
    explicitEffect([this.addon], ([addon]) => {
      const type = addon.type;
      if (this.registry.getLoadedTypeComponent(type)) return; // sync path; computed picks it up
      this.registry
        .loadTypeComponent(type)
        .then((component) => this.asyncLoaded.set({ type, component }))
        .catch((error: unknown) => {
          this.logger.warn(
            `Failed to load addon type '${type}': ${error instanceof Error ? error.message : String(error)}. ` +
              `Registered types: ${this.registry.getTypeNames().join(', ') || '(none)'}.`,
          );
        });
    });
  }
}

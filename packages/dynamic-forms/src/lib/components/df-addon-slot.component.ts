import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Injector, input, Signal, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { AnyAddon } from '../models/addon/addon-def';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { resolveDynamicValue } from '../utils/dynamic-value/resolve-dynamic-value';
import { injectAddonKindRegistry } from '../utils/inject-addon-kind-registry/inject-addon-kind-registry';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

/**
 * Dispatcher component that renders an addon by looking up its `kind` in
 * `ADDON_KIND_REGISTRY` and instantiating the registered component.
 */
@Component({
  selector: 'df-addon-slot',
  imports: [NgComponentOutlet],
  template: `
    @if (resolvedComponent(); as cmp) {
      <ng-container *ngComponentOutlet="cmp; inputs: kindInputs()" />
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
  private readonly registry = injectAddonKindRegistry();
  private readonly logger = inject(DynamicFormLogger);
  private readonly hostInjector = inject(Injector);

  readonly addon = input.required<AnyAddon>();
  /**
   * Optional read-only view of the host field's mapped inputs — same shape
   * wrappers receive (`field?: ReadonlyFieldTree`, `key`, `props`, etc.).
   * Forwarded to kind components so they can read field state without
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
   * Latest async-loaded `{ kind, component }` pair. Tagging the result with
   * its kind lets `resolvedComponent` filter stale loads structurally — no
   * monotonic token needed. When `addon.kind` changes mid-load, the prior
   * load still completes and writes here, but the computed ignores it
   * because the recorded kind no longer matches the current one.
   */
  private readonly asyncLoaded = signal<{ kind: string; component: Type<unknown> } | undefined>(undefined);

  /**
   * Resolved kind component — composed declaratively from two sources of
   * truth: the registry's synchronous cache (warm hits, e.g., a second
   * `<df-addon-slot>` for an already-loaded kind) and the kind-tagged async
   * loader result. Reading `addon().kind` first makes the computed react to
   * addon swaps and naturally invalidate stale async-load results.
   */
  protected readonly resolvedComponent = computed<Type<unknown> | undefined>(() => {
    const kind = this.addon().kind;
    const cached = this.registry.getLoadedKindComponent(kind);
    if (cached) return cached;
    const loaded = this.asyncLoaded();
    return loaded?.kind === kind ? loaded.component : undefined;
  });

  /** Inputs passed to the kind component — addon plus the wrapper-style host bag. */
  protected readonly kindInputs = computed(() => ({
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
    // results by kind identity, so this effect is a pure side-effect dispatcher.
    explicitEffect([this.addon], ([addon]) => {
      const kind = addon.kind;
      if (this.registry.getLoadedKindComponent(kind)) return; // sync path; computed picks it up
      this.registry
        .loadKindComponent(kind)
        .then((component) => this.asyncLoaded.set({ kind, component }))
        .catch((error: unknown) => {
          this.logger.warn(
            `Failed to load addon kind '${kind}': ${error instanceof Error ? error.message : String(error)}. ` +
              `Registered kinds: ${this.registry.getKindNames().join(', ') || '(none)'}.`,
          );
        });
    });
  }
}

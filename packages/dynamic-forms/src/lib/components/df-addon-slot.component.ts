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
 *
 * Used by every adapter's field component to render slot content:
 *
 * ```html
 * \@for (a of addonsAt('prefix'); track $index) {
 *   <df-addon-slot [addon]="a" />
 * }
 * ```
 *
 * Behaviour:
 * - Resolves and caches the kind's component asynchronously on first render.
 * - Forwards the `slot` HTML attribute on the host so Ionic shadow-DOM
 *   projection works (`<ion-input>` projects children with `slot="start"`
 *   into its native start slot).
 * - Honours the addon's reactive `hidden` flag — when `true`, the host is
 *   `display: none` so it occupies no layout but stays in DOM (cheaper than
 *   tearing down the component).
 * - Forwards `className` to the host element.
 * - ARIA semantics are owned by individual kind components — decorative
 *   kinds (icons, text) set `aria-hidden="true"` on themselves; interactive
 *   kinds (buttons) handle their own `aria-label`.
 *
 * If the kind cannot be resolved (registry miss, load failure), the
 * dispatcher logs a warning and renders nothing — never throws. The
 * runtime addon validator should have caught unknown kinds at config init,
 * but this provides a defence-in-depth fallback for misconfigured registries.
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
   *
   * `undefined` when the addon is rendered outside a field (rare).
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
   * Locally-resolved `hidden` signal — populated via `explicitEffect` so
   * `resolveDynamicValue` (which may call `toSignal` for Observable-typed
   * hidden values) does NOT run inside a reactive context (`computed` /
   * `linkedSignal.computation` would throw NG0602). Mirrors the pattern in
   * `NgForgeAddonsBase` for the array case.
   *
   * The WeakMap dedupes by `hidden` value identity, so swapping addon
   * objects that share the same Observable instance reuses one
   * subscription instead of leaking a fresh one per emit.
   */
  private readonly _hiddenByValue = new WeakMap<object, Signal<boolean>>();
  private readonly _resolvedHidden = signal<Signal<boolean> | undefined>(undefined);

  /**
   * `hidden` resolved from `DynamicValue<boolean>` to a flat `Signal<boolean>`.
   * Uses the host-supplied signal when present (avoids duplicate `toSignal`
   * subscriptions for Observable-typed `hidden`); otherwise reads the
   * locally-resolved signal populated by the addon-tracking effect.
   */
  protected readonly isHidden = computed(() => {
    const pre = this.hidden();
    if (pre) return pre();
    const local = this._resolvedHidden();
    return local ? local() : false;
  });

  /** Kind component, resolved asynchronously from the registry. */
  private readonly resolvedComponentSignal = signal<Type<unknown> | undefined>(undefined);
  protected readonly resolvedComponent = this.resolvedComponentSignal.asReadonly();

  /** Inputs passed to the kind component — addon plus the wrapper-style host bag. */
  protected readonly kindInputs = computed(() => ({
    addon: this.addon(),
    fieldInputs: this.fieldInputs(),
  }));

  /** Monotonic load-token guards against stale promises winning when addon.kind changes mid-load. */
  private loadSeq = 0;

  constructor() {
    // Resolve `hidden` outside any reactive context. Skip when the host has
    // already supplied a pre-resolved signal (typical for input adapters).
    explicitEffect([this.addon, this.hidden], ([addon, hostHidden]) => {
      if (hostHidden) {
        this._resolvedHidden.set(undefined);
        return;
      }
      const h = addon.hidden;
      const valueKey = typeof h === 'object' && h !== null ? h : null;
      let resolved = valueKey ? this._hiddenByValue.get(valueKey) : undefined;
      if (!resolved) {
        resolved = resolveDynamicValue(addon.hidden, false, this.hostInjector);
        if (valueKey) this._hiddenByValue.set(valueKey, resolved);
      }
      this._resolvedHidden.set(resolved);
    });

    explicitEffect([this.addon], ([addon]) => {
      const cached = this.registry.getLoadedKindComponent(addon.kind);
      if (cached) {
        this.loadSeq++;
        this.resolvedComponentSignal.set(cached);
        return;
      }

      const seq = ++this.loadSeq;
      this.registry
        .loadKindComponent(addon.kind)
        .then((cmp) => {
          if (seq !== this.loadSeq) return;
          this.resolvedComponentSignal.set(cmp);
        })
        .catch((error: unknown) => {
          if (seq !== this.loadSeq) return;
          this.logger.warn(
            `Failed to load addon kind '${addon.kind}': ${String(error)}. ` +
              `Registered kinds: ${this.registry.getKindNames().join(', ') || '(none)'}.`,
          );
          this.resolvedComponentSignal.set(undefined);
        });
    });
  }
}

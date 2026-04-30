import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, Type } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { AnyAddon } from '../models/addon/addon-def';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { resolveDynamicValue } from '../utils/dynamic-value/resolve-dynamic-value';
import { injectAddonKindRegistry } from '../utils/inject-addon-kind-registry/inject-addon-kind-registry';

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

  readonly addon = input.required<AnyAddon>();

  /** `slot` HTML attribute forwarded to host — needed for Ionic shadow projection. */
  protected readonly slotAttr = computed(() => this.addon().slot);
  protected readonly className = computed(() => this.addon().className ?? null);

  /**
   * `hidden` resolved from `DynamicValue<boolean>` to a `Signal<boolean>`.
   * Re-resolves when the addon identity changes (e.g., reactive config update).
   */
  private readonly hiddenSignal = linkedSignal(() => resolveDynamicValue(this.addon().hidden, false));
  protected readonly isHidden = computed(() => this.hiddenSignal()());

  /** Kind component, resolved asynchronously from the registry. */
  private readonly resolvedComponentSignal = signal<Type<unknown> | undefined>(undefined);
  protected readonly resolvedComponent = this.resolvedComponentSignal.asReadonly();

  /** Inputs passed to the kind component — at minimum, the addon itself. */
  protected readonly kindInputs = computed(() => ({ addon: this.addon() }));

  constructor() {
    // Resolve component when addon.kind changes; cache hits return synchronously.
    explicitEffect([this.addon], ([addon]) => {
      const cached = this.registry.getLoadedKindComponent(addon.kind);
      if (cached) {
        this.resolvedComponentSignal.set(cached);
        return;
      }

      // Async path — load and cache.
      this.registry
        .loadKindComponent(addon.kind)
        .then((cmp) => this.resolvedComponentSignal.set(cmp))
        .catch((error: unknown) => {
          this.logger.warn(
            `[Dynamic Forms] Failed to load addon kind '${addon.kind}': ${String(error)}. ` +
              `Registered kinds: ${this.registry.getKindNames().join(', ') || '(none)'}.`,
          );
          this.resolvedComponentSignal.set(undefined);
        });
    });
  }
}

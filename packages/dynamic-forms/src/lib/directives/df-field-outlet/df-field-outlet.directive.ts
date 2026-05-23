import { computed, DestroyRef, Directive, EnvironmentInjector, inject, input, Signal, signal, Type, ViewContainerRef } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ResolvedField } from '../../utils/resolve-field/resolve-field';
import { WRAPPER_AUTO_ASSOCIATIONS } from '../../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../../models/field-signal-context.token';
import { createWrapperChainController } from '../../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE } from '../../core/field-tree-utils';
import { buildFieldInputs } from '../../utils/build-field-inputs/build-field-inputs';
import { WrapperFieldInputs } from '../../wrappers/wrapper-field-inputs';
import { FieldComponentSlot } from './field-component-slot';

/**
 * Structural directive that renders a `ResolvedField` with its effective
 * wrapper chain.
 *
 * Replaces `*ngComponentOutlet` in field-rendering templates. When the field
 * has no wrappers, the component is created directly at the outlet position
 * (no extra DOM nesting). When wrappers apply, they chain outermost-first and
 * the field renders in the innermost slot.
 *
 * Effective wrappers are merged from (outermost → innermost):
 * 1. `WrapperTypeDefinition.types` auto-associations for the field's `type`
 * 2. `FormConfig.defaultWrappers`
 * 3. Field-level `FieldDef.wrappers` (`null` = explicit opt-out; `[]` does not
 *    opt out — auto + defaults still apply)
 *
 * Wrapper config keys (minus `type`) are pushed as individual Angular inputs;
 * every wrapper also receives `fieldInputs` — a `WrapperFieldInputs` bag that
 * includes the field's mapper outputs and a `ReadonlyFieldTree` view of its
 * form state.
 *
 * Initial rendering is gated by `field.renderReady() && !field.hidden()` —
 * the directive waits until the mapper produces the required inputs AND the
 * field isn't hidden before instantiating the component. Once rendered:
 * - A transient `renderReady → false` does *not* tear the chain down; the
 *   controller keeps the mounted components alive and ignores the flicker.
 * - A `hidden → true` does *not* tear the chain down either; the controller
 *   applies a hide-class + `display: none` to the outermost wrapper's host so
 *   wrapper chrome (section headers, icons, hint copy) disappears alongside
 *   the field. Focus/caret state survive a subsequent re-show.
 * Only a structural change (wrappers or component class) triggers a rebuild.
 *
 * Imperative `ComponentRef` / `ViewContainerRef` lifecycle is encapsulated
 * in `FieldComponentSlot` — the directive itself is signal definitions
 * plus three method calls (`mountOrReuse`, `detach`, `destroyOnTeardown`).
 *
 * @example
 * ```html
 * \@for (field of resolvedFields(); track field.key) {
 *   <ng-container *dfFieldOutlet="field; environmentInjector: envInjector" />
 * }
 * ```
 */
@Directive({
  selector: '[dfFieldOutlet]',
})
export class DfFieldOutlet {
  // Named to match the structural directive microsyntax directly
  // (`*dfFieldOutlet="field; environmentInjector: env"`) so no aliasing is needed.
  readonly dfFieldOutlet = input.required<ResolvedField>();
  readonly dfFieldOutletEnvironmentInjector = input<EnvironmentInjector | undefined>(undefined);

  private readonly vcrRef = inject(ViewContainerRef);
  private readonly vcr: Signal<ViewContainerRef> = signal(this.vcrRef).asReadonly();
  private readonly destroyRef = inject(DestroyRef);
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly readonlyFieldCache = inject(READONLY_FIELD_TREE_CACHE);

  /** Encapsulates Angular's imperative ComponentRef / ViewContainerRef lifecycle. */
  private readonly fieldComponent = new FieldComponentSlot();

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);
  /**
   * Forwarded straight to the controller. The controller combines `renderReady`
   * (flicker tolerance — preserves chain on transient false) with `hidden`
   * (post-mount hide via outermost-host class instead of unmount) — keeping
   * them separate here lets the controller respond differently to each. The
   * initial-mount gate behaves like `renderReady && !hidden` so we still don't
   * mount during the window where Angular Signal Forms' `[formField]` directive
   * would emit NG01916.
   */
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady());
  private readonly hidden: Signal<boolean> = computed(() => this.dfFieldOutlet().hidden());
  private readonly rawInputs = computed(() => this.dfFieldOutlet().inputs());

  /**
   * Effective wrapper chain. Element-wise identity comparison keeps the signal
   * stable across `ResolvedField` reference changes that don't actually change
   * the chain — avoids rebuilds on reconciled fields.
   */
  private readonly wrappers = computed(
    () => resolveWrappers(this.dfFieldOutlet().fieldDef, this.defaultWrappersSignal?.(), this.wrapperAutoAssociations),
    { equal: isSameWrapperChain },
  );

  /**
   * `fieldInputs` bag handed to every wrapper in the chain AND forwarded to
   * the innermost field component (when it declares `fieldInputs` as an
   * input). Memoised on `rawInputs` identity so repeated emissions with the
   * same underlying object return the same view and don't cascade OnPush
   * re-evaluations.
   */
  private readonly fieldInputs = computed<WrapperFieldInputs>(() =>
    buildFieldInputs(this.rawInputs(), this.readonlyFieldCache, this.dfFieldOutlet().fieldDef.type),
  );

  private readonly defaultEnvInjector = inject(EnvironmentInjector);
  /** Environment injector for the innermost field component — `[environmentInjector]` input takes precedence over the directive's own DI. */
  private readonly fieldEnvInjector = computed(() => this.dfFieldOutletEnvironmentInjector() ?? this.defaultEnvInjector);
  /** Field-level injector (FIELD_SIGNAL_CONTEXT, ARRAY_CONTEXT, …). Threaded to the controller so wrappers can inject it too. */
  private readonly fieldInjector = computed(() => this.dfFieldOutlet().injector);

  constructor() {
    createWrapperChainController({
      vcr: this.vcr,
      wrappers: this.wrappers,
      renderReady: this.renderReady,
      hidden: this.hidden,
      rebuildKey: this.componentIdentity,
      fieldInputs: this.fieldInputs,
      fieldInjector: this.fieldInjector,
      beforeRebuild: () => this.fieldComponent.detach(),
      renderInnermost: (slot) => {
        const resolved = this.dfFieldOutlet();
        this.fieldComponent.mountOrReuse(
          slot,
          resolved.component,
          resolved.injector,
          this.fieldEnvInjector(),
          this.rawInputs(),
          this.fieldInputs(),
        );
      },
    });

    // Push rawInputs (plus the wrapper-style fieldInputs bag) to the innermost
    // field on every change. The slot dedupes per-key, so the initial render's
    // synchronous push from `renderInnermost` and the effect's first fire
    // converge cleanly with no double-pushing.
    explicitEffect([this.rawInputs, this.fieldInputs], ([rawInputs, fieldInputs]) =>
      this.fieldComponent.pushInputs(rawInputs, fieldInputs),
    );

    this.destroyRef.onDestroy(() => this.fieldComponent.destroyOnTeardown());
  }
}

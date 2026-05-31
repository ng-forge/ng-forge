import { computed, DestroyRef, Directive, EnvironmentInjector, inject, input, Signal, signal, Type, ViewContainerRef } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ResolvedField } from '../../utils/resolve-field/resolve-field';
import { WRAPPER_AUTO_ASSOCIATIONS } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_WRAPPERS } from '@ng-forge/dynamic-forms/internal';
import { createWrapperChainController } from '../../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE } from '@ng-forge/dynamic-forms/internal';
import { buildFieldInputs } from '../../utils/build-field-inputs/build-field-inputs';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { FieldComponentSlot } from './field-component-slot';

/**
 * Structural directive that renders a `ResolvedField` with its effective
 * wrapper chain.
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
   * Gate for the wrapper chain controller: true only when required inputs are populated AND the
   * field isn't hidden. Combining the two prevents an initial-mount race where the chain mounts
   * during the brief window between `renderReady` flipping true and `hidden()` settling — that
   * window is exactly where Angular Signal Forms' `[formField]` directive emits NG01916.
   */
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady() && !this.dfFieldOutlet().hidden());
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
      gate: this.renderReady,
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

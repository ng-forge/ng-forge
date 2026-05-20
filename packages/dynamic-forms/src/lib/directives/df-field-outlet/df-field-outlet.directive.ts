import { computed, DestroyRef, Directive, EnvironmentInjector, inject, input, Signal, signal, Type, ViewContainerRef } from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ResolvedField } from '../../utils/resolve-field/resolve-field';
import { WRAPPER_AUTO_ASSOCIATIONS } from '../../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../../models/field-signal-context.token';
import { createWrapperChainController } from '../../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE, toReadonlyFieldTreeCached } from '../../core/field-tree-utils';
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
 * Rendering is gated by `field.renderReady() && !field.hidden()` — the
 * directive waits until the mapper produces the required inputs AND the
 * field isn't hidden before instantiating the component. Once rendered, a
 * transient `renderReady → false` does *not* tear the chain down; the
 * controller keeps the mounted components alive and ignores the flicker.
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
   * `fieldInputs` bag handed to every wrapper in the chain. Memoised on
   * `rawInputs` identity so repeated emissions with the same underlying object
   * return the same view and don't cascade OnPush re-evaluations.
   */
  private readonly fieldInputs = computed<WrapperFieldInputs>(() => this.buildFieldInputs(this.rawInputs()));

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
        this.fieldComponent.mountOrReuse(slot, resolved.component, resolved.injector, this.fieldEnvInjector(), this.rawInputs());
      },
    });

    // Push rawInputs to the innermost field on every change. The slot dedupes per-key, so the
    // initial render's synchronous push from `renderInnermost` and the effect's first fire
    // converge cleanly with no double-pushing.
    explicitEffect([this.rawInputs], ([rawInputs]) => this.fieldComponent.pushInputs(rawInputs));

    this.destroyRef.onDestroy(() => this.fieldComponent.destroyOnTeardown());
  }

  private buildFieldInputs(rawInputs: Record<string, unknown>): WrapperFieldInputs {
    const fieldTreeCandidate = rawInputs['field'];
    // A FieldTree is a callable (() => FieldState). We expose it to wrappers via a narrow
    // read-only view; raw FieldTree is still pushed to the innermost component for writes.
    const readonlyField =
      fieldTreeCandidate && typeof fieldTreeCandidate === 'function'
        ? toReadonlyFieldTreeCached(this.readonlyFieldCache, fieldTreeCandidate as never)
        : undefined;
    // Shallow spread — relies on the mapper contract (see WrapperFieldInputs)
    // that rawInputs are emitted as fresh snapshots, not mutated in place.
    return {
      ...(rawInputs as Record<string, unknown>),
      field: readonlyField,
    } as WrapperFieldInputs;
  }
}

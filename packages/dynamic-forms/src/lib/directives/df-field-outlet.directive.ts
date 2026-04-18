import {
  ComponentRef,
  computed,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
  input,
  Signal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ResolvedField } from '../utils/resolve-field/resolve-field';
import { WRAPPER_AUTO_ASSOCIATIONS } from '../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../models/field-signal-context.token';
import { setInputIfDeclared } from '../utils/wrapper-chain/wrapper-chain';
import { createWrapperChainController } from '../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE, toReadonlyFieldTreeCached } from '../core/field-tree-utils';
import { WrapperFieldInputs } from '../wrappers/wrapper-field-inputs';

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
 * Rendering is gated by `field.renderReady()` — the directive waits until
 * the mapper produces the required inputs before instantiating the component.
 * Once rendered, a transient `renderReady → false` does *not* tear the chain
 * down; the controller keeps the mounted components alive and ignores the
 * flicker. Only a structural change (wrappers or component class) triggers
 * a rebuild.
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

  private readonly vcr = inject(ViewContainerRef);
  private readonly defaultEnvInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly readonlyFieldCache = inject(READONLY_FIELD_TREE_CACHE);

  private fieldRef: ComponentRef<unknown> | undefined;
  /**
   * Last rawInputs reference pushed to the innermost field. Used to dedupe the
   * rawInputs effect when the same snapshot was already applied as part of the
   * initial render — keeps per-keystroke input updates O(changed-keys) instead
   * of re-walking the whole input bag.
   */
  private lastPushedInputs: Record<string, unknown> | undefined;

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady());
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

  constructor() {
    createWrapperChainController({
      vcr: this.vcr,
      wrappers: this.wrappers,
      gate: this.renderReady,
      rebuildKey: this.componentIdentity,
      environmentInjector: () => this.resolveEnvInjector(),
      parentInjector: () => this.dfFieldOutlet().injector,
      fieldInputs: this.fieldInputs,
      renderInnermost: (slot) => {
        const resolved = this.dfFieldOutlet();
        this.fieldRef = slot.createComponent(resolved.component, {
          environmentInjector: this.resolveEnvInjector(),
          injector: resolved.injector,
        });
        // Reset the per-field push cache so the new fieldRef receives every input
        // — particularly the required `key`, which would otherwise be skipped by
        // the ref-diff check when the new field shares a key value with the old.
        this.lastPushedInputs = undefined;
        this.pushRawInputs(this.fieldRef, this.rawInputs());
      },
    });

    // Mapper outputs push-through: updates inputs on the innermost field without
    // touching the chain structure. Ref-identity dedupe against `lastPushedInputs`
    // skips the duplicate push that the controller's own render has already done.
    explicitEffect([this.rawInputs], ([rawInputs]) => {
      if (!this.fieldRef) return;
      if (this.lastPushedInputs === rawInputs) return;
      this.pushRawInputs(this.fieldRef, rawInputs);
    });

    this.destroyRef.onDestroy(() => {
      this.fieldRef = undefined;
      this.lastPushedInputs = undefined;
    });
  }

  private resolveEnvInjector(): EnvironmentInjector {
    return this.dfFieldOutletEnvironmentInjector() ?? this.defaultEnvInjector;
  }

  private pushRawInputs(ref: ComponentRef<unknown>, rawInputs: Record<string, unknown>): void {
    // Only push keys whose values actually changed since the previous emission.
    // Mappers typically mutate one or two keys per tick; a full-sweep setInput
    // would otherwise run the component's input-signal pipeline for every
    // unchanged key on every keystroke.
    const last = this.lastPushedInputs;
    for (const [key, value] of Object.entries(rawInputs)) {
      if (last && last[key] === value) continue;
      setInputIfDeclared(ref, key, value);
    }
    this.lastPushedInputs = rawInputs;
  }

  private buildFieldInputs(rawInputs: Record<string, unknown>): WrapperFieldInputs {
    const fieldTreeCandidate = rawInputs['field'];
    // A FieldTree is a callable (() => FieldState). We expose it to wrappers via a narrow
    // read-only view; raw FieldTree is still pushed to the innermost component for writes.
    const readonlyField =
      fieldTreeCandidate && typeof fieldTreeCandidate === 'function'
        ? toReadonlyFieldTreeCached(this.readonlyFieldCache, fieldTreeCandidate as never)
        : undefined;
    return {
      ...(rawInputs as Record<string, unknown>),
      field: readonlyField,
    } as WrapperFieldInputs;
  }
}

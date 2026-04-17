import {
  ComponentRef,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
  input,
  Signal,
  Type,
  computed,
  ViewContainerRef,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { firstValueFrom } from 'rxjs';
import { ResolvedField } from '../utils/resolve-field/resolve-field';
import { WrapperConfig, WRAPPER_AUTO_ASSOCIATIONS, WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY } from '../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../models/field-signal-context.token';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { LoadedWrapper, loadWrapperComponents, renderWrapperChain, setInputIfDeclared } from '../utils/wrapper-chain/wrapper-chain';
import { resolveEffectiveWrappers } from '../utils/resolve-effective-wrappers/resolve-effective-wrappers';
import { toReadonlyFieldTree } from '../core/field-tree-utils';
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
 *
 * **Known limitation (renderReady flicker):** if `renderReady` goes
 * `true → false → true` in quick succession (e.g. a mapper transiently
 * loses its `field` input) the outlet tears down and rebuilds the chain,
 * discarding input focus / caret position in the field component.
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
  private readonly wrapperRegistry = inject(WRAPPER_REGISTRY);
  private readonly wrapperComponentCache = inject(WRAPPER_COMPONENT_CACHE);
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly logger = inject(DynamicFormLogger);

  private wrapperRefs: ComponentRef<unknown>[] = [];
  private fieldRef: ComponentRef<unknown> | undefined;
  /**
   * Monotonic counter guarding async chain builds. Each rebuild request
   * captures the version; if a newer rebuild has started by the time the
   * Promise resolves, the stale one bails out without touching the DOM.
   */
  private rebuildVersion = 0;

  /**
   * Pre-computed effective wrapper chain. Uses reference-equal-per-element
   * comparison so that reconcileFields preserving the same fieldDef yields
   * a stable signal output — no chain rebuild when nothing actually changed.
   */
  private readonly effectiveWrappers: Signal<readonly WrapperConfig[]> = computed(
    () => resolveEffectiveWrappers(this.dfFieldOutlet().fieldDef, this.defaultWrappersSignal?.(), this.wrapperAutoAssociations),
    { equal: (a, b) => a.length === b.length && a.every((w, i) => w === b[i]) },
  );

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);

  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady());

  private readonly rawInputs = computed(() => this.dfFieldOutlet().inputs());

  constructor() {
    // Chain-rebuild effect: re-runs only when the component identity, the
    // memoised effective wrappers, or the renderReady gate changes. Replaces
    // the prior combineLatest/switchMap pipeline — aligns with the codebase's
    // explicitEffect convention and skips the rebuild when a reconciled
    // ResolvedField carries the same component + wrappers as before.
    explicitEffect([this.componentIdentity, this.effectiveWrappers, this.renderReady], ([, wrappers, ready]) => {
      if (!ready) {
        this.cleanup();
        return;
      }
      this.scheduleRebuild(wrappers);
    });

    // Mapper outputs push-through: updates inputs on already-created refs
    // without touching the chain structure. Runs independently of the
    // rebuild effect so per-keystroke input updates don't thrash the DOM.
    explicitEffect([this.rawInputs], ([rawInputs]) => {
      if (!this.fieldRef) return;
      this.pushInputs(rawInputs);
    });

    this.destroyRef.onDestroy(() => this.cleanup());
  }

  private scheduleRebuild(wrappers: readonly WrapperConfig[]): void {
    const version = ++this.rebuildVersion;
    const load =
      wrappers.length === 0
        ? Promise.resolve<LoadedWrapper[]>([])
        : firstValueFrom(loadWrapperComponents(wrappers, this.wrapperRegistry, this.wrapperComponentCache, this.logger));

    load
      .then((loaded) => {
        if (this.rebuildVersion !== version || this.destroyRef.destroyed) return;
        this.cleanup();
        this.render(loaded);
      })
      .catch(() => {
        /* loadWrapperComponents already logs; skip rebuild silently */
      });
  }

  private render(loadedWrappers: readonly LoadedWrapper[]): void {
    const resolved = this.dfFieldOutlet();
    const envInjector = this.dfFieldOutletEnvironmentInjector() ?? this.defaultEnvInjector;
    const rawInputs = resolved.inputs();
    const fieldInputs = this.buildFieldInputs(rawInputs);

    this.wrapperRefs = renderWrapperChain({
      outerContainer: this.vcr,
      loadedWrappers,
      environmentInjector: envInjector,
      parentInjector: resolved.injector,
      logger: this.logger,
      fieldInputs,
      renderInnermost: (slot) => {
        this.fieldRef = slot.createComponent(resolved.component, {
          environmentInjector: envInjector,
          injector: resolved.injector,
        });
        this.pushRawInputs(this.fieldRef, rawInputs);
      },
    });
  }

  private pushInputs(rawInputs: Record<string, unknown>): void {
    const fieldInputs = this.buildFieldInputs(rawInputs);
    for (const ref of this.wrapperRefs) {
      setInputIfDeclared(ref, 'fieldInputs', fieldInputs);
    }
    if (this.fieldRef) {
      this.pushRawInputs(this.fieldRef, rawInputs);
    }
  }

  private pushRawInputs(ref: ComponentRef<unknown>, rawInputs: Record<string, unknown>): void {
    for (const [key, value] of Object.entries(rawInputs)) {
      setInputIfDeclared(ref, key, value);
    }
  }

  private buildFieldInputs(rawInputs: Record<string, unknown>): WrapperFieldInputs {
    const fieldTreeCandidate = rawInputs['field'];
    // A FieldTree is a callable (() => FieldState). We expose it to wrappers via a narrow
    // read-only view; raw FieldTree is still pushed to the innermost component for writes.
    const readonlyField =
      fieldTreeCandidate && typeof fieldTreeCandidate === 'function' ? toReadonlyFieldTree(fieldTreeCandidate as never) : undefined;
    return {
      ...(rawInputs as Record<string, unknown>),
      field: readonlyField,
    } as WrapperFieldInputs;
  }

  private cleanup(): void {
    // vcr.clear() destroys the outermost component (wrapper or field); Angular
    // cascades destruction through every nested ComponentRef. Manually walking
    // wrapperRefs / fieldRef would double the teardown work.
    this.vcr.clear();
    this.wrapperRefs = [];
    this.fieldRef = undefined;
  }
}

import { ComponentRef, DestroyRef, Directive, EnvironmentInjector, inject, input, Signal, computed, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { combineLatest, of, switchMap } from 'rxjs';
import { ResolvedField } from '../utils/resolve-field/resolve-field';
import { WrapperConfig, WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY } from '../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../models/field-signal-context.token';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import {
  destroyWrapperChain,
  LoadedWrapper,
  loadWrapperComponents,
  renderWrapperChain,
  setInputIfDeclared,
} from '../utils/wrapper-chain/wrapper-chain';
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
 * 3. Field-level `FieldDef.wrappers` (null = explicit opt-out)
 *
 * Wrapper config keys (minus `type`) are pushed as individual Angular inputs;
 * every wrapper also receives `fieldInputs` — a `WrapperFieldInputs` bag that
 * includes the field's mapper outputs and a `ReadonlyFieldTree` view of its
 * form state.
 *
 * Rendering is gated by `field.renderReady()` — the directive waits until
 * the mapper produces the required inputs before instantiating the component.
 *
 * @example
 * ```html
 * @for (field of resolvedFields(); track field.key) {
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
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly logger = inject(DynamicFormLogger);

  private wrapperRefs: ComponentRef<unknown>[] = [];
  private fieldRef: ComponentRef<unknown> | undefined;

  private readonly effectiveWrappers: Signal<readonly WrapperConfig[]> = computed(() => {
    const field = this.dfFieldOutlet().fieldDef;
    const defaults = this.defaultWrappersSignal?.();
    return resolveEffectiveWrappers(field, defaults, this.wrapperRegistry);
  });

  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady());

  constructor() {
    // Rebuild chain when identity (field), effective wrappers, or renderReady change.
    combineLatest([toObservable(this.dfFieldOutlet), toObservable(this.effectiveWrappers), toObservable(this.renderReady)])
      .pipe(
        switchMap(([, wrappers, ready]) => {
          if (!ready) return of({ loaded: [] as LoadedWrapper[], shouldRender: false });
          if (wrappers.length === 0) return of({ loaded: [] as LoadedWrapper[], shouldRender: true });
          return loadWrapperComponents(wrappers, this.wrapperRegistry, this.wrapperComponentCache, this.logger).pipe(
            switchMap((loaded) => of({ loaded, shouldRender: true })),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ loaded, shouldRender }) => {
        this.cleanup();
        if (shouldRender) this.render(loaded);
      });

    // Stream mapper outputs to created components after the initial render.
    toObservable(computed(() => this.dfFieldOutlet().inputs()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rawInputs) => {
        if (!this.fieldRef) return;
        this.pushInputs(rawInputs);
      });

    this.destroyRef.onDestroy(() => this.cleanup());
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
    if (this.fieldRef) {
      this.fieldRef.destroy();
      this.fieldRef = undefined;
    }
    destroyWrapperChain(this.wrapperRefs);
    this.vcr.clear();
  }
}

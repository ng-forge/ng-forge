import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  TemplateRef,
  Type,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, from, of, switchMap } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { computeContainerHostClasses, setupContainerInitEffect } from '../../utils/container-utils/container-utils';
import { WrapperConfig, ContainerField } from '../../definitions/default/container-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { FieldWrapperContract, WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY } from '../../models/wrapper-type';
import { FIELD_SIGNAL_CONTEXT, WrapperContext, WRAPPER_CONTEXT } from '../../models/field-signal-context.token';
import { FieldSignalContext } from '../../mappers/types';

interface LoadedWrapper {
  config: WrapperConfig;
  component: Type<unknown>;
}

/**
 * Layout container that wraps child fields with UI chrome.
 *
 * Resolves children like a row, then chains wrapper components around them
 * using imperative `ViewContainerRef.createComponent()` — each wrapper's
 * `#fieldComponent` slot hosts the next wrapper or the children template.
 *
 * Does not create a new form context - fields share the parent's context.
 * Field values are flattened into the parent form (no nesting under container key).
 * Purely a visual/layout container with no impact on form structure.
 */
@Component({
  selector: 'div[container-field]',
  imports: [NgComponentOutlet],
  template: `
    <ng-template #childrenTpl>
      @for (field of resolvedFields(); track field.key) {
        <ng-container
          *ngComponentOutlet="field.component; injector: field.injector; environmentInjector: environmentInjector; inputs: field.inputs()"
        />
      }
    </ng-template>
    <ng-container #wrapperContainer></ng-container>
  `,
  styleUrl: './container-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[class.disabled]': 'disabled()',
    '[class.df-container-hidden]': 'hidden()',
    '[attr.aria-hidden]': 'hidden() || null',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContainerFieldComponent {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  protected readonly environmentInjector = inject(EnvironmentInjector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);
  private readonly wrapperRegistry = inject(WRAPPER_REGISTRY);
  private readonly wrapperComponentCache = inject(WRAPPER_COMPONENT_CACHE);
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext;

  // ─────────────────────────────────────────────────────────────────────────────
  // View Queries
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly childrenTpl = viewChild.required('childrenTpl', { read: TemplateRef });
  private readonly wrapperContainer = viewChild.required('wrapperContainer', { read: ViewContainerRef });

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<ContainerField>();
  key = input.required<string>();
  className = input<string>();
  hidden = input(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly hostClasses = computed(() => computeContainerHostClasses('container', this.className()));

  readonly disabled = computed(() => this.field().disabled || false);

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  // ─────────────────────────────────────────────────────────────────────────────
  // Child Field Resolution (same as RowFieldComponent)
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldsSource = computed(() => (this.field().fields || []) as FieldDef<unknown>[]);

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    createFieldResolutionPipe(() => ({
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      registry: this.rawFieldRegistry(),
      injector: this.injector,
      destroyRef: this.destroyRef,
      onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
        const fieldKey = fieldDef.key || '<no key>';
        const containerKey = this.field().key || '<no key>';
        this.logger.error(
          `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
            `within container '${containerKey}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      },
    })),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Wrapper Chain State
  // ─────────────────────────────────────────────────────────────────────────────

  private wrapperComponentRefs: ComponentRef<unknown>[] = [];

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupEffects();
    this.setupWrapperChain();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    setupContainerInitEffect(this.resolvedFields, this.eventBus, 'container', () => this.field().key, this.injector);
  }

  private setupWrapperChain(): void {
    const wrappers$ = toObservable(computed(() => this.field().wrappers));

    wrappers$
      .pipe(
        switchMap((wrappers) => {
          if (!wrappers || wrappers.length === 0) {
            return of([] as LoadedWrapper[]);
          }
          return this.loadWrapperComponents(wrappers);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((loadedWrappers) => {
        this.buildWrapperChain(loadedWrappers);
      });

    this.destroyRef.onDestroy(() => this.cleanupWrapperChain());
  }

  private loadWrapperComponents(wrappers: readonly WrapperConfig[]) {
    return forkJoin(
      wrappers.map((config) => {
        return from(this.loadWrapperComponent(config.type)).pipe(
          catchError(() => of(null)),
          switchMap((component) => {
            if (!component) {
              this.logger.error(
                `Wrapper type '${config.type}' could not be loaded. ` + `Ensure it is registered via provideDynamicForm().`,
              );

              return of(null);
            }
            return of({ config, component } as LoadedWrapper);
          }),
        );
      }),
    ).pipe(
      switchMap((results) => {
        const loaded = results.filter((r): r is LoadedWrapper => r !== null);
        return of(loaded);
      }),
    );
  }

  private async loadWrapperComponent(type: string): Promise<Type<unknown> | undefined> {
    // Check cache first
    const cached = this.wrapperComponentCache.get(type);
    if (cached) {
      return cached;
    }

    // Look up in registry
    const definition = this.wrapperRegistry.get(type);
    if (!definition) {
      return undefined;
    }

    // Load and cache
    const result = await definition.loadComponent();
    const moduleResult = result as { default?: Type<unknown> } | Type<unknown>;
    const component =
      typeof moduleResult === 'object' && 'default' in moduleResult && moduleResult.default
        ? moduleResult.default
        : (result as Type<unknown>);

    if (component) {
      this.wrapperComponentCache.set(type, component);
    }

    return component;
  }

  private buildWrapperChain(wrappers: LoadedWrapper[]): void {
    this.cleanupWrapperChain();

    const container = this.wrapperContainer();

    if (wrappers.length === 0) {
      // No wrappers — render children directly
      container.createEmbeddedView(this.childrenTpl());
      return;
    }

    // Build wrapper chain recursively (formly pattern)
    this.renderField(container, wrappers);
  }

  /**
   * Recursively creates each wrapper in the chain, nesting each inside
   * the previous wrapper's `fieldComponent` slot. The innermost slot
   * receives the children template.
   */
  private renderField(containerRef: ViewContainerRef, wrappers: LoadedWrapper[]): void {
    if (wrappers.length > 0) {
      const [wrapper, ...remaining] = wrappers;

      // Create a scoped injector that provides WRAPPER_CONTEXT for this wrapper
      const containerFieldContext: WrapperContext = {
        config: wrapper.config,
        containerField: this.field(),
        fieldSignalContext: this.parentFieldSignalContext,
      };

      const wrapperInjector = Injector.create({
        parent: this.injector,
        providers: [{ provide: WRAPPER_CONTEXT, useValue: containerFieldContext }],
      });

      const ref = containerRef.createComponent(wrapper.component, {
        environmentInjector: this.environmentInjector,
        injector: wrapperInjector,
      });
      this.wrapperComponentRefs.push(ref);

      // Trigger change detection so the wrapper's viewChild queries resolve
      ref.changeDetectorRef.detectChanges();

      // Get the wrapper's inner slot and recurse
      const instance = ref.instance as FieldWrapperContract;
      const innerContainer = instance.fieldComponent();

      if (innerContainer) {
        this.renderField(innerContainer, remaining);
      } else {
        this.logger.error(
          `Wrapper component for type '${wrapper.config.type}' does not provide a 'fieldComponent' ViewContainerRef. ` +
            `Ensure the wrapper component has a viewChild('fieldComponent', { read: ViewContainerRef }) query ` +
            `and that #fieldComponent is not inside a conditional (@if, @defer).`,
        );
      }
    } else {
      // Innermost — embed children template
      containerRef.createEmbeddedView(this.childrenTpl());
    }
  }

  private cleanupWrapperChain(): void {
    // Clear the main container
    const container = this.wrapperContainer();
    container.clear();

    // Destroy wrapper component refs
    for (const ref of this.wrapperComponentRefs) {
      ref.destroy();
    }
    this.wrapperComponentRefs = [];
  }
}

export { ContainerFieldComponent };

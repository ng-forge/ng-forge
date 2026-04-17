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
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { DfFieldOutlet } from '../../directives/df-field-outlet.directive';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { firstValueFrom } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { computeContainerHostClasses, setupContainerInitEffect } from '../../utils/container-utils/container-utils';
import { ContainerField } from '../../definitions/default/container-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { EventBus } from '../../events/event.bus';
import { FieldDef } from '../../definitions/base/field-def';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { WrapperConfig, WRAPPER_AUTO_ASSOCIATIONS, WRAPPER_COMPONENT_CACHE, WRAPPER_REGISTRY } from '../../models/wrapper-type';
import { DEFAULT_WRAPPERS } from '../../models/field-signal-context.token';
import { loadWrapperComponents, LoadedWrapper, renderWrapperChain } from '../../utils/wrapper-chain/wrapper-chain';
import { resolveEffectiveWrappers } from '../../utils/resolve-effective-wrappers/resolve-effective-wrappers';
import type { Signal } from '@angular/core';

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
  imports: [DfFieldOutlet],
  template: `
    <ng-template #childrenTpl>
      @for (field of resolvedFields(); track field.key) {
        <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
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
  private readonly wrapperAutoAssociations = inject(WRAPPER_AUTO_ASSOCIATIONS);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });

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
  // Child Field Resolution
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
  /**
   * Monotonic rebuild guard — the async wrapper load checks this before
   * mutating the DOM and bails out if a newer rebuild has since been scheduled.
   */
  private rebuildVersion = 0;

  /**
   * Memoised effective wrapper chain. Element-wise identity comparison keeps
   * the signal stable across `field()` reference changes that don't actually
   * change the chain — aligns with DfFieldOutlet so reconciled containers
   * don't tear down the chain when nothing meaningful changed.
   */
  private readonly effectiveWrappers: Signal<readonly WrapperConfig[]> = computed(
    () => resolveEffectiveWrappers(this.field(), this.defaultWrappersSignal?.(), this.wrapperAutoAssociations),
    { equal: (a, b) => a.length === b.length && a.every((w, i) => w === b[i]) },
  );

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
    // `row` is a virtual field type backed by ContainerFieldComponent — at
    // runtime the spread in rowFieldMapper preserves `type: 'row'` on the
    // field input, even though the declared type is `ContainerField`. Widen
    // here so `(events)` consumers filtering by `componentType === 'row'`
    // keep receiving emissions.
    setupContainerInitEffect(
      this.resolvedFields,
      this.eventBus,
      () => ((this.field().type as string) === 'row' ? 'row' : 'container'),
      () => this.field().key,
      this.injector,
    );
  }

  private setupWrapperChain(): void {
    // Merge field-level wrappers with form-level defaultWrappers + auto-associations
    // so containers behave symmetrically with DfFieldOutlet. explicitEffect +
    // memoed effectiveWrappers matches the outlet's convention and skips the
    // rebuild when effectiveWrappers is structurally the same.
    explicitEffect([this.effectiveWrappers], ([wrappers]) => this.scheduleRebuild(wrappers));
    this.destroyRef.onDestroy(() => this.cleanupWrapperChain());
  }

  private scheduleRebuild(wrappers: readonly WrapperConfig[]): void {
    const version = ++this.rebuildVersion;

    // Sync fast-path: when every wrapper component is already cached (the
    // common case after the first render), skip the microtask and render
    // synchronously.
    if (wrappers.length === 0 || wrappers.every((w) => this.wrapperComponentCache.has(w.type))) {
      const loaded = wrappers.map((config) => ({ config, component: this.wrapperComponentCache.get(config.type)! }));
      this.buildWrapperChain(loaded);
      return;
    }

    firstValueFrom(loadWrapperComponents(wrappers, this.wrapperRegistry, this.wrapperComponentCache, this.logger))
      .then((loaded) => {
        if (this.rebuildVersion !== version || this.destroyRef.destroyed) return;
        this.buildWrapperChain(loaded);
      })
      .catch(() => {
        /* loadWrapperComponents already logs; skip rebuild silently */
      });
  }

  private buildWrapperChain(wrappers: readonly LoadedWrapper[]): void {
    this.cleanupWrapperChain();

    const container = this.wrapperContainer();

    this.wrapperComponentRefs = renderWrapperChain({
      outerContainer: container,
      loadedWrappers: wrappers,
      environmentInjector: this.environmentInjector,
      parentInjector: this.injector,
      logger: this.logger,
      renderInnermost: (slot) => {
        slot.createEmbeddedView(this.childrenTpl());
      },
    });
  }

  private cleanupWrapperChain(): void {
    // Clearing the outer VCR destroys the outermost wrapper; Angular cascades
    // the destroy to every nested ComponentRef (each wrapper, and the embedded
    // children view). Explicitly walking `wrapperComponentRefs` to destroy them
    // afterwards would be redundant work.
    this.wrapperContainer().clear();
    this.wrapperComponentRefs = [];
  }
}

export { ContainerFieldComponent };

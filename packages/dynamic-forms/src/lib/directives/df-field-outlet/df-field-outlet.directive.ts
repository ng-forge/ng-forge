import {
  computed,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  Signal,
  signal,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { derivedFrom } from 'ngxtension/derived-from';
import { of, pipe, switchMap } from 'rxjs';
import { FORM_OPTIONS } from '@ng-forge/dynamic-forms/internal';
import { FIELD_WINDOWING } from '../../providers/features/field-windowing/field-windowing.token';
import { resolveFieldWindowing } from '../../providers/features/field-windowing/resolve-field-windowing';
import { FieldViewportObserver } from './field-viewport-observer.service';
import { ResolvedField } from '../../utils/resolve-field/resolve-field';
import { WRAPPER_REGISTRY, WRAPPER_AUTO_ASSOCIATIONS } from '@ng-forge/dynamic-forms/internal';
import { DEFAULT_WRAPPERS } from '@ng-forge/dynamic-forms/internal';
import { createWrapperChainController } from '../../utils/wrapper-chain/wrapper-chain-controller';
import { isSameWrapperChain, resolveWrappers } from '../../utils/resolve-wrappers/resolve-wrappers';
import { READONLY_FIELD_TREE_CACHE } from '@ng-forge/dynamic-forms/internal';
import { getGridClassString } from '@ng-forge/dynamic-forms/internal';
import { buildFieldInputs } from '../../utils/build-field-inputs/build-field-inputs';
import { WrapperFieldInputs } from '@ng-forge/dynamic-forms/internal';
import { FieldComponentSlot } from './field-component-slot';
import { EventBus, GROUP_CONTEXT } from '@ng-forge/dynamic-forms/internal';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { collectInitializingContainers } from '../../utils/container-utils/container-utils';
import { isSameParkedDomState, snapshotParkedDomState } from './field-parking-state';
import type { ParkableFieldTree, ParkedDomState } from './field-parking-state';

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
  private readonly wrapperRegistry = inject(WRAPPER_REGISTRY);
  private readonly defaultWrappersSignal = inject(DEFAULT_WRAPPERS, { optional: true });
  private readonly readonlyFieldCache = inject(READONLY_FIELD_TREE_CACHE);
  private readonly eventBus = inject(EventBus, { optional: true });
  private readonly injector = inject(Injector);

  private readonly fieldComponent = new FieldComponentSlot();

  private readonly componentIdentity: Signal<Type<unknown>> = computed(() => this.dfFieldOutlet().component);
  /** Avoids the NG01916 window between `renderReady` and hidden state settling. */
  private readonly renderReady: Signal<boolean> = computed(() => this.dfFieldOutlet().renderReady() && !this.dfFieldOutlet().hidden());
  private readonly hidden = computed(() => this.dfFieldOutlet().hidden());
  private readonly rawInputs = computed(() => this.dfFieldOutlet().inputs());

  /** Preserve wrapper identity across reconciled field snapshots. */
  private readonly wrappers = computed(
    () =>
      resolveWrappers(this.dfFieldOutlet().fieldDef, this.defaultWrappersSignal?.(), this.wrapperAutoAssociations, this.wrapperRegistry),
    { equal: isSameWrapperChain },
  );

  /** Shared input view for wrappers and addon-aware leaf components. */
  private readonly fieldInputs = computed<WrapperFieldInputs>(() =>
    buildFieldInputs(
      this.rawInputs(),
      this.readonlyFieldCache,
      this.dfFieldOutlet().fieldDef.type,
      (this.dfFieldOutlet().fieldDef as { validationMessages?: Record<string, unknown> }).validationMessages,
    ),
  );

  private readonly defaultEnvInjector = inject(EnvironmentInjector);
  private readonly fieldEnvInjector = computed(() => this.dfFieldOutletEnvironmentInjector() ?? this.defaultEnvInjector);
  private readonly fieldInjector = computed(() => this.dfFieldOutlet().injector);
  /** The outer wrapper is the row's grid child when wrappers exist. */
  private readonly outermostHostClasses = computed(() => getGridClassString(this.dfFieldOutlet().fieldDef) || undefined);

  private readonly formOptions = inject(FORM_OPTIONS, { optional: true });
  private readonly globalFieldWindowing = inject(FIELD_WINDOWING);
  private readonly viewportObserver = inject(FieldViewportObserver, { optional: true });

  private readonly parking = computed(() => resolveFieldWindowing(this.globalFieldWindowing, this.formOptions?.()?.fieldWindowing).park);

  /** A structural directive observes the mounted component's host element. */
  private readonly observedElement = computed(() => {
    const state = this.fieldComponent.snapshot();
    return state.phase === 'empty' ? null : (state.ref.location.nativeElement as HTMLElement);
  });

  private readonly visibility = derivedFrom(
    [this.observedElement, this.parking],
    pipe(
      switchMap(([element, parking]) => {
        const observer = this.viewportObserver;
        return parking.enabled && element && observer ? observer.observe(element, parking.margin) : of(true);
      }),
    ),
    { initialValue: true },
  );

  private readonly focusEpoch = signal(0);

  private readonly parked = computed(() => this.parking().enabled && !this.visibility());
  private readonly fieldTree = computed(
    () => {
      const candidate = this.rawInputs()['field'];
      return typeof candidate === 'function' ? (candidate as ParkableFieldTree) : undefined;
    },
    { equal: Object.is },
  );
  /** Subscribe to field state only while its view is parked. */
  private readonly parkedDomState = computed<ParkedDomState | null>(
    () => (this.parked() ? snapshotParkedDomState(this.fieldTree()) : null),
    { equal: isSameParkedDomState },
  );

  constructor() {
    createWrapperChainController({
      vcr: this.vcr,
      wrappers: this.wrappers,
      gate: this.renderReady,
      rebuildKey: this.componentIdentity,
      fieldInputs: this.fieldInputs,
      fieldInjector: this.fieldInjector,
      outermostHostClasses: this.outermostHostClasses,
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

    // The slot deduplicates the initial render and this reactive push.
    explicitEffect([this.rawInputs, this.fieldInputs], ([rawInputs, fieldInputs]) =>
      this.fieldComponent.pushInputs(rawInputs, fieldInputs),
    );

    // Hidden containers still need to release ancestor initialization trackers.
    explicitEffect([this.hidden], ([hidden]) => {
      if (!hidden || !this.eventBus) return;
      const resolved = this.dfFieldOutlet();
      const groupContext = resolved.injector.get(GROUP_CONTEXT, null);
      for (const { type, path } of collectInitializingContainers([resolved.fieldDef], groupContext?.groupPath())) {
        emitComponentInitialized(this.eventBus, type, path, this.injector);
      }
    });

    // Focus changes can make an otherwise offscreen field safe to park.
    explicitEffect([this.observedElement, this.parking], ([element, parking], onCleanup) => {
      if (!parking.enabled || !element) return;
      // Reactive disabling can move focus during render; defer past NG0600.
      const bumpEpoch = () =>
        queueMicrotask(() => {
          if (!this.destroyRef.destroyed) this.focusEpoch.update((n) => n + 1);
        });
      element.addEventListener('focusin', bumpEpoch);
      element.addEventListener('focusout', bumpEpoch);
      onCleanup(() => {
        element.removeEventListener('focusin', bumpEpoch);
        element.removeEventListener('focusout', bumpEpoch);
      });
    });

    // Refresh safety state without returning a parked view to application CD.
    explicitEffect([this.parked, this.focusEpoch, this.parkedDomState], ([parked, , domState]) => {
      if (parked && this.canPark(domState)) {
        const alreadyParked = this.fieldComponent.parked();
        this.fieldComponent.park();
        if (alreadyParked) this.fieldComponent.refresh();
      } else {
        this.fieldComponent.unpark();
      }
    });

    this.destroyRef.onDestroy(() => this.fieldComponent.destroyOnTeardown());
  }

  /** Focused and invalid fields must keep their DOM live. */
  private canPark(domState: ParkedDomState | null): boolean {
    const element = this.observedElement();
    if (!element) return false;
    if (element.contains(document.activeElement)) return false;
    return (domState?.errors.length ?? 0) === 0;
  }
}

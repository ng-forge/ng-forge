import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  model,
  Signal,
  TemplateRef,
  WritableSignal,
  signal,
} from '@angular/core';
import { DfFieldOutlet } from './directives/df-field-outlet/df-field-outlet.directive';
import { FieldTree } from '@angular/forms/signals';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, shareReplay, take } from 'rxjs';
import { createSubmissionHandler } from './utils/submission-handler/submission-handler';
import { FormConfig, FormOptions } from '@ng-forge/dynamic-forms/internal';
import { RegisteredFieldTypes } from '@ng-forge/dynamic-forms/internal';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormSubmitEvent } from './events/constants/submit.event';
import { ComponentInitializedEvent } from '@ng-forge/dynamic-forms/internal';
import { InferFormModel } from '@ng-forge/dynamic-forms/internal';
import { isContainerField } from '@ng-forge/dynamic-forms/internal';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { injectFormComponentPreloader } from './utils/preload-form-components/preload-form-components';
import { PageOrchestratorComponent } from './core/page-orchestrator/page-orchestrator.component';
import { DERIVATION_RENDER_GATE } from './core/derivation/derivation-render-gate';
import { FORM_INITIALIZER } from './providers/form-initializer.token';
import { FormClearEvent } from './events/constants/form-clear.event';
import { FormResetEvent } from './events/constants/form-reset.event';
import { PageChangeEvent } from './events/constants/page-change.event';
import { PagerStateEvent } from './events/constants/pager-state.event';
import { ActivePageInitializedEvent } from './events/constants/active-page-initialized.event';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { FormStateManager, FORM_STATE_DEPS } from './state/form-state-manager';
import { provideDynamicFormDI } from './providers/dynamic-form-di';
import { FormIdPrefixService } from './core/registry/form-id-prefix.service';
import { EventDispatcher } from './events/event-dispatcher';
import { DfTemplate, DfFieldTemplateRegistry } from './directives/df-template.directive';
import { DF_FIELD_TEMPLATES } from '@ng-forge/dynamic-forms/internal';
import { getGridClassString } from '@ng-forge/dynamic-forms/internal';
import { ResolvedField } from './utils/resolve-field/resolve-field';
import { FIELD_WINDOWING } from './providers/features/field-windowing/field-windowing.token';
import { resolveFieldWindowing } from './providers/features/field-windowing/resolve-field-windowing';
import { collectInitializingContainerKeys, initializationComponentKey } from './utils/container-utils/container-utils';

/**
 * Renders a form from a {@link FormConfig}. Attribute component on a native
 * `<form>` element (selector `form[dynamic-form]`); state management is
 * delegated to `FormStateManager`.
 *
 * Provide a UI adapter once via {@link provideDynamicForm} (for example
 * `provideDynamicForm(...withMaterialFields())`), then bind a config and
 * listen for `submitted`. Field-value types are inferred from the config when
 * it is authored with `as const satisfies FormConfig`.
 *
 * @example
 * ```ts
 * @Component({
 *   imports: [DynamicForm],
 *   template: `<form [dynamic-form]="config" (submitted)="onSubmit($event)"></form>`,
 * })
 * export class SignInComponent {
 *   config = {
 *     fields: [
 *       { key: 'email', type: 'input', value: '', label: 'Email', required: true, email: true },
 *       { type: 'submit', key: 'submit', label: 'Sign in' },
 *     ],
 *   } as const satisfies FormConfig;
 *
 *   onSubmit(value: InferFormValue<typeof this.config.fields>) {
 *     console.log(value); // inferred: { email: string }
 *   }
 * }
 * ```
 */
@Component({
  selector: 'form[dynamic-form]',
  imports: [DfFieldOutlet, PageOrchestratorComponent],
  template: `
    @if (shouldRender()) {
      @switch (formModeDetection().mode) {
        @case ('paged') {
          <div page-orchestrator [pageFields]="pageFieldDefinitions()" [form]="form()" [fieldSignalContext]="fieldSignalContext()"></div>
        }
        @case ('non-paged') {
          @for (field of resolvedFields(); track field.key; let i = $index) {
            @if (windowsField(field, i)) {
              @if (!field.hidden()) {
                @defer (on viewport) {
                  <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
                } @placeholder {
                  <div
                    [class]="placeholderGridClass(field)"
                    [style.min-height]="fieldWindowing().placeholderHeight"
                    [attr.data-field-key]="field.key"
                    aria-hidden="true"
                  ></div>
                }
              }
            } @else {
              <!-- DfFieldOutlet owns the hidden gate so an already-mounted field can be detached
                   and restored without recreating its component and wrapper chain. -->
              <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
            }
          }
        }
        @default {
          never;
        }
      }
    }
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [
    provideDynamicFormDI(),
    DfFieldTemplateRegistry,
    { provide: DF_FIELD_TEMPLATES, useFactory: () => inject(DfFieldTemplateRegistry).map },
  ],
  host: {
    class: 'df-dynamic-form df-form',
    novalidate: '', // Disable browser validation - Angular Signal Forms handles validation
    '[class.disabled]': 'disabled()',
    '[class.df-form-paged]': 'formModeDetection().mode === "paged"',
    '[class.df-form-non-paged]': 'formModeDetection().mode === "non-paged"',
    '[attr.data-form-mode]': 'formModeDetection().mode',
    '[attr.id]': 'idPrefix() || null',
    '(submit)': 'onNativeSubmit($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormModel<TFields>,
> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs (must be declared BEFORE deps connection and stateManager injection)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Form configuration defining the structure, validation, and behavior. */
  config = input.required<FormConfig<TFields>>({ alias: 'dynamic-form' });

  /** Runtime form options that override config options when provided. */
  formOptions = input<FormOptions | undefined>(undefined);

  /** Form values for two-way data binding. */
  value = model<Partial<TModel> | undefined>(undefined);

  /**
   * How lenient the addon validator is on `config.fields[...].addons`.
   * `'inline'` (default) keeps everything; `'json'` drops code-only types
   * with a warning. Read at form init and on every config swap — change
   * `source` AND the config to force re-validation mid-flight.
   */
  source = input<'inline' | 'json'>('inline');

  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  protected environmentInjector = inject(EnvironmentInjector);
  private eventBus = inject(EventBus);
  private logger = inject(DynamicFormLogger);
  private dispatcher = inject(EventDispatcher, { optional: true });
  private templateRegistry = inject(DfFieldTemplateRegistry);
  private globalFieldWindowing = inject(FIELD_WINDOWING);

  // ─────────────────────────────────────────────────────────────────────────────
  // Projected templates — collected for the `template` addon type via DI.
  // ─────────────────────────────────────────────────────────────────────────────

  /** All `<ng-template dfTemplate="...">` instances projected into this form. */
  private readonly _projectedTemplates = contentChildren(DfTemplate);

  private readonly stateManager = this.connectDeps();

  /**
   * Owns this form's DOM-id prefix and registers the instance with the root
   * registry for multi-form collision detection. Injected eagerly (not lazily
   * via first field map) so the live-form count is accurate from construction.
   */
  private readonly formIdPrefix = inject(FormIdPrefixService);

  /** Active DOM-id prefix — empty unless explicitly set or multiple forms are mounted. */
  protected readonly idPrefix = this.formIdPrefix.prefix;

  // ─────────────────────────────────────────────────────────────────────────────
  // Private State
  // ─────────────────────────────────────────────────────────────────────────────

  private componentId = 'dynamic-form';

  // ─────────────────────────────────────────────────────────────────────────────
  // Signals - Direct pass-through from state manager
  // ─────────────────────────────────────────────────────────────────────────────

  /** The currently active config used for form rendering */
  activeConfig = this.stateManager.activeConfig;

  /** Current render phase: 'render' = showing form, 'teardown' = hiding old components */
  renderPhase = this.stateManager.renderPhase;

  /** Computed form mode detection with validation */
  formModeDetection = this.stateManager.formModeDetection;

  /** Page field definitions for paged forms */
  pageFieldDefinitions = this.stateManager.pageFieldDefinitions;

  /** Effective form options (merged from config and input) */
  effectiveFormOptions = this.stateManager.effectiveFormOptions;

  /** Field signal context for injection into child components */
  fieldSignalContext = this.stateManager.fieldSignalContext;

  /** Default values computed from field definitions */
  defaultValues = this.stateManager.defaultValues;

  /** The Angular Signal Form instance */
  form = this.stateManager.form;

  /** Current form values (reactive) */
  formValue = this.stateManager.formValue;

  /** Whether the form is currently valid */
  valid = this.stateManager.valid;

  /** Whether the form is currently invalid */
  invalid = this.stateManager.invalid;

  /** Whether any form field has been modified */
  dirty = this.stateManager.dirty;

  /** Whether any form field has been touched (blurred) */
  touched = this.stateManager.touched;

  /** Current validation errors from all fields */
  errors = this.stateManager.errors;

  /** Whether the form is disabled (from options or form state) */
  disabled = this.stateManager.disabled;

  /** Whether the form is currently submitting */
  submitting = this.stateManager.submitting;

  /** Collects errors from async field component loading for error boundary patterns */
  fieldLoadingErrors = this.stateManager.fieldLoadingErrors;

  /** Whether to render the form template */
  // `derivationReady` is false only while a derivation-bearing config waits for
  // the lazily-loaded engine to wire, so fields render already-derived (no flash).
  private derivationReady = inject(DERIVATION_RENDER_GATE);
  shouldRender = computed(() => this.stateManager.shouldRender() && this.stateManager.formSchemaReady() && this.derivationReady());

  /** Resolved fields ready for rendering */
  protected resolvedFields = this.stateManager.resolvedFields;

  /**
   * Effective field-windowing config for non-paged forms. Per-form
   * `FormOptions.fieldWindowing` wins over the global `withFieldWindowing()`
   * default; both fall back to disabled (fully eager).
   */
  protected readonly fieldWindowing = computed(() =>
    resolveFieldWindowing(this.globalFieldWindowing, this.effectiveFormOptions()?.fieldWindowing),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Internal
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly initializedComponents = signal<ReadonlySet<string>>(new Set());
  private readonly initialPageReady = signal(false);

  private readonly initializationReady = computed(() => {
    const config = this.activeConfig();
    if (!config) return false;

    if (this.formModeDetection().mode === 'paged') return this.initialPageReady();

    const initialized = this.initializedComponents();
    const expected = [
      initializationComponentKey('dynamic-form', this.componentId),
      ...collectInitializingContainerKeys(config.fields ?? []),
    ];
    return expected.every((key) => initialized.has(key));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  /** Replayable readiness so late subscribers cannot miss hot EventBus announcements. */
  initialized$ = toObservable(this.initializationReady, { injector: this.injector }).pipe(
    filter((ready) => ready),
    take(1),
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Emits when form validity changes. */
  validityChange = outputFromObservable(toObservable(this.valid));

  /** Emits when form dirty state changes. */
  dirtyChange = outputFromObservable(toObservable(this.dirty));

  /** Emits form values when submitted (via FormSubmitEvent) and form is valid. */
  submitted = outputFromObservable(this.stateManager.submitted$);

  /** Emits when form is reset to default values. */
  reset = outputFromObservable(this.eventBus.on<FormResetEvent>('form-reset'));

  /** Emits when form is cleared to empty state. */
  cleared = outputFromObservable(this.eventBus.on<FormClearEvent>('form-clear'));

  /** Emits all form events for custom event handling. */
  events = outputFromObservable(this.eventBus.events$);

  /**
   * Emits when a non-paged form is fully initialized, or when the initially active page of a
   * paged form is ready for interaction. Virtualized inactive pages are not part of initial
   * readiness because they intentionally remain unmounted.
   */
  initialized = outputFromObservable(this.initialized$);

  /**
   * EXPERIMENTAL. Added alongside page preloading; the emission contract may change.
   *
   * Emits after the currently visible page and all of its visible fields render. Announced
   * once per visit to a page, and again when that page is returned to. Use this when work must
   * run after every page transition; `initialized` emits only for the initial page.
   */
  activePageInitialized = outputFromObservable(this.eventBus.on<ActivePageInitializedEvent>('active-page-initialized'));

  /** Emits when the current page changes in paged forms. */
  onPageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  /** Emits when pager state changes (currentPageIndex, totalPages, isFirstPage, isLastPage). */
  onPageNavigationStateChange = outputFromObservable(this.eventBus.on<PagerStateEvent>('pager-state'));

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.eventBus
      .on<ComponentInitializedEvent>('component-initialized')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        const key = initializationComponentKey(event.componentType, event.componentId);
        this.initializedComponents.update((current) => {
          if (current.has(key)) return current;
          const next = new Set(current);
          next.add(key);
          return next;
        });
      });
    this.eventBus
      .on<ActivePageInitializedEvent>('active-page-initialized')
      .pipe(takeUntilDestroyed(this.destroyRef), take(1))
      .subscribe(() => this.initialPageReady.set(true));

    this.dispatcher?.connect(this.eventBus);
    this.destroyRef.onDestroy(() => this.dispatcher?.disconnect());

    // Wake feature-provider orchestrators (derivation, property-derivation, …) so their
    // reactive streams are wired before first render. Each feature provider registers
    // itself via FORM_INITIALIZER multi-provider; resolving the array forces DI to
    // construct each entry. Without a feature provider, the array stays empty and no
    // static reference to that feature's classes leaks into this component.
    // Runs after dispatcher.connect() to preserve the prior bootstrap order.
    inject(FORM_INITIALIZER, { optional: true });

    // Start every field and wrapper chunk this config needs, in parallel, before
    // rendering asks for any of them. Wrapper chains are otherwise discovered
    // per-field inside DfFieldOutlet, which cannot exist until that field's own
    // component has loaded — a dependent waterfall that costs a round trip per
    // wave. Fire-and-forget: nothing here gates render.
    const preload = injectFormComponentPreloader();
    explicitEffect([this.config], ([config]) => preload(config as FormConfig));

    this.setupEffects();
    this.setupEventHandlers();
  }

  /**
   * Handles native form submission triggered by:
   * - Pressing Enter in an input field
   * - Clicking a button with type="submit"
   * - Programmatic form.submit() calls
   *
   * @param event - The native submit event from the form element
   */
  protected onNativeSubmit(event: Event): void {
    event.preventDefault();
    this.eventBus.dispatch(FormSubmitEvent);
  }

  /**
   * Whether a field should be deferred by field windowing. Containers are never
   * windowed: they emit `ComponentInitializedEvent`, which the form's init
   * tracker counts, so deferring one would stall `initialized` until it scrolls
   * into view. Leaf fields carry no such count, so they defer freely.
   */
  protected windowsField(field: ResolvedField, index: number): boolean {
    const w = this.fieldWindowing();
    return w.enabled && index >= w.eager && !isContainerField(field.fieldDef);
  }

  /** Class string for a windowed field's placeholder — matches the real field's grid column. */
  protected placeholderGridClass(field: ResolvedField): string {
    const grid = getGridClassString(field.fieldDef);
    return grid ? `df-field-placeholder ${grid}` : 'df-field-placeholder';
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    // Emit initialization event for paged forms
    explicitEffect([this.formModeDetection, this.pageFieldDefinitions], ([{ mode }, pages]) => {
      if (mode === 'paged' && pages.length > 0) {
        this.eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', this.componentId);
      }
    });

    // Emit initialization event for non-paged forms
    explicitEffect([this.resolvedFields, this.formModeDetection, this.activeConfig], ([, { mode }, config]) => {
      if (config && mode === 'non-paged') {
        afterNextRender(
          () => {
            this.eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', this.componentId);
          },
          { injector: this.injector },
        );
      }
    });

    // Mirror projected `<ng-template dfTemplate="...">` into the template
    // registry so `template` addons can resolve `templateKey` via DI.
    explicitEffect([this._projectedTemplates], ([templates]) => {
      const map = new Map<string, TemplateRef<unknown>>();
      for (const t of templates) {
        map.set(t.dfTemplate(), t.templateRef);
      }
      this.templateRegistry.set(map);
    });
  }

  /**
   * Populates FORM_STATE_DEPS with this component's input signals, then injects
   * FormStateManager. Must be called as a field initializer (after the input signals
   * are declared) so that FormStateManager reads populated deps when it is constructed.
   * inject() is valid here because field initializers run inside the injection context.
   */
  private connectDeps(): FormStateManager<TFields, TModel> {
    const deps = inject(FORM_STATE_DEPS);
    deps.config = this.config as Signal<FormConfig<RegisteredFieldTypes[]>>;
    deps.formOptions = this.formOptions;
    deps.value = this.value as WritableSignal<Partial<unknown> | undefined>;
    deps.source = this.source;
    return inject(FormStateManager<TFields, TModel>);
  }

  private setupEventHandlers(): void {
    createSubmissionHandler<TFields, TModel>({
      eventBus: this.eventBus,
      configSignal: this.config,
      formSignal: this.form as Signal<FieldTree<TModel>>,
      validSignal: this.valid,
      logger: this.logger,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => this.logger.error('Submission handler error', err),
      });
  }
}

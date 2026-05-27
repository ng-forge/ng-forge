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
} from '@angular/core';
import { FieldDef } from './definitions/base/field-def';
import { DfFieldOutlet } from './directives/df-field-outlet/df-field-outlet.directive';
import { FieldTree } from '@angular/forms/signals';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { createSubmissionHandler } from './utils/submission-handler/submission-handler';
import { FormConfig, FormOptions } from './models/form-config';
import { RegisteredFieldTypes } from './models/registry/field-registry';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { ComponentInitializedEvent } from './events/constants/component-initialized.event';
import { setupInitializationTracking } from './utils/initialization-tracker/initialization-tracker';
import { InferFormValue } from './models/types/form-value-inference';
import { hasChildFields, isContainerField } from './models/types/type-guards';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { PageOrchestratorComponent } from './core/page-orchestrator/page-orchestrator.component';
import { FORM_INITIALIZER } from './providers/form-initializer.token';
import { FormClearEvent } from './events/constants/form-clear.event';
import { FormResetEvent } from './events/constants/form-reset.event';
import { PageChangeEvent } from './events/constants/page-change.event';
import { PageNavigationStateChangeEvent } from './events/constants/page-navigation-state-change.event';
import { DynamicFormLogger } from './providers/features/logger/logger.token';
import { FormStateManager, FORM_STATE_DEPS } from './state/form-state-manager';
import { provideDynamicFormDI } from './providers/dynamic-form-di';
import { EventDispatcher } from './events/event-dispatcher';
import { DfTemplate, DfFieldTemplateRegistry } from './directives/df-template.directive';
import { DF_FIELD_TEMPLATES } from './models/addon/df-field-templates.token';

/**
 * Dynamic form component — renders a form based on configuration.
 * Delegates state management to `FormStateManager`.
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
          @for (field of resolvedFields(); track field.key) {
            <!-- @if + DfFieldOutlet's own renderReady-&-!hidden gate together silence NG01916:
                 the template @if removes the host from the DOM (Angular's prescribed pattern), and
                 the directive's gate stops a same-CD-pass mount before [formField] can warn.
                 Don't dedupe one without the other — see DfFieldOutlet.renderReady. -->
            @if (!field.hidden()) {
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
    '(submit)': 'onNativeSubmit($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormValue<TFields> & Record<string, unknown>,
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
   * `'inline'` (default) keeps everything; `'json'` drops code-only kinds
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Projected templates — collected for the `template` addon kind via DI.
  // ─────────────────────────────────────────────────────────────────────────────

  /** All `<ng-template dfTemplate="...">` instances projected into this form. */
  private readonly _projectedTemplates = contentChildren(DfTemplate);

  private readonly stateManager = this.connectDeps();

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
  shouldRender = this.stateManager.shouldRender;

  /** Resolved fields ready for rendering */
  protected resolvedFields = this.stateManager.resolvedFields;

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Internal
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Recursively counts container components that will emit ComponentInitializedEvent.
   * Includes the dynamic-form component itself (+1).
   */
  private totalComponentsCount = computed(() => {
    const fields = this.stateManager.formSetup()?.fields ?? [];
    return countContainersRecursive(fields) + 1;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  initialized$ = setupInitializationTracking({
    eventBus: this.eventBus,
    totalComponentsCount: this.totalComponentsCount,
    injector: this.injector,
    componentId: this.componentId,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Emits when form validity changes. */
  validityChange = outputFromObservable(toObservable(this.valid));

  /** Emits when form dirty state changes. */
  dirtyChange = outputFromObservable(toObservable(this.dirty));

  /** Emits form values when submitted (via SubmitEvent) and form is valid. */
  submitted = outputFromObservable(this.stateManager.submitted$);

  /** Emits when form is reset to default values. */
  reset = outputFromObservable(this.eventBus.on<FormResetEvent>('form-reset'));

  /** Emits when form is cleared to empty state. */
  cleared = outputFromObservable(this.eventBus.on<FormClearEvent>('form-clear'));

  /** Emits all form events for custom event handling. */
  events = outputFromObservable(this.eventBus.events$);

  /**
   * Emits when all form components are initialized and ready for interaction.
   * Useful for E2E testing to ensure the form is fully rendered before interaction.
   */
  initialized = outputFromObservable(this.initialized$);

  /** Emits when the current page changes in paged forms. */
  onPageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  /** Emits when page navigation state changes (canGoNext, canGoPrevious, etc.). */
  onPageNavigationStateChange = outputFromObservable(this.eventBus.on<PageNavigationStateChangeEvent>('page-navigation-state-change'));

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.dispatcher?.connect(this.eventBus);
    this.destroyRef.onDestroy(() => this.dispatcher?.disconnect());

    // Wake feature-provider orchestrators (derivation, property-derivation, …) so their
    // reactive streams are wired before first render. Each feature provider registers
    // itself via FORM_INITIALIZER multi-provider; resolving the array forces DI to
    // construct each entry. Without a feature provider, the array stays empty and no
    // static reference to that feature's classes leaks into this component.
    // Runs after dispatcher.connect() to preserve the prior bootstrap order.
    inject(FORM_INITIALIZER, { optional: true });

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
    this.eventBus.dispatch(SubmitEvent);
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
    explicitEffect([this.resolvedFields, this.formModeDetection], ([fields, { mode }]) => {
      if (mode === 'non-paged' && fields.length > 0) {
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

/**
 * Recursively counts container fields (page, row, group, array, wrapper) in a field tree.
 * Descends into container children including array item templates to ensure
 * nested containers are counted for accurate initialization tracking.
 */
function countContainersRecursive(fields: FieldDef<unknown>[]): number {
  let count = 0;
  for (const field of fields) {
    if (isContainerField(field)) {
      count += 1;
      if (hasChildFields(field)) {
        const children = field.fields;
        if (Array.isArray(children)) {
          for (const child of children) {
            if (Array.isArray(child)) {
              // Array item template: FieldDef[] (object items)
              count += countContainersRecursive(child as FieldDef<unknown>[]);
            } else if (child != null && isContainerField(child as FieldDef<unknown>)) {
              count += countContainersRecursive([child as FieldDef<unknown>]);
            }
          }
        }
      }
    }
  }
  return count;
}

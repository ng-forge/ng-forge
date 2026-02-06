import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  model,
  Signal,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { FieldTree } from '@angular/forms/signals';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { createSubmissionHandler } from './utils/submission-handler/submission-handler';
import { FormConfig, FormOptions } from './models/form-config';
import { RegisteredFieldTypes } from './models/registry/field-registry';
import { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { ComponentInitializedEvent } from './events/constants/component-initialized.event';
import { setupInitializationTracking } from './utils/initialization-tracker/initialization-tracker';
import { InferFormValue, isContainerField } from './models/types';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { DERIVATION_ORCHESTRATOR } from './core/derivation';
import { PageOrchestratorComponent } from './core/page-orchestrator';
import { FormClearEvent } from './events/constants/form-clear.event';
import { FormResetEvent } from './events/constants/form-reset.event';
import { PageChangeEvent } from './events/constants/page-change.event';
import { PageNavigationStateChangeEvent } from './events/constants/page-navigation-state-change.event';
import { DynamicFormLogger } from './providers/features/logger/logger.token';
import { FormStateManager } from './state/form-state-manager';
import { provideDynamicFormDI } from './providers/dynamic-form-di';

/**
 * Dynamic form component that renders a complete form based on configuration.
 *
 * This is the main entry point for the dynamic form system. It handles form state management,
 * validation, field rendering, and event coordination using Angular's signal-based reactive forms.
 *
 * **Architecture:**
 * The component delegates state management to `FormStateManager`, acting as a thin wrapper that:
 * - Provides inputs to the state manager
 * - Reads computed signals for template rendering
 * - Handles DOM events and outputs
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TModel - The strongly-typed interface for form values
 *
 * @example
 *```html
 * <form
 *  [dynamic-form]="formConfig"
 *  [(value)]="formData"
 *  (submitted)="handleSubmit($event)"
 *  (validityChange)="handleValidityChange($event)">
 * </form>
 * ```
 */
@Component({
  selector: 'form[dynamic-form]',
  imports: [NgComponentOutlet, PageOrchestratorComponent],
  template: `
    @if (shouldRender()) {
      @if (formModeDetection().mode === 'paged') {
        <div page-orchestrator [pageFields]="pageFieldDefinitions()" [form]="form()" [fieldSignalContext]="fieldSignalContext()"></div>
      } @else {
        @for (field of resolvedFields(); track field.key) {
          <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
        }
      }
    }
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [provideDynamicFormDI()],
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
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private destroyRef = inject(DestroyRef);
  private fieldRegistry = injectFieldRegistry();
  private injector = inject(Injector);
  private eventBus = inject(EventBus);
  private logger = inject(DynamicFormLogger);

  /**
   * State manager that owns all form state and coordinates the form lifecycle.
   * The component delegates state management to this service and reads its signals.
   */
  private stateManager = inject(FormStateManager<TFields, TModel>);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Form configuration defining the structure, validation, and behavior. */
  config = input.required<FormConfig<TFields>>({ alias: 'dynamic-form' });

  /** Runtime form options that override config options when provided. */
  formOptions = input<FormOptions | undefined>(undefined);

  /** Form values for two-way data binding. */
  value = model<Partial<TModel> | undefined>(undefined);

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

  private totalComponentsCount = computed(() => {
    const fields = this.stateManager.formSetup()?.fields ?? [];
    return fields.filter(isContainerField).length + 1;
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

  /**
   * Emits form values when submitted (via SubmitEvent) and form is valid.
   *
   * **Important:** This output only emits when the form is valid. If you need to
   * handle submit events regardless of validity, use the `(events)` output and
   * filter for `'submit'` events.
   *
   * Note: Does not emit when `submission.action` is configured - use one or the other.
   */
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
    // Initialize the state manager with component dependencies
    this.stateManager.initialize({
      config: this.config,
      formOptions: this.formOptions,
      value: this.value,
      fieldRegistry: this.fieldRegistry,
    });

    this.setupEffects();
    this.setupEventHandlers();

    // Lazily inject the derivation orchestrator to avoid circular dependency.
    // The orchestrator's constructor sets up RxJS subscriptions that process derivations.
    afterNextRender(() => {
      this.injector.get(DERIVATION_ORCHESTRATOR);
    });
  }

  /**
   * Handles native form submission triggered by:
   * - Pressing Enter in an input field
   * - Clicking a button with type="submit"
   * - Programmatic form.submit() calls
   *
   * This method prevents the default form submission behavior (page reload)
   * and dispatches a SubmitEvent through the EventBus for processing.
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
  }

  private setupEventHandlers(): void {
    createSubmissionHandler<TFields, TModel>({
      eventBus: this.eventBus,
      configSignal: this.config,
      formSignal: this.form as Signal<FieldTree<TModel>>,
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (err) => this.logger.error('Submission handler error', err),
      });
  }
}

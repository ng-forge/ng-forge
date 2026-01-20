import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  InputSignal,
  isDevMode,
  linkedSignal,
  model,
  OnDestroy,
  runInInjectionContext,
  signal,
  Signal,
  untracked,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { form } from '@angular/forms/signals';
import { outputFromObservable, takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, forkJoin, map, of, pipe, scan, switchMap } from 'rxjs';
import { derivedFromDeferred } from './utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from './utils/resolve-field/resolve-field';
import { createSubmissionHandler } from './utils/submission-handler/submission-handler';
import { keyBy, memoize, isEqual, getChangedKeys } from './utils/object-utils';
import { DEFAULT_PROPS, DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from './models/field-signal-context.token';
import { FieldTypeDefinition } from './models/field-type';
import { FormConfig, FormOptions } from './models/form-config';
import { RegisteredFieldTypes } from './models/registry/field-registry';
import { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
import { createSchemaFromFields } from './core/schema-builder';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { ComponentInitializedEvent } from './events/constants/component-initialized.event';
import { setupInitializationTracking } from './utils/initialization-tracker/initialization-tracker';
import { FormMode, InferFormValue, isContainerField } from './models/types';
import { flattenFields } from './utils/flattener/field-flattener';
import { FieldDef } from './definitions/base/field-def';
import { isPageField, PageField } from './definitions/default/page-field';
import { getFieldDefaultValue } from './utils/default-value/default-value';
import { FieldSignalContext } from './mappers/types';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from './core/registry';
import { detectFormMode, FormModeDetectionResult } from './models/types/form-mode';
import { collectCrossFieldEntries } from './core/cross-field/cross-field-collector';
import { FormModeValidator } from './utils/form-validation/form-mode-validator';
import {
  collectDerivations,
  validateNoCycles,
  applyDerivationsForTrigger,
  DerivationCollection,
  getDebouncedCollection,
  getDebouncePeriods,
  DERIVATION_WARNING_TRACKER,
  createDerivationWarningTracker,
} from './core/derivation';
import { createDebouncedEffect, DEFAULT_DEBOUNCE_MS } from './utils/debounce/debounce';
import { PageOrchestratorComponent } from './core/page-orchestrator';
import { FormClearEvent } from './events/constants/form-clear.event';
import { FormResetEvent } from './events/constants/form-reset.event';
import { PageChangeEvent } from './events/constants/page-change.event';
import { PageNavigationStateChangeEvent } from './events/constants/page-navigation-state-change.event';
import { DynamicFormLogger } from './providers/features/logger/logger.token';

/**
 * Dynamic form component that renders a complete form based on configuration.
 *
 * This is the main entry point for the dynamic form system. It handles form state management,
 * validation, field rendering, and event coordination using Angular's signal-based reactive forms.
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
    @if (formModeDetection().mode === 'paged') {
      <div page-orchestrator [pageFields]="pageFieldDefinitions()" [form]="form()" [fieldSignalContext]="fieldSignalContext()"></div>
    } @else {
      @for (field of resolvedFields(); track field.key) {
        <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
      }
    }
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [
    EventBus,
    SchemaRegistryService,
    FunctionRegistryService,
    RootFormRegistryService,
    FieldContextRegistryService,
    // Form-level config tokens provided via useFactory to enable reactive updates
    {
      provide: DEFAULT_PROPS,
      useFactory: (form: DynamicForm) => computed(() => form.config().defaultProps),
      deps: [DynamicForm],
    },
    {
      provide: DEFAULT_VALIDATION_MESSAGES,
      useFactory: (form: DynamicForm) => computed(() => form.config().defaultValidationMessages),
      deps: [DynamicForm],
    },
    {
      provide: FORM_OPTIONS,
      useFactory: (form: DynamicForm) => form.effectiveFormOptions,
      deps: [DynamicForm],
    },
    { provide: DERIVATION_WARNING_TRACKER, useFactory: createDerivationWarningTracker },
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
> implements OnDestroy {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly rootFormRegistry = inject(RootFormRegistryService);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly schemaRegistry = inject(SchemaRegistryService);
  private readonly logger = inject(DynamicFormLogger);
  private readonly derivationWarningTracker = inject(DERIVATION_WARNING_TRACKER);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Form configuration defining the structure, validation, and behavior. */
  config: InputSignal<FormConfig<TFields>> = input.required<FormConfig<TFields>>({ alias: 'dynamic-form' });

  /** Runtime form options that override config options when provided. */
  formOptions = input<FormOptions | undefined>(undefined);

  /** Form values for two-way data binding. */
  value = model<Partial<TModel> | undefined>(undefined);

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly memoizedFlattenFields = memoize(
    (fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields(fields, registry),
    {
      resolver: (fields, registry) => {
        const fieldKeys = fields.map((f) => `${f.key || ''}:${f.type}`).join('|');
        const registryKeys = Array.from(registry.keys()).sort().join('|');
        return `${fieldKeys}__${registryKeys}`;
      },
      maxSize: 10,
    },
  );

  private readonly memoizedFlattenFieldsForRendering = memoize(
    (fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields(fields, registry, { preserveRows: true }),
    {
      resolver: (fields, registry) => {
        const fieldKeys = fields.map((f) => `${f.key || ''}:${f.type}`).join('|');
        const registryKeys = Array.from(registry.keys()).sort().join('|');
        return `render_${fieldKeys}__${registryKeys}`;
      },
      maxSize: 10,
    },
  );

  private readonly memoizedKeyBy = memoize(<T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'), {
    resolver: (fields) => fields.map((f) => f.key).join('|'),
    maxSize: 10,
  });

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) => {
      const result: Record<string, unknown> = {};
      for (const [key, field] of Object.entries(fieldsById)) {
        const value = getFieldDefaultValue(field, registry);
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return result as TModel;
    },
    {
      resolver: (fieldsById, registry) => {
        const fieldKeys = Object.keys(fieldsById).sort().join('|');
        const registryKeys = Array.from(registry.keys()).sort().join('|');
        return `defaults_${fieldKeys}__${registryKeys}`;
      },
      maxSize: 10,
    },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  readonly formModeDetection = computed<FormModeDetectionResult>(() => {
    const config = this.config();
    const fields = config.fields || [];
    const detection = detectFormMode(fields);
    const validation = FormModeValidator.validateFormConfiguration(fields);

    if (!validation.isValid) {
      this.logger.error('Invalid form configuration:', validation.errors);
    }

    if (validation.warnings.length > 0) {
      this.logger.warn('Form configuration warnings:', validation.warnings);
    }

    return detection;
  });

  private readonly formSetup = computed(() => {
    const config = this.config();
    const modeDetection = this.formModeDetection();
    const registry = this.rawFieldRegistry();

    this.registerValidatorsFromConfig(config);

    if (config.fields && config.fields.length > 0) {
      return this.createFormSetupFromConfig(config.fields, modeDetection.mode, registry);
    }

    return this.createEmptyFormSetup(registry);
  });

  readonly pageFieldDefinitions = computed(() => {
    const config = this.config();
    const mode = this.formModeDetection().mode;

    if (mode === 'paged' && config.fields) {
      return config.fields.filter(isPageField);
    }

    return [] as PageField[];
  });

  readonly effectiveFormOptions = computed(() => {
    const config = this.config();
    const configOptions = config.options || {};
    const inputOptions = this.formOptions();
    return { ...configOptions, ...inputOptions };
  });

  readonly fieldSignalContext = computed<FieldSignalContext<TModel>>(() => ({
    injector: this.injector,
    value: this.value,
    defaultValues: this.defaultValues,
    form: this.form(),
  }));

  /**
   * Injector for field components with FIELD_SIGNAL_CONTEXT.
   * Other form-level tokens (DEFAULT_PROPS, etc.) are provided at component level.
   */
  private readonly fieldInjector = computed(() =>
    Injector.create({
      parent: this.injector,
      providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: this.fieldSignalContext() }],
    }),
  );

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  private readonly entity = linkedSignal(() => {
    const inputValue = this.value();
    const defaults = this.defaultValues();
    const setup = this.formSetup();

    const combined = { ...defaults, ...inputValue };

    if (setup.schemaFields && setup.schemaFields.length > 0) {
      const validKeys = new Set(setup.schemaFields.map((field) => field.key).filter((key: string | undefined) => key !== undefined));
      const filtered: Record<string, unknown> = {};
      for (const key of Object.keys(combined)) {
        if (validKeys.has(key)) {
          filtered[key] = (combined as Record<string, unknown>)[key];
        }
      }
      return filtered as TModel;
    }

    return combined as TModel;
  });

  readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();
      let formInstance: ReturnType<typeof form<TModel>>;

      untracked(() => this.rootFormRegistry.registerFormValueSignal(this.entity as Signal<Record<string, unknown>>));

      if (setup.schemaFields && setup.schemaFields.length > 0) {
        const crossFieldCollection = collectCrossFieldEntries(setup.schemaFields as FieldDef<unknown>[]);
        const schema = createSchemaFromFields(setup.schemaFields, setup.registry, crossFieldCollection.validators);
        formInstance = untracked(() => form(this.entity, schema));
      } else {
        formInstance = untracked(() => form(this.entity));
      }

      untracked(() => this.rootFormRegistry.registerRootForm(formInstance));

      return formInstance;
    });
  });

  /**
   * Collected derivations from field definitions.
   *
   * Validates that no cycles exist during collection.
   * Returns null if no derivations are defined.
   */
  private readonly derivationCollection = computed<DerivationCollection | null>(() => {
    const setup = this.formSetup();

    if (!setup.schemaFields || setup.schemaFields.length === 0) {
      return null;
    }

    const collection = collectDerivations(setup.schemaFields as FieldDef<unknown>[]);

    // Skip validation if no derivations
    if (collection.entries.length === 0) {
      return null;
    }

    // Validate no cycles exist - this will throw if cycles are detected
    // Pass logger for dev-mode warnings about bidirectional patterns
    validateNoCycles(collection, this.logger);

    // Warn about wildcard dependencies in dev mode (performance consideration)
    this.warnAboutWildcardDependencies(collection);

    return collection;
  });

  private readonly componentId = 'dynamic-form';

  /** Tracks debounce timers by duration for cleanup on component destruction */
  private readonly debounceTimers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Tracks the last form value processed by debounced derivations for change detection */
  private lastDebouncedFormValue: Record<string, unknown> | null = null;

  private readonly totalComponentsCount = computed(() => {
    const fields = this.formSetup().fields;
    if (!fields) {
      return 1;
    }

    const registry = this.rawFieldRegistry();
    const flatFields = flattenFields(fields, registry);
    const componentCount = flatFields.filter(isContainerField).length;

    return componentCount + 1;
  });

  private readonly fieldsSource = computed(() => this.formSetup().fields);

  // ─────────────────────────────────────────────────────────────────────────────
  // Public State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /** Collects errors from async field component loading for error boundary patterns. */
  readonly fieldLoadingErrors = signal<Array<{ fieldType: string; fieldKey: string; error: Error }>>([]);

  /** Current form values (reactive). */
  readonly formValue = computed(() => this.form()().value());

  /** Whether the form is currently valid. */
  readonly valid = computed(() => this.form()().valid());

  /** Whether the form is currently invalid. */
  readonly invalid = computed(() => this.form()().invalid());

  /** Whether any form field has been modified. */
  readonly dirty = computed(() => this.form()().dirty());

  /** Whether any form field has been touched (blurred). */
  readonly touched = computed(() => this.form()().touched());

  /** Current validation errors from all fields. */
  readonly errors = computed(() => this.form()().errors());

  /** Whether the form is disabled (from options or form state). */
  readonly disabled = computed(() => {
    const optionsDisabled = this.effectiveFormOptions().disabled;
    const formDisabled = this.form()().disabled();
    return optionsDisabled ?? formDisabled;
  });

  /** Whether the form is currently submitting. */
  readonly submitting = computed(() => this.form()().submitting());

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  readonly initialized$ = setupInitializationTracking({
    eventBus: this.eventBus,
    totalComponentsCount: this.totalComponentsCount,
    injector: this.injector,
    componentId: this.componentId,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Emits when form validity changes. */
  readonly validityChange = outputFromObservable(toObservable(this.valid));

  /** Emits when form dirty state changes. */
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));

  /**
   * Emits form values when submitted (via SubmitEvent).
   * Note: Does not emit when `submission.action` is configured - use one or the other.
   */
  readonly submitted = outputFromObservable(
    this.eventBus.on<SubmitEvent>('submit').pipe(
      switchMap(() => {
        const submissionConfig = this.config().submission;

        if (submissionConfig?.action) {
          this.logger.warn(
            'Both `submission.action` and `(submitted)` output are configured. ' +
              'When using `submission.action`, the `(submitted)` output will not emit. ' +
              'Use either `submission.action` OR `(submitted)`, not both.',
          );
          return EMPTY;
        }

        return of(this.value());
      }),
    ),
  );

  /** Emits when form is reset to default values. */
  readonly reset = outputFromObservable(this.eventBus.on<FormResetEvent>('form-reset'));

  /** Emits when form is cleared to empty state. */
  readonly cleared = outputFromObservable(this.eventBus.on<FormClearEvent>('form-clear'));

  /** Emits all form events for custom event handling. */
  readonly events = outputFromObservable(this.eventBus.events$);

  /**
   * Emits when all form components are initialized and ready for interaction.
   * Useful for E2E testing to ensure the form is fully rendered before interaction.
   */
  readonly initialized = outputFromObservable(this.initialized$);

  /** Emits when the current page changes in paged forms. */
  readonly onPageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  /** Emits when page navigation state changes (canGoNext, canGoPrevious, etc.). */
  readonly onPageNavigationStateChange = outputFromObservable(
    this.eventBus.on<PageNavigationStateChangeEvent>('page-navigation-state-change'),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([] as (ResolvedField | undefined)[]);
        }
        const context = {
          loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
          registry: this.rawFieldRegistry(),
          injector: this.fieldInjector(),
          destroyRef: this.destroyRef,
          onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
            const fieldKey = fieldDef.key || '<no key>';
            this.fieldLoadingErrors.update((errors) => [
              ...errors,
              {
                fieldType: fieldDef.type,
                fieldKey,
                error: error instanceof Error ? error : new Error(String(error)),
              },
            ]);
            this.logger.error(
              `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}). ` +
                `Ensure the field type is registered in your field registry.`,
              error,
            );
          },
        };
        return forkJoin(fields.map((f) => resolveField(f, context)));
      }),
      map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
      scan(reconcileFields, [] as ResolvedField[]),
    ),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupEffects();
    this.setupEventHandlers();

    // Clean up debounce timers when component is destroyed
    this.destroyRef.onDestroy(() => {
      for (const timer of this.debounceTimers.values()) {
        clearTimeout(timer);
      }
      this.debounceTimers.clear();
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
    // Sync entity changes to the value signal
    explicitEffect([this.entity], ([currentEntity]) => {
      const currentValue = this.value();
      if (!isEqual(currentEntity, currentValue)) {
        this.value.set(currentEntity);
      }
    });

    // Clear loading errors when config changes
    explicitEffect([this.config], () => {
      this.fieldLoadingErrors.set([]);
    });

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

    // Process derivations when form values change
    this.setupDerivationEffect();
  }

  /**
   * Sets up the effect that processes derivations when form values change.
   *
   * Uses a flag to prevent re-triggering during derivation application.
   * The flag is reset on a microtask delay to handle Angular's effect scheduling,
   * which queues re-runs as microtasks when tracked signals change.
   *
   * Tracks changed fields for efficient filtering.
   * Handles both immediate (onChange) and debounced derivations.
   *
   * @internal
   */
  private setupDerivationEffect(): void {
    // Flag to prevent re-entry during derivation processing
    // Reset on microtask to handle Angular's effect scheduling
    let isProcessingDerivations = false;

    // Set up immediate (onChange) derivations effect
    explicitEffect([this.formValue, this.derivationCollection, this.form], ([, collection, formAccessor]) => {
      // Skip if no derivations or already processing
      if (!collection || isProcessingDerivations) {
        return;
      }

      // Prevent re-entry - this flag prevents double-triggering when
      // derivation application updates formValue signal
      isProcessingDerivations = true;

      try {
        // Create the applicator context
        // Pass formAccessor directly (not called) so child fields can be accessed via bracket notation
        const applicatorContext = {
          formValue: this.formValue as Signal<Record<string, unknown>>,
          rootForm: formAccessor as unknown as import('@angular/forms/signals').FieldTree<unknown>,
          derivationFunctions: this.functionRegistry.getDerivationFunctions(),
          customFunctions: this.functionRegistry.getCustomFunctions(),
          logger: this.logger,
          warningTracker: this.derivationWarningTracker,
        };

        // Apply derivations with onChange trigger
        // We don't pass changedFields here - the applicator's internal loop needs
        // access to ALL derivations to handle cascades (A->B->C). The applicator's
        // equality check naturally skips derivations whose dependencies haven't changed.
        // Use untracked to prevent establishing additional dependencies during application
        untracked(() => {
          const result = applyDerivationsForTrigger(collection, 'onChange', applicatorContext);

          if (result.maxIterationsReached) {
            this.logger.warn(
              `Derivation processing reached max iterations. ` +
                `This may indicate a loop in derivation logic that wasn't caught at build time. ` +
                `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
            );
          }
        });
      } finally {
        // Reset flag on microtask to handle Angular's effect scheduling.
        // When derivations update field values, formValue signal changes,
        // scheduling a new effect run as a microtask. By resetting the flag
        // on the next microtask, we ensure the scheduled re-run sees the flag
        // as true and skips processing (preventing double-trigger).
        queueMicrotask(() => {
          isProcessingDerivations = false;
        });
      }
    });

    // Set up debounced derivations
    this.setupDebouncedDerivations();
  }

  /**
   * Sets up debounced derivation processing.
   *
   * Groups debounced derivations by their debounce duration and processes
   * each group with its own debounce timing. This allows each derivation
   * to respect its own `debounceMs` setting.
   *
   * Uses a single effect that groups entries at processing time, avoiding
   * the need to read the derivation collection during component construction.
   *
   * @internal
   */
  private setupDebouncedDerivations(): void {
    // Create a single debounced effect with the default (shortest common) debounce
    // It will handle per-entry debouncing internally
    createDebouncedEffect(
      this.formValue as Signal<Record<string, unknown>>,
      (currentValue) => {
        const collection = untracked(() => this.derivationCollection());
        const formAccessor = untracked(() => this.form());

        if (!collection || !formAccessor) return;

        // Get all debounce periods from cached collections
        const debouncePeriods = getDebouncePeriods(collection);
        if (debouncePeriods.length === 0) return;

        // Compute which fields changed since last debounced processing
        // This allows us to skip derivations whose dependencies haven't changed
        const changedFields = getChangedKeys(this.lastDebouncedFormValue, currentValue as Record<string, unknown>);

        // Update tracking for next comparison
        this.lastDebouncedFormValue = currentValue ? { ...(currentValue as Record<string, unknown>) } : null;

        // Skip if no fields changed (shouldn't happen due to distinctUntilChanged, but defensive)
        if (changedFields.size === 0) return;

        // Process entries with the default debounce immediately
        // (they've already been debounced by createDebouncedEffect)
        if (debouncePeriods.includes(DEFAULT_DEBOUNCE_MS)) {
          this.applyDebouncedEntriesForPeriod(DEFAULT_DEBOUNCE_MS, collection, formAccessor, changedFields);
        }

        // Schedule entries with different debounce durations
        // These need additional waiting beyond the default debounce
        for (const debounceMs of debouncePeriods) {
          if (debounceMs === DEFAULT_DEBOUNCE_MS) continue;

          // Clear existing timer for this duration
          const existingTimer = this.debounceTimers.get(debounceMs);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          // Calculate additional wait time
          // If debounceMs > DEFAULT, wait the difference
          // If debounceMs < DEFAULT, process immediately (already waited longer)
          const additionalWait = Math.max(0, debounceMs - DEFAULT_DEBOUNCE_MS);

          if (additionalWait === 0) {
            // Already waited long enough, process now
            this.applyDebouncedEntriesForPeriod(debounceMs, collection, formAccessor, changedFields);
          } else {
            // Capture changed fields for the scheduled callback
            const capturedChangedFields = changedFields;
            // Schedule for later
            const timer = setTimeout(() => {
              this.debounceTimers.delete(debounceMs);
              // Re-read form state at execution time
              const currentCollection = untracked(() => this.derivationCollection());
              const currentFormAccessor = untracked(() => this.form());
              if (currentCollection && currentFormAccessor) {
                this.applyDebouncedEntriesForPeriod(debounceMs, currentCollection, currentFormAccessor, capturedChangedFields);
              }
            }, additionalWait);
            this.debounceTimers.set(debounceMs, timer);
          }
        }
      },
      { ms: DEFAULT_DEBOUNCE_MS, injector: this.injector },
    );
  }

  /**
   * Applies debounced derivation entries for a specific debounce period.
   * Uses pre-computed cached collections for efficiency.
   * Filters derivations based on changed fields for performance.
   * @internal
   */
  private applyDebouncedEntriesForPeriod(
    debounceMs: number,
    collection: import('./core/derivation').DerivationCollection,
    formAccessor: ReturnType<typeof this.form>,
    changedFields?: Set<string>,
  ): void {
    // Get the pre-computed cached collection for this debounce period
    const cachedCollection = getDebouncedCollection(collection, debounceMs);
    if (!cachedCollection || cachedCollection.entries.length === 0) {
      return;
    }

    // Create applicator context
    const applicatorContext = {
      formValue: this.formValue as Signal<Record<string, unknown>>,
      rootForm: formAccessor as unknown as import('@angular/forms/signals').FieldTree<unknown>,
      derivationFunctions: this.functionRegistry.getDerivationFunctions(),
      customFunctions: this.functionRegistry.getCustomFunctions(),
      logger: this.logger,
      warningTracker: this.derivationWarningTracker,
    };

    // Apply debounced derivations using the cached collection
    // Pass changedFields to filter derivations whose dependencies haven't changed
    const result = applyDerivationsForTrigger(cachedCollection, 'debounced', applicatorContext, changedFields);

    if (result.maxIterationsReached) {
      this.logger.warn(
        `Debounced derivation processing reached max iterations (${debounceMs}ms). ` +
          `Applied: ${result.appliedCount}, Skipped: ${result.skippedCount}, Errors: ${result.errorCount}`,
      );
    }
  }

  private setupEventHandlers(): void {
    this.eventBus
      .on<FormResetEvent>('form-reset')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onFormReset());

    this.eventBus
      .on<FormClearEvent>('form-clear')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.onFormClear());

    createSubmissionHandler({
      eventBus: this.eventBus,
      configSignal: this.config,
      formSignal: this.form,
    })
      .pipe(takeUntilDestroyed())
      .subscribe();
  }

  private registerValidatorsFromConfig({ customFnConfig, schemas }: FormConfig<TFields>): void {
    if (schemas) {
      schemas.forEach((schema) => {
        this.schemaRegistry.registerSchema(schema);
      });
    }

    if (!customFnConfig) {
      return;
    }

    if (customFnConfig.customFunctions) {
      Object.entries(customFnConfig.customFunctions).forEach(([name, fn]) => {
        this.functionRegistry.registerCustomFunction(name, fn);
      });
    }

    // Register derivation functions (stored separately for use by derivation applicator)
    if (customFnConfig.derivations) {
      this.functionRegistry.setDerivationFunctions(customFnConfig.derivations);
    }

    this.functionRegistry.setValidators(customFnConfig.validators);
    this.functionRegistry.setAsyncValidators(customFnConfig.asyncValidators);
    this.functionRegistry.setHttpValidators(customFnConfig.httpValidators);
  }

  private createFormSetupFromConfig(fields: FieldDef<unknown>[], mode: FormMode, registry: Map<string, FieldTypeDefinition>) {
    const flattenedFields = this.memoizedFlattenFields(fields, registry);
    const flattenedFieldsForRendering = this.memoizedFlattenFieldsForRendering(fields, registry);
    const fieldsById = this.memoizedKeyBy(flattenedFields);
    const defaultValues = this.memoizedDefaultValues(fieldsById, registry);
    const fieldsToRender = mode === 'paged' ? [] : flattenedFieldsForRendering;

    return {
      fields: fieldsToRender,
      schemaFields: flattenedFields,
      originalFields: fields,
      defaultValues,
      schema: undefined,
      mode,
      registry,
    };
  }

  private createEmptyFormSetup(registry: Map<string, FieldTypeDefinition>) {
    return {
      fields: [],
      schemaFields: [],
      defaultValues: {} as TModel,
      schema: undefined,
      mode: 'non-paged' as const,
      registry,
    };
  }

  private onFormReset(): void {
    const defaults = this.defaultValues();
    // Type assertion is necessary: Angular Signal Forms expects exact form value type
    (this.form()().value.set as (value: unknown) => void)(defaults);
    this.value.set(defaults as Partial<TModel>);
  }

  private onFormClear(): void {
    const emptyValue = {} as Partial<TModel>;
    // Type assertion is necessary: Angular Signal Forms expects exact form value type
    (this.form()().value.set as (value: unknown) => void)(emptyValue);
    this.value.set(emptyValue);
  }

  /**
   * Logs a dev-mode warning when derivations use wildcard dependencies.
   *
   * Wildcard dependencies (`*`) cause the derivation to run on ANY form change,
   * which can impact performance in large forms. This warning encourages users
   * to specify explicit `dependsOn` arrays for better performance.
   *
   * @internal
   */
  private warnAboutWildcardDependencies(collection: DerivationCollection): void {
    if (!isDevMode()) return;

    const wildcardEntries = collection.wildcardEntries;
    if (wildcardEntries.length === 0) return;

    // Filter to entries that have functionName but no explicit dependsOn
    // These are the ones that defaulted to wildcard
    const implicitWildcards = wildcardEntries.filter(
      (entry) => entry.functionName && (!entry.originalConfig?.dependsOn || entry.originalConfig.dependsOn.length === 0),
    );

    if (implicitWildcards.length > 0) {
      const derivationDescs = implicitWildcards.map((e) => `${e.sourceFieldKey} -> ${e.targetFieldKey} (${e.functionName})`);

      this.logger.warn(
        '[Derivation] Derivations using custom functions without explicit dependsOn detected. ' +
          'These run on EVERY form change, which may impact performance in large forms. ' +
          'Consider specifying explicit dependsOn arrays for better performance.',
        derivationDescs,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.rootFormRegistry.unregisterForm();
  }
}

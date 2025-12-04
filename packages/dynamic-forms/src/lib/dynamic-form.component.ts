import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  InputSignal,
  linkedSignal,
  model,
  OnDestroy,
  runInInjectionContext,
  signal,
  Signal,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl, submit } from '@angular/forms/signals';
import { outputFromObservable, takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { EMPTY, filter, firstValueFrom, forkJoin, from, isObservable, map, of, ReplaySubject, switchMap, take } from 'rxjs';
import { keyBy, memoize, isEqual } from './utils/object-utils';
import { mapFieldToBindings } from './utils/field-mapper/field-mapper';
import { FIELD_SIGNAL_CONTEXT } from './models/field-signal-context.token';
import { FieldTypeDefinition } from './models/field-type';
import { FormConfig, FormOptions } from './models/form-config';
import { RegisteredFieldTypes } from './models/registry/field-registry';
import { injectFieldRegistry } from './utils/inject-field-registry/inject-field-registry';
import { createSchemaFromFields } from './core/schema-builder';
import { EventBus } from './events/event.bus';
import { SubmitEvent } from './events/constants/submit.event';
import { ComponentInitializedEvent } from './events/constants/component-initialized.event';
import { createInitializationTracker } from './utils/initialization-tracker/initialization-tracker';
import { InferFormValue } from './models/types';
import { flattenFields } from './utils/flattener/field-flattener';
import { FieldDef } from './definitions/base/field-def';
import { getFieldDefaultValue } from './utils/default-value/default-value';
import { FieldSignalContext } from './mappers/types';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldContextRegistryService, FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from './core/registry';
import { detectFormMode, FormModeDetectionResult } from './models/types/form-mode';
import { collectCrossFieldEntries } from './core/cross-field/cross-field-collector';
import { FormModeValidator } from './utils/form-validation/form-mode-validator';
import { PageOrchestratorComponent } from './core/page-orchestrator';
import { FormClearEvent } from './events/constants/form-clear.event';
import { FormResetEvent } from './events/constants/form-reset.event';
import { PageChangeEvent } from './events/constants/page-change.event';
import { PageNavigationStateChangeEvent } from './events/constants/page-navigation-state-change.event';

/**
 * Dynamic form component that renders a complete form based on configuration.
 *
 * This is the main entry point component for the dynamic form system. It handles
 * form state management, validation, field rendering, and event coordination using
 * Angular's signal-based reactive forms.
 *
 * @example
 * ```html
 * <dynamic-form
 *   [config]="formConfig"
 *   [(value)]="formData"
 *   (submitted)="handleSubmit($event)"
 *   (validityChange)="handleValidityChange($event)">
 * </dynamic-form>
 * ```
 *
 * @example
 * ```typescript
 * // Component usage with typed form configuration
 * export class MyComponent {
 *   formConfig: FormConfig = {
 *     fields: [
 *       { type: 'input', key: 'email', value: '', label: 'Email', required: true, email: true },
 *       { type: 'input', key: 'password', value: '', label: 'Password', required: true }
 *     ]
 *   };
 *
 *   formData = signal<Partial<UserProfile>>({});
 *
 *   handleSubmit(values: Partial<UserProfile>) {
 *     console.log('Form submitted:', values);
 *   }
 * }
 * ```
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TModel - The strongly-typed interface for form values
 *
 * @public
 */
@Component({
  selector: 'dynamic-form',
  imports: [FieldRendererDirective, PageOrchestratorComponent],
  template: `
    <form
      class="df-form"
      [class.disabled]="effectiveFormOptions().disabled"
      [class.df-form-paged]="formModeDetection().mode === 'paged'"
      [class.df-form-non-paged]="formModeDetection().mode === 'non-paged'"
    >
      @if (formModeDetection().mode === 'paged') {
        <!-- Paged form: Use page orchestrator with page field definitions -->
        <page-orchestrator [pageFields]="pageFieldDefinitions()" [form]="$any(form())" [fieldSignalContext]="fieldSignalContext()" />
      } @else {
        <!-- Non-paged form: Render fields directly with grid system -->
        <div class="df-form" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
          <!-- Fields will be automatically rendered by the fieldRenderer directive -->
        </div>
      }
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  providers: [EventBus, SchemaRegistryService, FunctionRegistryService, RootFormRegistryService, FieldContextRegistryService],
  host: {
    '[class.disabled]': 'disabled()',
    '[attr.data-form-mode]': 'formModeDetection().mode',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[], TModel = InferFormValue<TFields>>
  implements OnDestroy
{
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly rootFormRegistry = inject(RootFormRegistryService);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly schemaRegistry = inject(SchemaRegistryService);

  /**
   * Signal tracking field loading errors for error boundary pattern.
   * Collects all errors that occur during async field component loading.
   */
  readonly fieldLoadingErrors = signal<Array<{ fieldType: string; fieldKey: string; error: Error }>>([]);

  // Type-safe memoized functions for performance optimization
  private readonly memoizedFlattenFields = memoize(
    (fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields(fields, registry),
    // Optimized key generation - avoid JSON.stringify but ensure uniqueness
    (fields, registry) => {
      const fieldKeys = fields.map((f) => `${f.key || ''}:${f.type}`).join('|');
      const registryKeys = Array.from(registry.keys()).sort().join('|');
      return `${fieldKeys}__${registryKeys}`;
    },
  );

  private readonly memoizedFlattenFieldsForRendering = memoize(
    (fields: FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields(fields, registry, { preserveRows: true }),
    // Optimized key generation with stable registry keys
    (fields, registry) => {
      const fieldKeys = fields.map((f) => `${f.key || ''}:${f.type}`).join('|');
      const registryKeys = Array.from(registry.keys()).sort().join('|');
      return `render_${fieldKeys}__${registryKeys}`;
    },
  );

  private readonly memoizedKeyBy = memoize(
    <T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'),
    // Optimized key generation - fields already have keys
    (fields) => fields.map((f) => f.key).join('|'),
  );

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) => {
      const result: Record<string, unknown> = {};
      for (const [key, field] of Object.entries(fieldsById)) {
        const value = getFieldDefaultValue(field, registry);
        // Only include fields that have non-undefined default values
        // This excludes fields with valueHandling: 'exclude'
        if (value !== undefined) {
          result[key] = value;
        }
      }
      return result as TModel;
    },
    // Optimized key generation with stable ordering
    (fieldsById, registry) => {
      const fieldKeys = Object.keys(fieldsById).sort().join('|');
      const registryKeys = Array.from(registry.keys()).sort().join('|');
      return `defaults_${fieldKeys}__${registryKeys}`;
    },
  );

  // Memoized field signal context to avoid recreation for every field
  readonly fieldSignalContext = computed<FieldSignalContext<TModel>>(() => ({
    injector: this.injector,
    value: this.value,
    defaultValues: this.defaultValues,
    form: this.form(),
    defaultValidationMessages: this.config().defaultValidationMessages,
    formOptions: this.effectiveFormOptions(),
  }));

  // Injector that provides FIELD_SIGNAL_CONTEXT for mappers and child components
  private readonly fieldInjector = computed(() =>
    Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useValue: this.fieldSignalContext(),
        },
      ],
    }),
  );

  // Memoized field registry raw access
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  /**
   * Form configuration defining the structure, validation, and behavior.
   *
   * Changes to this input will rebuild the form structure and reset form state.
   * For incremental updates, use the form's update methods instead.
   *
   * @example
   * ```typescript
   * const config: FormConfig = {
   *   fields: [
   *     { type: 'input', key: 'name', value: '', label: 'Full Name', required: true },
   *     { type: 'group', key: 'address', label: 'Address', fields: [
   *       { type: 'input', key: 'street', value: '', label: 'Street' },
   *       { type: 'input', key: 'city', value: '', label: 'City' }
   *     ]}
   *   ]
   * };
   * ```
   */
  config: InputSignal<FormConfig<TFields>> = input.required<FormConfig<TFields>>();

  /**
   * Form options input for dynamic runtime configuration.
   *
   * When provided, overrides options from config. Useful for dynamically
   * enabling/disabling the form or changing validation behavior at runtime.
   *
   * @example
   * ```typescript
   * // Dynamically disable form
   * formOptionsSignal = signal<FormOptions>({ disabled: true });
   *
   * // In template
   * <dynamic-form [config]="config" [formOptions]="formOptionsSignal()" />
   * ```
   *
   * @value undefined
   */
  formOptions = input<FormOptions | undefined>(undefined);

  /**
   * Form values for two-way data binding.
   *
   * Supports both partial and complete form values. When used with two-way binding,
   * automatically syncs with form state changes and user input.
   *
   * @example
   * ```typescript
   * // Two-way binding
   * formData = signal<Partial<UserProfile>>({ email: 'user@example.com' });
   *
   * // In template
   * <dynamic-form [config]="config" [(value)]="formData" />
   * ```
   *
   * @value undefined
   */
  value = model<Partial<TModel> | undefined>(undefined);

  /**
   * Form mode detection and validation
   */
  readonly formModeDetection = computed<FormModeDetectionResult>(() => {
    const config = this.config();
    const fields = config.fields || [];

    const detection = detectFormMode(fields);

    // Validate form configuration and log errors/warnings
    const validation = FormModeValidator.validateFormConfiguration(fields);

    if (!validation.isValid) {
      console.error('[Dynamic Forms] Invalid form configuration:', validation.errors);
    }

    if (validation.warnings.length > 0) {
      console.warn('[Dynamic Forms] Form configuration warnings:', validation.warnings);
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

  private registerValidatorsFromConfig({ customFnConfig, schemas }: FormConfig<TFields>): void {
    // Register schemas from config
    if (schemas) {
      schemas.forEach((schema) => {
        this.schemaRegistry.registerSchema(schema);
      });
    }

    if (!customFnConfig) {
      return;
    }

    // Register custom functions
    if (customFnConfig.customFunctions) {
      Object.entries(customFnConfig.customFunctions).forEach(([name, fn]) => {
        this.functionRegistry.registerCustomFunction(name, fn);
      });
    }

    // Set all validators from config - change detection is inside set methods
    this.functionRegistry.setValidators(customFnConfig.validators);
    this.functionRegistry.setAsyncValidators(customFnConfig.asyncValidators);
    this.functionRegistry.setHttpValidators(customFnConfig.httpValidators);
  }

  private createFormSetupFromConfig(fields: FieldDef<unknown>[], mode: 'paged' | 'non-paged', registry: Map<string, FieldTypeDefinition>) {
    // Use memoized functions for expensive operations with registry
    const flattenedFields = this.memoizedFlattenFields(fields, registry);
    const flattenedFieldsForRendering = this.memoizedFlattenFieldsForRendering(fields, registry);
    const fieldsById = this.memoizedKeyBy(flattenedFields);
    const defaultValues = this.memoizedDefaultValues(fieldsById, registry);

    // For rendering: use flattenedFieldsForRendering which preserves row containers
    // For paged forms, orchestrator handles rendering separately
    const fieldsToRender = mode === 'paged' ? [] : flattenedFieldsForRendering;

    return {
      fields: fieldsToRender,
      schemaFields: flattenedFields, // Fields for form schema (always flattened for form values)
      originalFields: fields,
      defaultValues,
      schema: undefined,
      mode,
      registry, // Include registry for schema creation
    };
  }

  private createEmptyFormSetup(registry: Map<string, FieldTypeDefinition>) {
    return {
      fields: [],
      schemaFields: [],
      defaultValues: {} as TModel,
      schema: undefined,
      mode: 'non-paged' as const,
      registry, // Include registry even for empty forms
    };
  }

  /**
   * Page field definitions for paged forms.
   * Extracted directly from config for declarative rendering in the orchestrator.
   */
  readonly pageFieldDefinitions = computed(() => {
    const config = this.config();
    const mode = this.formModeDetection().mode;

    if (mode === 'paged' && config.fields) {
      return config.fields.filter((field) => field.type === 'page') as any[];
    }

    return [];
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  private readonly entity = linkedSignal(() => {
    const inputValue = this.value();
    const defaults = this.defaultValues();
    const setup = this.formSetup();

    const combined = { ...defaults, ...inputValue };

    // Filter to only include fields that exist in the current schema
    // This prevents "orphan field" errors during field removal
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

  readonly effectiveFormOptions = computed(() => {
    const config = this.config();
    const configOptions = config.options || {};
    const inputOptions = this.formOptions();

    // Merge config options with input options, input takes precedence
    return { ...configOptions, ...inputOptions };
  });

  readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      let formInstance: ReturnType<typeof form<TModel>>;

      // IMPORTANT: Register the entity signal BEFORE schema creation.
      // This allows cross-field logic functions (hidden, disabled, etc.) to access
      // form values during schema evaluation via createReactiveEvaluationContext.
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

  readonly formValue = computed(() => this.form()().value());

  private readonly syncEntityToValue = explicitEffect([this.entity], ([currentEntity]) => {
    const currentValue = this.value();

    if (!isEqual(currentEntity, currentValue)) {
      this.value.set(currentEntity);
    }
  });

  /**
   * Signal indicating whether the form is valid.
   *
   * @returns `true` if all form fields pass validation, `false` otherwise
   */
  readonly valid = computed(() => this.form()().valid());

  /**
   * Signal indicating whether the form is invalid.
   *
   * @returns `true` if any form field fails validation, `false` otherwise
   */
  readonly invalid = computed(() => this.form()().invalid());

  /**
   * Signal indicating whether the form has been modified.
   *
   * @returns `true` if any field value differs from its initial value
   */
  readonly dirty = computed(() => this.form()().dirty());

  /**
   * Signal indicating whether any form field has been touched.
   *
   * @returns `true` if user has interacted with any field
   */
  readonly touched = computed(() => this.form()().touched());

  /**
   * Signal containing all form validation errors.
   *
   * @returns Object with field keys and their validation error messages
   */
  readonly errors = computed(() => this.form()().errors());

  /**
   * Signal indicating whether the form is disabled.
   *
   * @returns `true` if form is disabled through configuration or programmatically
   */
  readonly disabled = computed(() => {
    const optionsDisabled = this.effectiveFormOptions().disabled;
    const formDisabled = this.form()().disabled();

    return optionsDisabled ?? formDisabled;
  });

  /**
   * Signal indicating whether the form is currently being submitted.
   *
   * This signal is automatically managed by Angular Signal Forms' native `submit()` function
   * when a `submission.action` is configured. It is `true` while the submission action
   * is executing and `false` otherwise.
   *
   * Use this signal to:
   * - Show loading indicators during submission
   * - Disable form elements during submission
   * - Prevent duplicate submissions
   *
   * @returns `true` if form is currently submitting, `false` otherwise
   *
   * @example
   * ```html
   * <button [disabled]="form.submitting()">
   *   {{ form.submitting() ? 'Submitting...' : 'Submit' }}
   * </button>
   * ```
   */
  readonly submitting = computed(() => this.form()().submitting());

  /**
   * Emitted when form validity state changes.
   *
   * Subscribe to this output to react to validation state changes in real-time.
   *
   * @example
   * ```typescript
   * onValidityChange(isValid: boolean) {
   *   this.submitButton.disabled = !isValid;
   * }
   * ```
   */
  readonly validityChange = outputFromObservable(toObservable(this.valid));

  /**
   * Emitted when form dirty state changes.
   *
   * Useful for implementing unsaved changes warnings or auto-save functionality.
   *
   * @example
   * ```typescript
   * onDirtyChange(isDirty: boolean) {
   *   if (isDirty) {
   *     this.showUnsavedWarning = true;
   *   }
   * }
   * ```
   */
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));

  /**
   * Emitted when the form is submitted and passes validation.
   *
   * The event contains the complete form values object with proper typing
   * based on the form configuration.
   *
   * **Important:** When using `submission.action` in the config, do not also use
   * the `(submitted)` output - they serve the same purpose. If both are configured,
   * `submission.action` takes precedence and `(submitted)` will not emit.
   *
   * @example
   * ```typescript
   * handleSubmit(values: Partial<UserProfile>) {
   *   // values is properly typed based on form configuration
   *   this.userService.updateProfile(values);
   * }
   * ```
   */
  readonly submitted = outputFromObservable(
    this.eventBus.on<SubmitEvent>('submit').pipe(
      switchMap(() => {
        const submissionConfig = this.config().submission;

        // If submission action is configured, warn and skip emitting to (submitted) output
        // The submission.action handler already handles the submission
        if (submissionConfig?.action) {
          console.warn(
            '[Dynamic Forms] Both `submission.action` and `(submitted)` output are configured. ' +
              'When using `submission.action`, the `(submitted)` output will not emit. ' +
              'Use either `submission.action` OR `(submitted)`, not both.',
          );
          return EMPTY;
        }

        return of(this.value());
      }),
    ),
  );

  /**
   * Emitted when the form is reset to its default values.
   *
   * Subscribe to this output to react when the form is reset.
   *
   * @example
   * ```typescript
   * onFormReset() {
   *   console.log('Form was reset to default values');
   * }
   * ```
   */
  readonly reset = outputFromObservable(this.eventBus.on<FormResetEvent>('form-reset'));

  /**
   * Emitted when the form is cleared.
   *
   * Subscribe to this output to react when the form is cleared.
   *
   * @example
   * ```typescript
   * onFormClear() {
   *   console.log('Form was cleared');
   * }
   * ```
   */
  readonly cleared = outputFromObservable(this.eventBus.on<FormClearEvent>('form-clear'));

  readonly events = outputFromObservable(this.eventBus.events$);

  private readonly componentId = 'dynamic-form';

  /**
   * Observable that emits when all components (pages + rows + groups + dynamic-form) are initialized.
   * Uses a ReplaySubject to ensure exactly one emission that can be received by late subscribers.
   */
  private readonly initializedSubject = new ReplaySubject<boolean>(1);
  readonly initialized$ = this.initializedSubject.asObservable();

  constructor() {
    // Set up initialization tracking
    this.setupInitializationTracking();

    // Clear field loading errors when config changes
    explicitEffect([this.config], () => {
      this.fieldLoadingErrors.set([]);
    });

    // For paged forms, emit initialization event when pages are defined
    explicitEffect([this.formModeDetection, this.pageFieldDefinitions], ([{ mode }, pages]) => {
      if (mode === 'paged' && pages.length > 0) {
        // Emit initialization for dynamic-form component in paged mode
        // This happens after the page orchestrator is set up
        this.eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', this.componentId);
      }
    });

    // Listen for form reset events
    this.eventBus
      .on<FormResetEvent>('form-reset')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.onFormReset();
      });

    // Listen for form clear events
    this.eventBus
      .on<FormClearEvent>('form-clear')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.onFormClear();
      });

    // Handle submission with optional submission action
    // Uses switchMap to cancel any in-flight submission when a new one starts
    this.eventBus
      .on<SubmitEvent>('submit')
      .pipe(
        switchMap(() => {
          const submissionConfig = this.config().submission;

          // If no submission action is configured, let the submitted output handle it
          // This maintains backward compatibility for users handling submission manually
          if (!submissionConfig?.action) {
            return EMPTY;
          }

          // Wrap the action to handle Observable returns
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const wrappedAction = (formTree: any): Promise<any> => {
            const result = submissionConfig.action(formTree);
            // If the action returns an Observable, convert it to a Promise
            if (isObservable(result)) {
              return firstValueFrom(result);
            }
            return result;
          };

          // Use Angular Signal Forms' native submit() function
          // This automatically:
          // - Sets form.submitting() to true during execution
          // - Applies server errors to form fields on completion
          // - Sets form.submitting() to false when done
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return from(submit(this.form() as any, wrappedAction));
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * Emitted when all form components are initialized and ready for interaction.
   *
   * This includes the dynamic form itself, all pages, rows, groups, and field components.
   * Useful for e2e testing to ensure the form is fully rendered before interaction.
   *
   * @example
   * ```typescript
   * handleFormInitialized() {
   *   console.log('Form is fully initialized and ready for interaction');
   *   // Safe to programmatically interact with form elements
   * }
   * ```
   */
  public initialized = outputFromObservable(this.initialized$);

  public onPageChange = outputFromObservable(this.eventBus.on<PageChangeEvent>('page-change'));

  public onPageNavigationStateChange = outputFromObservable(
    this.eventBus.on<PageNavigationStateChangeEvent>('page-navigation-state-change'),
  );

  private fields$ = toObservable(computed(() => this.formSetup().fields));

  protected fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter(Boolean)),
    ),
    { initialValue: [] },
  );

  private mapFields(fields: FieldDef<unknown>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: FieldDef<unknown>): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        // Check if component is destroyed before creating new components
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // Run mapper in injection context so it can inject FIELD_SIGNAL_CONTEXT
        const bindings = runInInjectionContext(this.fieldInjector(), () => {
          return mapFieldToBindings(fieldDef, this.rawFieldRegistry());
        });

        // Create component with field injector so child components can also inject FIELD_SIGNAL_CONTEXT
        return this.vcr.createComponent(componentType, { bindings, injector: this.fieldInjector() }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        // Only log and track errors if component hasn't been destroyed
        if (!this.destroyRef.destroyed) {
          const fieldKey = fieldDef.key || '<no key>';

          // Track error in signal for error boundary pattern
          this.fieldLoadingErrors.update((errors) => [
            ...errors,
            {
              fieldType: fieldDef.type,
              fieldKey,
              error: error instanceof Error ? error : new Error(String(error)),
            },
          ]);

          console.error(
            `[DynamicForm] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}). ` +
              `Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return undefined;
      });
  }

  protected onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'dynamic-form', this.componentId);
  }

  /**
   * Handles form reset. Restores all form field values to their
   * initial default values as defined in the form configuration.
   */
  private onFormReset(): void {
    const defaults = this.defaultValues();
    // Update both the form instance and the value model
    this.form()().value.set(defaults as any);
    this.value.set(defaults as Partial<TModel>);
  }

  /**
   * Handles form clear. Clears all form field values,
   * resetting them to an empty state.
   */
  private onFormClear(): void {
    const emptyValue = {} as Partial<TModel>;
    // Update both the form instance and the value model
    this.form()().value.set(emptyValue as any);
    this.value.set(emptyValue);
  }

  /**
   * Creates an observable that tracks when all form components are initialized.
   * The count includes: 1 dynamic-form + pages + rows + groups
   */
  private setupInitializationTracking(): void {
    const totalComponentsCount = computed(() => {
      const fields = this.formSetup().fields;
      if (!fields) return 1; // Just the dynamic-form component

      const registry = this.rawFieldRegistry();
      const flatFields = flattenFields(fields, registry);
      const componentCount = flatFields.filter((field) => field.type === 'page' || field.type === 'row' || field.type === 'group').length;

      return componentCount + 1; // +1 for dynamic-form component
    });

    // Only track initialization for the initial component count
    // Use take(1) to prevent re-subscriptions if totalComponentsCount changes
    toObservable(totalComponentsCount)
      .pipe(
        take(1),
        switchMap((count) => {
          if (count === 1) {
            // Only dynamic-form component, emit immediately when it initializes
            return this.eventBus.on<ComponentInitializedEvent>('component-initialized').pipe(
              filter((event) => event.componentType === 'dynamic-form' && event.componentId === this.componentId),
              map(() => true),
              take(1), // Only take the first initialization event
            );
          }

          return createInitializationTracker(this.eventBus, count);
        }),
      )
      .subscribe({
        next: (initialized) => {
          this.initializedSubject.next(initialized);
          this.initializedSubject.complete();
        },
        error: (error) => {
          this.initializedSubject.error(error);
        },
      });
  }

  ngOnDestroy(): void {
    // Clean up the root form registry to prevent memory leaks
    this.rootFormRegistry.unregisterForm();
  }
}

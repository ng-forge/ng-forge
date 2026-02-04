import {
  afterNextRender,
  computed,
  DestroyRef,
  inject,
  Injectable,
  Injector,
  linkedSignal,
  OnDestroy,
  runInInjectionContext,
  Signal,
  signal,
  Type,
  untracked,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { form, Schema } from '@angular/forms/signals';
import { EMPTY, filter, forkJoin, map, Observable, of, pipe, scan, switchMap } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';

import { FieldDef } from '../definitions/base/field-def';
import { isPageField, PageField } from '../definitions/default/page-field';
import { EventBus } from '../events/event.bus';
import { FormClearEvent } from '../events/constants/form-clear.event';
import { FormResetEvent } from '../events/constants/form-reset.event';
import { SubmitEvent } from '../events/constants/submit.event';
import { FieldSignalContext } from '../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../models/field-signal-context.token';
import { FieldTypeDefinition } from '../models/field-type';
import { FormConfig, FormOptions } from '../models/form-config';
import { RegisteredFieldTypes } from '../models/registry/field-registry';
import { detectFormMode, FormMode, FormModeDetectionResult } from '../models/types/form-mode';
import { InferFormValue } from '../models/types';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from '../core/registry';
import { createSchemaFromFields } from '../core/schema-builder';
import { createFormLevelSchema } from '../core/form-schema-merger';
import { collectCrossFieldEntries } from '../core/cross-field/cross-field-collector';
import { flattenFields } from '../utils/flattener/field-flattener';
import { getFieldDefaultValue } from '../utils/default-value/default-value';
import { keyBy, memoize, isEqual } from '../utils/object-utils';
import { derivedFromDeferred } from '../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from '../utils/resolve-field/resolve-field';
import { FormModeValidator } from '../utils/form-validation/form-mode-validator';

import { FieldLoadingError, FormSetup } from './state-types';
import { createSideEffectScheduler, SideEffectScheduler } from './side-effect-scheduler';

/**
 * Internal state for managing two-phase config transitions.
 *
 * @internal
 */
interface ConfigTransitionState<TFields extends RegisteredFieldTypes[]> {
  /** The config currently being rendered */
  activeConfig: FormConfig<TFields>;
  /** The config waiting to be applied after teardown completes */
  pendingConfig?: FormConfig<TFields>;
  /** Current phase: 'render' shows components, 'teardown' hides them */
  renderPhase: 'render' | 'teardown';
  /** Form values preserved during transition to restore after applying new config */
  preservedValue?: Record<string, unknown>;
}

/**
 * Dependencies for initializing the FormStateManager.
 *
 * @internal
 */
export interface FormStateManagerDeps<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[], TModel = unknown> {
  /** Form configuration signal (from component input) */
  readonly config: Signal<FormConfig<TFields>>;
  /** Form options input signal (from component input) */
  readonly formOptions: Signal<FormOptions | undefined>;
  /** Form value model signal (two-way binding) */
  readonly value: WritableSignal<Partial<TModel> | undefined>;
  /** Field registry for loading components */
  readonly fieldRegistry: {
    readonly raw: Map<string, FieldTypeDefinition>;
    loadTypeComponent: (type: string) => Promise<Type<unknown> | undefined>;
  };
}

/**
 * Service that manages all form state and coordinates the form lifecycle.
 *
 * This service is the single source of truth for:
 * - Form lifecycle state (initializing, ready, transitioning, destroyed)
 * - Config transition management (two-phase teardown → apply)
 * - Computed form signals (valid, dirty, errors, etc.)
 * - Field resolution and loading
 * - Event coordination
 *
 * The `DynamicFormComponent` becomes a thin wrapper that:
 * 1. Provides inputs and dependencies
 * 2. Initializes this service
 * 3. Reads signals for template rendering
 *
 * @example
 * ```typescript
 * // In component
 * providers: [
 *   FormStateManager,
 *   ...createFormStateProviders(),
 * ]
 *
 * // Component reads from service
 * protected readonly stateManager = inject(FormStateManager);
 *
 * // Template uses service signals
 * @if (stateManager.shouldRender()) {
 *   <ng-container *ngFor="let field of stateManager.resolvedFields()">
 *     ...
 *   </ng-container>
 * }
 * ```
 *
 * @internal
 */
@Injectable()
export class FormStateManager<
  TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TModel extends Record<string, unknown> = InferFormValue<TFields> & Record<string, unknown>,
> implements OnDestroy {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies (injected)
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly logger = inject(DynamicFormLogger);
  private readonly eventBus = inject(EventBus);
  private readonly rootFormRegistry = inject(RootFormRegistryService);
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly schemaRegistry = inject(SchemaRegistryService);

  // ─────────────────────────────────────────────────────────────────────────────
  // Scheduler
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly scheduler: SideEffectScheduler;

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialized Dependencies (set during initialize)
  // ─────────────────────────────────────────────────────────────────────────────

  private deps!: FormStateManagerDeps<TFields, TModel>;
  private isInitialized = false;
  private isDestroyed = false;

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
  // Internal State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Config transition state - managed via linkedSignal for reactive transitions.
   * Initialized lazily after `initialize()` is called.
   */
  private configTransitionSignal!: WritableSignal<ConfigTransitionState<TFields>>;

  /**
   * Value preserved during config transition, stored separately to avoid signal cycles.
   */
  private readonly transitionPreservedValue = signal<Record<string, unknown> | undefined>(undefined);

  /**
   * Field loading errors accumulated during resolution.
   */
  readonly fieldLoadingErrors = signal<FieldLoadingError[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Configuration
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * The currently active config used for form rendering.
   * During transitions, this is the OLD config until teardown completes.
   */
  readonly activeConfig = computed<FormConfig<TFields> | undefined>(() => {
    if (!this.isInitialized) return undefined;
    return this.configTransitionSignal().activeConfig;
  });

  /**
   * Current render phase: 'render' = showing form, 'teardown' = hiding old components.
   */
  readonly renderPhase = computed<'render' | 'teardown'>(() => {
    if (!this.isInitialized) return 'render';
    return this.configTransitionSignal().renderPhase;
  });

  /**
   * Whether to render the form template.
   * Returns false during teardown phase to destroy old components before creating new ones.
   */
  readonly shouldRender = computed(() => this.renderPhase() === 'render' && this.activeConfig() !== undefined);

  /**
   * Computed form mode detection with validation.
   */
  readonly formModeDetection = computed<FormModeDetectionResult>(() => {
    const config = this.activeConfig();
    if (!config) {
      return { mode: 'non-paged', isValid: true, errors: [] };
    }

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

  /**
   * Effective form options (merged from config and input).
   */
  readonly effectiveFormOptions = computed<FormOptions>(() => {
    const config = this.activeConfig();
    const configOptions = config?.options || {};
    const inputOptions = this.isInitialized ? this.deps.formOptions() : undefined;
    return { ...configOptions, ...inputOptions };
  });

  /**
   * Page field definitions (for paged forms).
   */
  readonly pageFieldDefinitions = computed<PageField[]>(() => {
    const config = this.activeConfig();
    const mode = this.formModeDetection().mode;

    if (mode === 'paged' && config?.fields) {
      return config.fields.filter(isPageField);
    }

    return [] as PageField[];
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Form Setup
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly rawFieldRegistry = computed(() => (this.isInitialized ? this.deps.fieldRegistry.raw : new Map()));

  /**
   * Computed form setup containing all precomputed values for form creation.
   */
  readonly formSetup = computed<FormSetup<TFields>>(() => {
    const config = this.activeConfig();
    const modeDetection = this.formModeDetection();
    const registry = this.rawFieldRegistry();

    if (!config) {
      return this.createEmptyFormSetup(registry);
    }

    this.registerValidatorsFromConfig(config);

    if (config.fields && config.fields.length > 0) {
      return this.createFormSetupFromConfig(config.fields as FieldDef<unknown>[], modeDetection.mode, registry);
    }

    return this.createEmptyFormSetup(registry);
  });

  /**
   * Default values computed from field definitions.
   */
  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues as TModel);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Entity & Form
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Entity (form value merged with defaults).
   */
  private readonly entity = linkedSignal<TModel>(() => {
    if (!this.isInitialized) {
      return {} as TModel;
    }

    const inputValue = this.deps.value();
    const defaults = this.defaultValues();
    const setup = this.formSetup();

    const combined = { ...defaults, ...inputValue };

    if (setup.schemaFields && setup.schemaFields.length > 0) {
      const validKeys = new Set(setup.schemaFields.map((field) => field.key).filter((key): key is string => key !== undefined));
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

  /**
   * The Angular Signal Form instance.
   */
  readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();
      const config = this.activeConfig();

      if (!config) {
        return untracked(() => form(this.entity));
      }

      let formInstance: ReturnType<typeof form<TModel>>;

      untracked(() => this.rootFormRegistry.registerFormValueSignal(this.entity as Signal<Record<string, unknown>>));

      const hasFields = setup.schemaFields && setup.schemaFields.length > 0;
      const hasFormSchema = config.schema !== undefined;

      if (hasFields) {
        const crossFieldCollection = collectCrossFieldEntries(setup.schemaFields as FieldDef<unknown>[]);

        // Create schema with both field-level and form-level validation
        const combinedSchema = createSchemaFromFields(setup.schemaFields, setup.registry, {
          crossFieldValidators: crossFieldCollection.validators,
          formLevelSchema: config.schema,
        }) as Schema<TModel>;

        formInstance = untracked(() => form(this.entity, combinedSchema));
      } else if (hasFormSchema) {
        const formSchema = createFormLevelSchema(config.schema!) as Schema<TModel>;
        formInstance = untracked(() => form(this.entity, formSchema));
      } else {
        formInstance = untracked(() => form(this.entity));
      }

      untracked(() => this.rootFormRegistry.registerRootForm(formInstance));

      return formInstance;
    });
  });

  /**
   * Field signal context for injection into child components.
   */
  readonly fieldSignalContext = computed<FieldSignalContext<TModel>>(() => ({
    injector: this.injector,
    value: this.isInitialized ? this.deps.value : signal(undefined),
    defaultValues: this.defaultValues,
    form: this.form(),
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Form State
  // ─────────────────────────────────────────────────────────────────────────────

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
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldsSource = computed(() => this.formSetup().fields);

  /**
   * Injector for field components with FIELD_SIGNAL_CONTEXT.
   */
  private fieldInjector = computed(() =>
    Injector.create({
      parent: this.injector,
      providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: this.fieldSignalContext() }],
    }),
  );

  /**
   * Resolved fields ready for rendering.
   */
  readonly resolvedFields: Signal<ResolvedField[]>;

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Streams (for outputs)
  // ─────────────────────────────────────────────────────────────────────────────

  /** Stream of submit events when form is valid. */
  readonly submitted$: Observable<Partial<TModel>>;

  /** Stream of reset events. */
  readonly reset$: Observable<void>;

  /** Stream of clear events. */
  readonly cleared$: Observable<void>;

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.scheduler = createSideEffectScheduler(this.injector);

    // Initialize resolved fields with deferred derivation
    this.resolvedFields = derivedFromDeferred(
      this.fieldsSource,
      pipe(
        switchMap((fields) => {
          if (!fields || fields.length === 0 || !this.isInitialized) {
            return of([] as (ResolvedField | undefined)[]);
          }
          const context = {
            loadTypeComponent: (type: string) => this.deps.fieldRegistry.loadTypeComponent(type),
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
    ) as Signal<ResolvedField[]>;

    // Initialize event streams
    this.submitted$ = this.eventBus.on<SubmitEvent>('submit').pipe(
      filter(() => {
        if (!this.valid()) {
          this.logger.debug('Form submitted while invalid, not emitting to (submitted) output');
          return false;
        }
        return true;
      }),
      switchMap(() => {
        const config = this.activeConfig();
        const submissionConfig = config?.submission;

        if (submissionConfig?.action) {
          this.logger.warn(
            'Both `submission.action` and `(submitted)` output are configured. ' +
              'When using `submission.action`, the `(submitted)` output will not emit. ' +
              'Use either `submission.action` OR `(submitted)`, not both.',
          );
          return EMPTY;
        }

        return of(this.formValue() as TModel);
      }),
      takeUntilDestroyed(this.destroyRef),
    );

    this.reset$ = this.eventBus.on<FormResetEvent>('form-reset').pipe(
      map(() => undefined as void),
      takeUntilDestroyed(this.destroyRef),
    );

    this.cleared$ = this.eventBus.on<FormClearEvent>('form-clear').pipe(
      map(() => undefined as void),
      takeUntilDestroyed(this.destroyRef),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Initializes the state manager with component dependencies.
   *
   * Must be called once from the component constructor after injection is complete.
   *
   * @param deps - Dependencies from the DynamicForm component
   */
  initialize(deps: FormStateManagerDeps<TFields, TModel>): void {
    if (this.isInitialized) {
      this.logger.warn('FormStateManager already initialized');
      return;
    }

    this.deps = deps;
    this.isInitialized = true;

    // Initialize the config transition signal now that deps are available
    this.configTransitionSignal = linkedSignal<FormConfig<TFields>, ConfigTransitionState<TFields>>({
      source: this.deps.config,
      computation: (newConfig, previous): ConfigTransitionState<TFields> => {
        // First load - render immediately without teardown phase
        if (previous === undefined) {
          return { activeConfig: newConfig, renderPhase: 'render' };
        }

        const prevState = previous.value;

        // If already in teardown phase, update pending config (latest wins for rapid changes)
        if (prevState.renderPhase === 'teardown') {
          return { ...prevState, pendingConfig: newConfig };
        }

        // Start teardown phase - preservedValue will be set by effect to avoid cycles
        return {
          activeConfig: prevState.activeConfig,
          pendingConfig: newConfig,
          renderPhase: 'teardown',
        };
      },
    });

    // Setup effects in injection context to support explicitEffect
    runInInjectionContext(this.injector, () => {
      this.setupEffects();
      this.setupEventHandlers();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Updates the form value model.
   */
  updateValue(value: Partial<TModel>): void {
    if (this.isInitialized) {
      this.deps.value.set(value);
    }
  }

  /**
   * Resets the form to default values.
   */
  reset(): void {
    const defaults = this.defaultValues();
    (this.form()().value.set as (value: unknown) => void)(defaults);
    if (this.isInitialized) {
      this.deps.value.set(defaults as Partial<TModel>);
    }
  }

  /**
   * Clears the form to empty state.
   */
  clear(): void {
    const emptyValue = {} as Partial<TModel>;
    (this.form()().value.set as (value: unknown) => void)(emptyValue);
    if (this.isInitialized) {
      this.deps.value.set(emptyValue);
    }
  }

  /**
   * Triggers form submission.
   */
  submit(): void {
    this.eventBus.dispatch(SubmitEvent);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods - Setup
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    // Sync entity changes to the value signal
    explicitEffect([this.entity], ([currentEntity]) => {
      if (!this.isInitialized) return;

      const currentValue = this.deps.value();
      if (!isEqual(currentEntity, currentValue)) {
        this.deps.value.set(currentEntity);
      }
    });

    // Clear loading errors when config changes
    explicitEffect([computed(() => (this.isInitialized ? this.deps.config() : undefined))], () => {
      this.fieldLoadingErrors.set([]);
    });

    // Config transition effect: captures value when entering teardown, then applies new config
    explicitEffect([this.configTransitionSignal], ([state]) => {
      if (state.renderPhase === 'teardown' && state.pendingConfig) {
        // Capture current form value when entering teardown phase
        const currentValue = untracked(() => this.formValue());
        this.transitionPreservedValue.set(currentValue as Record<string, unknown>);

        // afterNextRender ensures old components are destroyed before we proceed
        afterNextRender(
          () => {
            // Guard against execution after component destruction
            if (this.isDestroyed) return;

            const pendingConfig = state.pendingConfig!;
            const preservedValue = this.transitionPreservedValue();

            // Transition to render phase with new config
            this.configTransitionSignal.set({
              activeConfig: pendingConfig,
              renderPhase: 'render',
            });

            // Restore preserved values for fields that still exist in the new config
            if (preservedValue) {
              afterNextRender(
                () => {
                  // Guard against execution after component destruction
                  if (this.isDestroyed) return;

                  const schemaFields = untracked(() => this.formSetup().schemaFields);
                  if (schemaFields) {
                    const validKeys = new Set(schemaFields.map((f) => f.key).filter(Boolean));
                    const filtered: Record<string, unknown> = {};
                    for (const [key, val] of Object.entries(preservedValue)) {
                      if (validKeys.has(key)) {
                        filtered[key] = val;
                      }
                    }
                    if (Object.keys(filtered).length > 0 && this.isInitialized) {
                      this.deps.value.update((current) => ({ ...current, ...filtered }) as Partial<TModel>);
                    }
                  }
                  // Clear preserved value after restoration
                  this.transitionPreservedValue.set(undefined);
                },
                { injector: this.injector },
              );
            }
          },
          { injector: this.injector },
        );
      }
    });
  }

  private setupEventHandlers(): void {
    this.eventBus
      .on<FormResetEvent>('form-reset')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.reset());

    this.eventBus
      .on<FormClearEvent>('form-clear')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.clear());
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

    if (customFnConfig.derivations) {
      this.functionRegistry.setDerivationFunctions(customFnConfig.derivations);
    }

    this.functionRegistry.setValidators(customFnConfig.validators);
    this.functionRegistry.setAsyncValidators(customFnConfig.asyncValidators);
    this.functionRegistry.setHttpValidators(customFnConfig.httpValidators);
  }

  private createFormSetupFromConfig(
    fields: FieldDef<unknown>[],
    mode: FormMode,
    registry: Map<string, FieldTypeDefinition>,
  ): FormSetup<TFields> {
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
      mode,
      registry,
    };
  }

  private createEmptyFormSetup(registry: Map<string, FieldTypeDefinition>): FormSetup<TFields> {
    return {
      fields: [],
      schemaFields: [],
      defaultValues: {} as Record<string, unknown>,
      mode: 'non-paged' as const,
      registry,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.rootFormRegistry.unregisterForm();
  }
}

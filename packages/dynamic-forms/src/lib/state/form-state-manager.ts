import {
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
import { EMPTY, filter, forkJoin, map, Observable, of, pipe, scan, switchMap, take } from 'rxjs';
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
import { detectFormMode, FormMode } from '../models/types/form-mode';
import { InferFormValue } from '../models/types/form-value-inference';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { FunctionRegistryService } from '../core/registry/function-registry.service';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { createSchemaFromFields } from '../core/schema-builder';
import { createFormLevelSchema } from '../core/form-schema-merger';
import { collectCrossFieldEntries } from '../core/cross-field/cross-field-collector';
import { flattenFields } from '../utils/flattener/field-flattener';
import { memoize, isEqual } from '../utils/object-utils';
import { createContainerFieldProcessors } from '../utils/container-utils/container-field-processors';
import { derivedFromDeferred } from '../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField, resolveFieldSync } from '../utils/resolve-field/resolve-field';
import { FormModeValidator } from '../utils/form-validation/form-mode-validator';

import { Action, FieldLoadingError, FormSetup, isReadyState, isTransitioningState, LifecycleState, Phase } from './state-types';
import { createSideEffectScheduler } from './side-effect-scheduler';
import { createFormStateMachine, FormStateMachine } from './form-state-machine';

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
    getType: (name: string) => FieldTypeDefinition | undefined;
    getLoadedComponent: (name: string) => Type<unknown> | undefined;
    loadTypeComponent: (type: string) => Promise<Type<unknown> | undefined>;
  };
}

/**
 * Central service that manages all form state and coordinates the form lifecycle.
 * Single source of truth for lifecycle state, field resolution, form signals, and events.
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
  private readonly functionRegistry = inject(FunctionRegistryService);
  private readonly schemaRegistry = inject(SchemaRegistryService);

  // ─────────────────────────────────────────────────────────────────────────────
  // State Machine
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * The state machine, wrapped in a signal so computed signals
   * re-evaluate when it's created during initialize().
   */
  private readonly machineSignal = signal<FormStateMachine<TFields> | null>(null);

  /**
   * Component dependencies, stored as a signal so computed signals
   * that read from it automatically re-evaluate when initialize() is called.
   * Null before initialize().
   */
  private readonly _setup = signal<FormStateManagerDeps<TFields, TModel> | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldProcessors = createContainerFieldProcessors();

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Internal State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Field loading errors accumulated during resolution.
   */
  readonly fieldLoadingErrors = signal<FieldLoadingError[]>([]);

  /**
   * Class-level form cache for the "hold until settled" pattern.
   * MUST be class-level — a local variable in the computed would reset on re-evaluation.
   * Mutable ref avoids a reactive cycle (form → isSettled → resolvedFields → form).
   */
  private readonly _formCache: { current: unknown } = { current: undefined };

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Derived from State Machine
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * The currently active config used for form rendering.
   * Teardown/Applying → old config, Restoring → new config.
   * Returns deps.config() in uninitialized state so the form schema is
   * available before the state machine dispatches 'initialize'.
   */
  readonly activeConfig = computed(() => {
    const machine = this.machineSignal();
    if (!machine) return undefined;
    const state = machine.state();

    if (state.type === LifecycleState.Uninitialized) {
      return this._setup()?.config();
    }

    if (isReadyState(state)) return state.config;
    if (isTransitioningState(state)) {
      if (state.phase === Phase.Teardown || state.phase === Phase.Applying) return state.currentConfig;
      return state.pendingConfig;
    }
    if (state.type === LifecycleState.Initializing) return state.config;
    return undefined;
  });

  /**
   * Current render phase: 'render' = showing form, 'teardown' = hiding old components.
   */
  readonly renderPhase = computed(() => {
    const machine = this.machineSignal();
    if (!machine) return 'render';
    const state = machine.state();
    if (isTransitioningState(state) && state.phase === Phase.Teardown) return Phase.Teardown;
    return 'render';
  });

  /** Whether to render the form template. */
  readonly shouldRender = computed(() => this.activeConfig() !== undefined);

  /**
   * Computed form mode detection with validation.
   */
  readonly formModeDetection = computed(() => {
    const config = this.activeConfig();
    if (!config) {
      return { mode: 'non-paged' as const, isValid: true, errors: [] };
    }

    return detectFormMode(config.fields || []);
  });

  /** Validation result for the current form configuration. */
  private readonly formConfigValidation = computed(() => {
    const config = this.activeConfig();
    if (!config) return { isValid: true, errors: [] as string[], warnings: [] as string[] };
    return FormModeValidator.validateFormConfiguration(config.fields || []);
  });

  /**
   * Effective form options (merged from config and input).
   */
  readonly effectiveFormOptions = computed(() => {
    const config = this.activeConfig();
    const configOptions = config?.options || {};
    const inputOptions = this._setup()?.formOptions() ?? undefined;
    return { ...configOptions, ...inputOptions };
  });

  /**
   * Page field definitions (for paged forms).
   */
  readonly pageFieldDefinitions = computed(() => {
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

  private readonly rawFieldRegistry = computed(() => this._setup()?.fieldRegistry.raw ?? new Map());

  /** Computed form setup — reads from the state machine, computed from config on bootstrap. */
  readonly formSetup = computed(() => {
    const machine = this.machineSignal();
    const registry = this.rawFieldRegistry();

    if (!machine) {
      return this.createEmptyFormSetup(registry);
    }

    const state = machine.state();

    if (isReadyState(state)) {
      return state.formSetup;
    }

    if (isTransitioningState(state)) {
      if (state.phase === Phase.Restoring && state.pendingFormSetup) {
        return state.pendingFormSetup;
      }
      return state.currentFormSetup;
    }

    // Bootstrap path: register validators before first form creation.
    // Only runs in uninitialized/initializing — once ready, reads from state.formSetup.
    const config = this.activeConfig();
    if (!config) {
      return this.createEmptyFormSetup(registry);
    }

    untracked(() => this.registerValidatorsFromConfig(config));

    if (config.fields && config.fields.length > 0) {
      const modeDetection = this.formModeDetection();
      return this.createFormSetupFromConfig(config.fields as FieldDef<unknown>[], modeDetection.mode, registry);
    }

    return this.createEmptyFormSetup(registry);
  });

  /**
   * Default values computed from field definitions.
   */
  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues as TModel);

  /** Valid field keys — memoized separately so the Set isn't rebuilt on every keystroke. */
  private readonly validKeys = computed(() => {
    const schemaFields = this.formSetup().schemaFields;
    if (!schemaFields || schemaFields.length === 0) return undefined;
    return new Set(schemaFields.map((f) => f.key).filter((key): key is string => key !== undefined));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Entity & Form
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Entity (form value merged with defaults).
   */
  readonly entity = linkedSignal<TModel>(() => {
    const deps = this._setup();
    if (!deps) {
      return {} as TModel;
    }

    const inputValue = deps.value();
    const defaults = this.defaultValues();
    const keys = this.validKeys();

    const combined = { ...defaults, ...inputValue };

    if (keys) {
      const filtered: Record<string, unknown> = {};
      for (const key of Object.keys(combined)) {
        if (keys.has(key)) {
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
  readonly form = computed(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();
      const config = this.activeConfig();

      let formInstance: ReturnType<typeof form<TModel>>;

      if (!config) {
        formInstance = untracked(() => form(this.entity));
      } else {
        const hasFields = setup.schemaFields && setup.schemaFields.length > 0;
        const hasFormSchema = config.schema !== undefined;

        if (hasFields) {
          const crossFieldCollection = collectCrossFieldEntries(setup.schemaFields as FieldDef<unknown>[]);
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
      }

      return formInstance;
    });
  });

  /** Whether resolvedFields has caught up with fieldsSource (set in constructor). */
  private isFieldPipelineSettled!: Signal<boolean>;

  /**
   * Field signal context injected into child components.
   * The `form` getter uses a "hold until settled" pattern: returns the cached
   * (old) form while resolvedFields != fieldsSource, preventing stale components
   * from accessing missing FieldTree references.
   */
  readonly fieldSignalContext: Signal<FieldSignalContext<TModel>> = computed(() => {
    const formSignal = this.form;
    const isSettled = () => this.isFieldPipelineSettled();
    const formCache = this._formCache;

    return {
      injector: this.injector,
      value: this._setup()?.value ?? signal(undefined),
      defaultValues: this.defaultValues,
      get form() {
        const currentForm = formSignal();
        const settled = isSettled();

        if (!settled && formCache.current) {
          return formCache.current as ReturnType<typeof form<TModel>>;
        }

        formCache.current = currentForm;
        return currentForm;
      },
    };
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Form State
  // ─────────────────────────────────────────────────────────────────────────────

  /** Intermediate computed that unwraps the double-signal (form()()) once. */
  private readonly formInstance = computed(() => this.form()());

  /** Current form values (reactive). */
  readonly formValue = computed(() => this.formInstance().value());

  /** Whether the form is currently valid. */
  readonly valid = computed(() => this.formInstance().valid());

  /** Whether the form is currently invalid. */
  readonly invalid = computed(() => this.formInstance().invalid());

  /** Whether any form field has been modified. */
  readonly dirty = computed(() => this.formInstance().dirty());

  /** Whether any form field has been touched (blurred). */
  readonly touched = computed(() => this.formInstance().touched());

  /** Current validation errors from all fields. */
  readonly errors = computed(() => this.formInstance().errors());

  /** Whether the form is disabled (from options or form state). */
  readonly disabled = computed(() => {
    const optionsDisabled = this.effectiveFormOptions().disabled;
    const formDisabled = this.formInstance().disabled();
    return optionsDisabled ?? formDisabled;
  });

  /** Whether the form is currently submitting. */
  readonly submitting = computed(() => this.formInstance().submitting());

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Phase-aware field source that coordinates component lifecycle with form updates.
   * Teardown/Applying → intersection of old/new fields; Restoring → all new fields.
   * Uses key+type equality to avoid spurious emissions during rapid transitions.
   */
  private readonly fieldsSource = computed(
    () => {
      const machine = this.machineSignal();
      if (!machine) return [];

      const state = machine.state();

      if (isTransitioningState(state)) {
        const oldFields = state.currentConfig.fields ?? [];
        const newFields = state.pendingConfig.fields ?? [];
        const newKeys = new Set(newFields.map((f) => f.key));

        if (state.phase === Phase.Teardown || state.phase === Phase.Applying) {
          return oldFields.filter((f) => newKeys.has(f.key));
        }

        if (state.phase === Phase.Restoring) {
          return state.pendingFormSetup?.fields ?? this.formSetup().fields;
        }
      }

      return this.formSetup().fields;
    },
    {
      equal: (a, b) => {
        if (a === b) return true;
        if (a.length !== b.length) return false;
        return a.every((field, i) => field.key === b[i].key && field.type === b[i].type);
      },
    },
  );

  /**
   * Injector for field components with FIELD_SIGNAL_CONTEXT.
   */
  private fieldInjector = computed(() =>
    Injector.create({
      parent: this.injector,
      providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: this.fieldSignalContext() }],
    }),
  );

  /** Resolved fields ready for rendering. */
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

  /** Emits once when the state machine reaches 'ready'. Useful for tests. */
  get ready$(): Observable<void> {
    const machine = this.machineSignal();
    if (!machine) {
      return of(undefined);
    }
    return machine.state$.pipe(
      filter(isReadyState),
      take(1),
      map(() => undefined),
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.resolvedFields = derivedFromDeferred(
      this.fieldsSource,
      pipe(
        switchMap((fields) => {
          const deps = this._setup();
          if (!fields || fields.length === 0 || !deps) {
            return of([] as (ResolvedField | undefined)[]);
          }

          const registry = this.rawFieldRegistry();
          const injector = this.fieldInjector();

          const syncContext = {
            getLoadedComponent: (type: string) => deps.fieldRegistry.getLoadedComponent(type),
            registry,
            injector,
          };

          // Hybrid: resolve cached fields sync, only await uncached ones
          const results: (ResolvedField | undefined)[] = new Array(fields.length);
          const asyncIndexes: number[] = [];
          const asyncObs: Observable<ResolvedField | undefined>[] = [];

          const onError = (fieldDef: FieldDef<unknown>, error: unknown) => {
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
          };

          for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            const def = deps.fieldRegistry.getType(f.type);
            const isCached = !def?.loadComponent || deps.fieldRegistry.getLoadedComponent(f.type);

            if (isCached) {
              results[i] = resolveFieldSync(f, syncContext);
            } else {
              asyncIndexes.push(i);
              asyncObs.push(
                resolveField(f, {
                  loadTypeComponent: (type: string) => deps.fieldRegistry.loadTypeComponent(type),
                  registry,
                  injector,
                  destroyRef: this.destroyRef,
                  onError,
                }),
              );
            }
          }

          if (asyncObs.length === 0) {
            return of(results);
          }

          return forkJoin(asyncObs).pipe(
            map((asyncResults) => {
              for (let j = 0; j < asyncResults.length; j++) {
                results[asyncIndexes[j]] = asyncResults[j];
              }
              return results;
            }),
          );
        }),
        map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
        scan(reconcileFields, [] as ResolvedField[]),
      ),
      { initialValue: [] as ResolvedField[], injector: this.injector },
    ) as Signal<ResolvedField[]>;

    // Length comparison works because reconcileFields preserves ordering and
    // fieldsSource changes atomically during transitions (lengths won't match until settled).
    this.isFieldPipelineSettled = computed(() => {
      return this.fieldsSource().length === this.resolvedFields().length;
    });

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

  /** Initializes the state manager. Must be called once from the component constructor. */
  initialize(deps: FormStateManagerDeps<TFields, TModel>): void {
    if (this.machineSignal()) {
      this.logger.warn('FormStateManager already initialized');
      return;
    }

    this._setup.set(deps);

    const scheduler = createSideEffectScheduler(this.injector);
    const machine = createFormStateMachine<TFields>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      scheduler,
      logger: this.logger,
      createFormSetup: (config) => {
        this.registerValidatorsFromConfig(config);
        return this.createFormSetupFromConfig(
          (config.fields as FieldDef<unknown>[]) ?? [],
          detectFormMode(config.fields ?? []).mode,
          this.rawFieldRegistry(),
        );
      },
      captureValue: () => this.formValue() as Record<string, unknown>,
      restoreValue: (values, validKeys) => {
        const filtered: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(values)) {
          if (validKeys.has(key)) {
            filtered[key] = val;
          }
        }
        if (Object.keys(filtered).length > 0) {
          deps.value.update((current) => ({ ...current, ...filtered }) as Partial<TModel>);
        }
      },
      onTransition: (transition) => {
        this.logger.debug('State transition:', transition.from.type, '→', transition.to.type, transition.action.type);
      },
    });

    this.machineSignal.set(machine);

    runInInjectionContext(this.injector, () => {
      this.setupEffects(deps);
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
    this._setup()?.value.set(value);
  }

  /**
   * Resets the form to default values.
   */
  reset(): void {
    const defaults = this.defaultValues();
    (this.form()().value as WritableSignal<TModel>).set(defaults);
    this._setup()?.value.set(defaults as Partial<TModel>);
  }

  /**
   * Clears the form to empty state.
   */
  clear(): void {
    const emptyValue = {} as TModel;
    (this.form()().value as WritableSignal<TModel>).set(emptyValue);
    this._setup()?.value.set(emptyValue);
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

  private setupEffects(deps: FormStateManagerDeps<TFields, TModel>): void {
    explicitEffect([deps.config], ([config]) => {
      this.fieldLoadingErrors.set([]);

      const machine = this.machineSignal();
      if (!machine) return;

      const state = machine.currentState;
      if (state.type === LifecycleState.Uninitialized) {
        machine.dispatch({ type: Action.Initialize, config });
      } else if (state.type !== LifecycleState.Initializing) {
        machine.dispatch({ type: Action.ConfigChange, config });
      }
    });

    explicitEffect([this.entity], ([currentEntity]) => {
      const currentValue = deps.value();
      if (!isEqual(currentEntity, currentValue)) {
        deps.value.set(currentEntity);
      }
    });

    explicitEffect([this.formConfigValidation], ([validation]) => {
      if (!validation.isValid) {
        this.logger.error('Invalid form configuration:', validation.errors);
      }
      if (validation.warnings.length > 0) {
        this.logger.warn('Form configuration warnings:', validation.warnings);
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
    const flattenedFields = this.fieldProcessors.memoizedFlattenFields(fields, registry);
    const flattenedFieldsForRendering = this.memoizedFlattenFieldsForRendering(fields, registry);
    const fieldsById = this.fieldProcessors.memoizedKeyBy(flattenedFields);
    const defaultValues = this.fieldProcessors.memoizedDefaultValues(fieldsById, registry);
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
    this.machineSignal()?.dispatch({ type: Action.Destroy });
  }
}

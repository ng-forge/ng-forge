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
import { detectFormMode, FormMode, FormModeDetectionResult } from '../models/types/form-mode';
import { InferFormValue } from '../models/types';
import { DynamicFormLogger } from '../providers/features/logger/logger.token';
import { FunctionRegistryService, RootFormRegistryService, SchemaRegistryService } from '../core/registry';
import { createSchemaFromFields } from '../core/schema-builder';
import { createFormLevelSchema } from '../core/form-schema-merger';
import { collectCrossFieldEntries } from '../core/cross-field/cross-field-collector';
import { flattenFields } from '../utils/flattener/field-flattener';
import { memoize, isEqual } from '../utils/object-utils';
import { createContainerFieldProcessors } from '../utils/container-utils';
import { derivedFromDeferred } from '../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from '../utils/resolve-field/resolve-field';
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
 * The state machine pattern ensures:
 * - Deterministic state transitions via concatMap
 * - No race conditions during rapid config changes
 * - Clean separation between state logic and side effects
 *
 * @example
 * ```typescript
 * // In component
 * providers: [FormStateManager, ...]
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
  // State Machine
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * The state machine, wrapped in a signal so computed signals
   * re-evaluate when it's created during initialize().
   */
  private readonly machineSignal = signal<FormStateMachine<TFields> | null>(null);
  private deps!: FormStateManagerDeps<TFields, TModel>;

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
   * Class-level cached form for the "hold until settled" pattern.
   *
   * This MUST live at class level (not inside the `fieldSignalContext` computed)
   * so it persists when `fieldSignalContext` re-evaluates. If it were a local
   * variable in the computed, it would reset to `undefined` on re-evaluation,
   * defeating the hold pattern and exposing the new form to stale components.
   *
   * Stored as `unknown` to avoid generic type gymnastics — it's only used
   * as an opaque cache that gets cast back to the correct type in the getter.
   */
  private readonly _formCache: { current: unknown } = { current: undefined };

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Derived from State Machine
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * The currently active config used for form rendering.
   *
   * During config transitions, coordinates with fieldsSource to ensure:
   * - Components are destroyed BEFORE their form fields are removed
   * - Components are created AFTER their form fields exist
   *
   * Phase timing:
   * - Teardown: OLD config (form unchanged, fieldsSource=intersection → removed components destroyed)
   * - Applying: NEW config (form updates, fieldsSource=intersection → safe components update)
   * - Restoring: NEW config (form ready, fieldsSource=all new → new components created)
   *
   * IMPORTANT: For the initial config, we return deps.config() directly when the state
   * machine is still in 'uninitialized' state. This allows the form to be created with
   * the correct schema during the first render, before the explicitEffect dispatches
   * the 'initialize' action. Without this, logic functions (hidden, readonly, etc.)
   * wouldn't work because registerFormValueSignal wouldn't be called.
   */
  readonly activeConfig: Signal<FormConfig<TFields> | undefined> = computed(() => {
    const machine = this.machineSignal();
    if (!machine) return undefined;
    const state = machine.state();

    // For initial render: return deps.config directly when machine hasn't been initialized yet.
    // This avoids needing to dispatch synchronously during component construction (which
    // causes stack overflow in test suites with @for loops), while still making the config
    // available so logic functions work correctly.
    if (state.type === LifecycleState.Uninitialized) {
      return this.deps?.config();
    }

    if (isReadyState(state)) return state.config;
    if (isTransitioningState(state)) {
      // teardown: old config (form unchanged, removed components being destroyed)
      // applying: old config (form stays unchanged while resolvedFields settles;
      //           the state machine precomputes the new setup independently)
      // restoring: new config (form updates, new components created)
      if (state.phase === Phase.Teardown || state.phase === Phase.Applying) return state.currentConfig;
      return state.pendingConfig; // restoring only
    }
    if (state.type === LifecycleState.Initializing) return state.config;
    return undefined;
  });

  /**
   * Current render phase: 'render' = showing form, 'teardown' = hiding old components.
   */
  readonly renderPhase: Signal<'render' | 'teardown'> = computed(() => {
    const machine = this.machineSignal();
    if (!machine) return 'render';
    const state = machine.state();
    if (isTransitioningState(state) && state.phase === Phase.Teardown) return Phase.Teardown;
    return 'render';
  });

  /**
   * Whether to render the form template.
   *
   * With coordinated field transitions, we always render when config is available.
   * The `fieldsSource` signal controls which specific fields are rendered during
   * each transition phase, ensuring components are created/destroyed at the right time.
   */
  readonly shouldRender: Signal<boolean> = computed(() => this.activeConfig() !== undefined);

  /**
   * Computed form mode detection with validation.
   */
  readonly formModeDetection: Signal<FormModeDetectionResult> = computed(() => {
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
  readonly effectiveFormOptions: Signal<FormOptions> = computed(() => {
    const config = this.activeConfig();
    const configOptions = config?.options || {};
    const inputOptions = this.deps?.formOptions() ?? undefined;
    return { ...configOptions, ...inputOptions };
  });

  /**
   * Page field definitions (for paged forms).
   */
  readonly pageFieldDefinitions: Signal<PageField[]> = computed(() => {
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

  private readonly rawFieldRegistry: Signal<Map<string, FieldTypeDefinition>> = computed(() => this.deps?.fieldRegistry.raw ?? new Map());

  /**
   * Computed form setup - reads from the state machine as single source of truth.
   *
   * During transitions, this returns the appropriate FormSetup for the current phase:
   * - uninitialized/initializing: compute from config (bootstrap, before state machine has FormSetup)
   * - ready: read from state.formSetup
   * - teardown/applying: read from state.currentFormSetup (old setup, form unchanged)
   * - restoring: read from state.pendingFormSetup (new setup for new config)
   */
  readonly formSetup: Signal<FormSetup<TFields>> = computed(() => {
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

    // uninitialized or initializing: compute from config for bootstrap.
    // Register validators/schemas eagerly so the form() computed (which runs
    // during the first render, before the state machine dispatches 'initialize')
    // can resolve schemas and custom validators.
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
  readonly defaultValues: WritableSignal<TModel> = linkedSignal(() => this.formSetup().defaultValues as TModel);

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Entity & Form
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Entity (form value merged with defaults).
   */
  private readonly entity: WritableSignal<TModel> = linkedSignal<TModel>(() => {
    if (!this.deps) {
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
  readonly form: Signal<ReturnType<typeof form<TModel>>> = computed(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();
      const config = this.activeConfig();

      // IMPORTANT: Register the form value signal BEFORE field resolution starts.
      // This ensures logic functions (hidden, readonly, etc.) can access form values
      // via rootFormRegistry.getFormValue() during schema evaluation.
      untracked(() => this.rootFormRegistry.registerFormValueSignal(this.entity as Signal<Record<string, unknown>>));

      let formInstance: ReturnType<typeof form<TModel>>;

      if (!config) {
        formInstance = untracked(() => form(this.entity));
      } else {
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
      }

      untracked(() => this.rootFormRegistry.registerRootForm(formInstance));

      return formInstance;
    });
  });

  /**
   * Whether the resolved fields pipeline has settled (resolvedFields matches fieldsSource).
   *
   * During config transitions, `fieldsSource` updates immediately but `resolvedFields`
   * settles asynchronously (field resolution uses Promises via `derivedFromDeferred`).
   * This signal tracks when the pipeline has caught up, ensuring the form getter only
   * exposes the new form AFTER stale components have been removed by `@for`.
   *
   * Initialized in the constructor after `resolvedFields` is set.
   */
  private isFieldPipelineSettled!: Signal<boolean>;

  /**
   * Field signal context for injection into child components.
   *
   * Uses a getter for `form` that caches the form until the field resolution
   * pipeline has settled. This ensures alive components always see a form that
   * contains their fields, preventing "ctx.field(...) is not a function" crashes.
   *
   * The form getter uses a "hold until settled" pattern:
   * - Pipeline unsettled (resolvedFields != fieldsSource): returns the cached (old)
   *   form so alive components retain valid FieldTree references
   * - Pipeline settled: returns the current form and updates the cache
   *
   * This is more robust than tracking the state machine phase because the async
   * gap between `resolvedFields` settling and the state reaching `ready` is what
   * causes stale components to access missing form fields.
   *
   * Mappers access context.form inside their own computed signals, establishing
   * reactive dependencies on formSignal and isFieldPipelineSettled. This ensures
   * mappers re-evaluate when:
   * 1. The form changes (signal dependency)
   * 2. The pipeline settles (signal dependency) - safe to expose new form
   */
  readonly fieldSignalContext: Signal<FieldSignalContext<TModel>> = computed(() => {
    const formSignal = this.form;
    // Thunk: isFieldPipelineSettled is set in the constructor after resolvedFields.
    // This computed evaluates lazily (after construction), so the reference is safe.
    const isSettled = () => this.isFieldPipelineSettled();
    // Close over the class-level _formCache so it survives fieldSignalContext re-evaluations.
    // If this were a local variable, it would reset when defaultValues/value changes
    // trigger a re-evaluation, breaking the hold pattern during transitions.
    const formCache = this._formCache;

    return {
      injector: this.injector,
      value: this.deps?.value ?? signal(undefined),
      defaultValues: this.defaultValues,
      get form() {
        // Always read formSignal to establish the reactive dependency in the
        // calling computed (mapper), even if we return a cached value.
        const currentForm = formSignal();
        // Read settled state to establish dependency - when the pipeline settles,
        // the calling computed re-evaluates and gets the updated form.
        const settled = isSettled();

        if (!settled && formCache.current) {
          // Pipeline hasn't settled: resolvedFields doesn't match fieldsSource.
          // Stale components (for removed fields) are still alive in the DOM.
          // Return cached (old) form so their mappers find valid FieldTree refs.
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

  /** Current form values (reactive). */
  readonly formValue: Signal<Partial<TModel>> = computed(() => this.form()().value());

  /** Whether the form is currently valid. */
  readonly valid: Signal<boolean> = computed(() => this.form()().valid());

  /** Whether the form is currently invalid. */
  readonly invalid: Signal<boolean> = computed(() => this.form()().invalid());

  /** Whether any form field has been modified. */
  readonly dirty: Signal<boolean> = computed(() => this.form()().dirty());

  /** Whether any form field has been touched (blurred). */
  readonly touched: Signal<boolean> = computed(() => this.form()().touched());

  /** Current validation errors from all fields. */
  readonly errors = computed(() => this.form()().errors());

  /** Whether the form is disabled (from options or form state). */
  readonly disabled: Signal<boolean> = computed(() => {
    const optionsDisabled = this.effectiveFormOptions().disabled;
    const formDisabled = this.form()().disabled();
    return optionsDisabled ?? formDisabled;
  });

  /** Whether the form is currently submitting. */
  readonly submitting: Signal<boolean> = computed(() => this.form()().submitting());

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Phase-aware field source that coordinates component lifecycle with form updates.
   *
   * This ensures components are never created before their form fields exist,
   * and are destroyed before their form fields are removed.
   *
   * During transitions:
   * - Teardown: Returns intersection of old/new fields (removed components destroyed first)
   * - Applying: Returns intersection (safe components update to new form)
   * - Restoring: Returns all new fields (new components created after form ready)
   *
   * Uses a key+type equality function to prevent unnecessary signal emissions during
   * rapid state transitions (teardown → applying → restoring). Without this, each
   * state change produces a new array reference even if the content is identical,
   * causing `switchMap` in the resolvedFields pipeline to cancel in-progress field
   * resolution and preventing components from being properly destroyed.
   */
  private readonly fieldsSource: Signal<FieldDef<unknown>[]> = computed(
    () => {
      const machine = this.machineSignal();
      if (!machine) return [];

      const state = machine.state();

      if (isTransitioningState(state)) {
        const oldFields = state.currentConfig.fields ?? [];
        const newFields = state.pendingConfig.fields ?? [];
        const newKeys = new Set(newFields.map((f) => f.key));

        if (state.phase === Phase.Teardown || state.phase === Phase.Applying) {
          // Return intersection: only fields that exist in both configs
          // During teardown: old form, removed components destroyed
          // During applying: old form still active, safe components stay alive
          return oldFields.filter((f) => newKeys.has(f.key));
        }

        if (state.phase === Phase.Restoring) {
          // Return all new fields from the pending FormSetup (new components created after form is ready)
          return state.pendingFormSetup?.fields ?? this.formSetup().fields;
        }
      }

      // Ready state or initializing: use formSetup fields
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
  private fieldInjector: Signal<Injector> = computed(() =>
    Injector.create({
      parent: this.injector,
      providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: this.fieldSignalContext() }],
    }),
  );

  /**
   * Resolved fields ready for rendering.
   * Components are resolved asynchronously but benefit from the component cache
   * in the field registry, making resolution near-instant after first render.
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

  /**
   * Observable that emits when the state machine reaches the 'ready' state.
   *
   * Useful for tests to await config transitions completing without arbitrary delays.
   * Emits once per subscription when the state becomes ready.
   *
   * @example
   * ```typescript
   * fixture.componentRef.setInput('dynamic-form', newConfig);
   * await firstValueFrom(stateManager.ready$);
   * expect(component.formValue()).toEqual({ ... });
   * ```
   */
  get ready$(): Observable<void> {
    const machine = this.machineSignal();
    if (!machine) {
      // No machine yet - return observable that completes immediately
      // This shouldn't happen in normal usage
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
    // Initialize resolved fields with deferred derivation.
    // The component cache in the field registry makes this near-instant after first render.
    this.resolvedFields = derivedFromDeferred(
      this.fieldsSource,
      pipe(
        switchMap((fields) => {
          if (!fields || fields.length === 0 || !this.deps) {
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

    // Track whether the resolved fields pipeline has settled.
    // This memoized computed ensures mappers only depend on a boolean (not the full
    // resolvedFields array), preventing unnecessary re-evaluations when resolvedFields
    // changes but the settled state doesn't.
    this.isFieldPipelineSettled = computed(() => {
      const source = this.fieldsSource();
      const resolved = this.resolvedFields();
      if (source.length !== resolved.length) return false;
      if (source.length === 0) return true;
      const resolvedKeys = new Set(resolved.map((f) => f.key));
      return source.every((f) => resolvedKeys.has(f.key));
    });

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
    if (this.machineSignal()) {
      this.logger.warn('FormStateManager already initialized');
      return;
    }

    this.deps = deps;

    // Create the scheduler and state machine
    const scheduler = createSideEffectScheduler(this.injector);
    const machine = createFormStateMachine<TFields>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      scheduler,
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
          this.deps.value.update((current) => ({ ...current, ...filtered }) as Partial<TModel>);
        }
      },
      onTransition: (transition) => {
        this.logger.debug('State transition:', transition.from.type, '→', transition.to.type, transition.action.type);
      },
    });

    // Store the machine in a signal so computed signals re-evaluate
    this.machineSignal.set(machine);

    // Setup effects in injection context.
    // The config-watching effect will dispatch the initial config.
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
    if (this.deps) {
      this.deps.value.set(value);
    }
  }

  /**
   * Resets the form to default values.
   */
  reset(): void {
    const defaults = this.defaultValues();
    (this.form()().value.set as (value: unknown) => void)(defaults);
    if (this.deps) {
      this.deps.value.set(defaults as Partial<TModel>);
    }
  }

  /**
   * Clears the form to empty state.
   */
  clear(): void {
    const emptyValue = {} as Partial<TModel>;
    (this.form()().value.set as (value: unknown) => void)(emptyValue);
    if (this.deps) {
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
    // Watch for config changes and dispatch to state machine
    // This handles both initial config and subsequent changes.
    explicitEffect([this.deps.config], ([config]) => {
      const machine = this.machineSignal();
      if (!machine) return;

      const state = machine.currentState;
      if (state.type === LifecycleState.Uninitialized) {
        // First config - initialize the state machine
        machine.dispatch({ type: Action.Initialize, config });
      } else if (state.type !== LifecycleState.Initializing) {
        // Subsequent config changes
        machine.dispatch({ type: Action.ConfigChange, config });
      }
    });

    // Sync entity changes to the value signal
    explicitEffect([this.entity], ([currentEntity]) => {
      if (!this.deps) return;

      const currentValue = this.deps.value();
      if (!isEqual(currentEntity, currentValue)) {
        this.deps.value.set(currentEntity);
      }
    });

    // Clear loading errors when config changes
    explicitEffect([computed(() => this.deps?.config())], () => {
      this.fieldLoadingErrors.set([]);
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
    this.rootFormRegistry.unregisterForm();
  }
}

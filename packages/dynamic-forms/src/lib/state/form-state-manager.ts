import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  linkedSignal,
  OnDestroy,
  runInInjectionContext,
  signal,
  Signal,
  untracked,
  WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldTree, form, Schema } from '@angular/forms/signals';
import { EMPTY, filter, forkJoin, map, Observable, of, pipe, scan, switchMap, take } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';

import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { normalizeSimplifiedArrays } from '../utils/array-field/normalize-simplified-arrays';
import { DynamicFormError } from '@ng-forge/dynamic-forms/internal';
import { isGroupField } from '@ng-forge/dynamic-forms/internal';
import { isPageField, PageField } from '@ng-forge/dynamic-forms/internal';
import { EventBus } from '@ng-forge/dynamic-forms/internal';
import { FormClearEvent } from '../events/constants/form-clear.event';
import { FormResetEvent } from '../events/constants/form-reset.event';
import { FormSubmitEvent } from '../events/constants/submit.event';
import { FieldSignalContext } from '@ng-forge/dynamic-forms/internal';
import { FIELD_SIGNAL_CONTEXT } from '@ng-forge/dynamic-forms/internal';
import { FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { FormConfig, FormOptions } from '@ng-forge/dynamic-forms/internal';
import { RegisteredFieldTypes } from '@ng-forge/dynamic-forms/internal';
import { detectFormMode, FormMode } from '@ng-forge/dynamic-forms/internal';
import { InferFormModel } from '@ng-forge/dynamic-forms/internal';
import { DynamicFormLogger } from '@ng-forge/dynamic-forms/internal';
import { ArrayItemRegistryService } from '../core/registry/array-item-registry.service';
import { FunctionRegistryService } from '@ng-forge/dynamic-forms/internal';
import { SchemaRegistryService } from '../core/registry/schema-registry.service';
import { createSchemaFromFields } from '../core/schema-builder';
import { createFormLevelSchema } from '../core/form-schema-merger';
import { collectCrossFieldEntries } from '../core/cross-field/cross-field-collector';
import { deepMergeDefaults, isEqual } from '@ng-forge/dynamic-forms/internal';
import { CONTAINER_FIELD_PROCESSORS } from '../utils/container-utils/container-field-processors';
import { derivedFromDeferred } from '@ng-forge/dynamic-forms/internal';
import { reconcileFields, ResolvedField, resolveField, resolveFieldSync } from '../utils/resolve-field/resolve-field';
import { FormModeValidator } from '../utils/form-validation/form-mode-validator';
import { injectFieldRegistry } from '../utils/inject-field-registry/inject-field-registry';
import { validateFormConfig } from '../utils/config-validation/config-validator';
import { walkAndValidateAddons } from '../utils/validate-form-config/validate-field-addons';
import { addonWarningKey, formatAddonWarning } from '../utils/validate-form-config/addon-warning';
import { ADDON_TYPE_REGISTRY } from '@ng-forge/dynamic-forms/internal';
import { VALUE_EXCLUSION_DEFAULTS } from '../providers/features/value-exclusion/value-exclusion.token';
import { filterFormValue } from '../utils/value-filter/value-filter';
import { DEV_MODE } from '../utils/dev-mode';
import { ValueExclusionConfig } from '@ng-forge/dynamic-forms/internal';

import { Action, FieldLoadingError, FormSetup, isReadyState, isTransitioningState, LifecycleState, Phase } from './state-types';
import { createSideEffectScheduler } from './side-effect-scheduler';
import { createFormStateMachine, FormStateMachine } from './form-state-machine';

/**
 * Shared deps holder injected by both DynamicForm and FormStateManager.
 * DynamicForm assigns its input signals to the holder's properties via an IIFE
 * field initializer (runs before FormStateManager is injected in declaration order);
 * FormStateManager reads them.
 *
 * @internal
 */
export interface FormStateDeps {
  config: Signal<FormConfig<RegisteredFieldTypes[]>> | null;
  formOptions: Signal<FormOptions | undefined> | null;
  value: WritableSignal<Partial<unknown> | undefined> | null;
  /**
   * Source mode forwarded to the addon validator at bootstrap. `'inline'`
   * (default) keeps every kind; `'json'` drops code-only kinds. Optional —
   * defaults to `'inline'` when omitted.
   */
  source: Signal<'inline' | 'json'> | null;
}

/** @internal */
export const FORM_STATE_DEPS = new InjectionToken<FormStateDeps>('FORM_STATE_DEPS');

/** Casts a FieldTree to a record of per-key sub-trees. */
function asFieldTreeRecord(tree: FieldTree<unknown>): Record<string, FieldTree<unknown>> {
  return tree as unknown as Record<string, FieldTree<unknown>>;
}

/** All-false baseline for the outward two-way binding filter — see `boundFormValue`. */
const BOUND_VALUE_EXCLUSION_BASELINE = {
  excludeValueIfHidden: false,
  excludeValueIfDisabled: false,
  excludeValueIfReadonly: false,
} as const;

/** Per-field axes that can drive value exclusion. */
interface FieldExclusionAxes {
  readonly hidden: boolean;
  readonly disabled: boolean;
  readonly readonly: boolean;
}

/** True when any of the three exclusion axes is asserted (i.e. the field could be filtered out of the bound model). */
function isFieldExcluded(axes: FieldExclusionAxes | undefined): boolean {
  return !!axes && (axes.hidden || axes.disabled || axes.readonly);
}

/**
 * Recursively populates `out` with `dottedPath → exclusion axes` for every keyed field reachable
 * from `fields`, walking into groups so nested-leaf transitions can be detected. Arrays are
 * treated as leaves (whole-array filtering only — see value-filter v1 limitation).
 */
function collectFieldStateSnapshot(
  fields: readonly FieldDef<unknown>[],
  treeRecord: Record<string, FieldTree<unknown>>,
  pathParts: readonly string[],
  out: Record<string, FieldExclusionAxes>,
): void {
  for (const field of fields) {
    const key = field.key;
    if (!key) continue;
    const subtree = treeRecord[key];
    if (!subtree || typeof subtree !== 'function') continue;

    const state = subtree();
    const path = [...pathParts, key];
    out[path.join('.')] = { hidden: state.hidden(), disabled: state.disabled(), readonly: state.readonly() };

    if (isGroupField(field) && field.fields) {
      collectFieldStateSnapshot(field.fields as readonly FieldDef<unknown>[], asFieldTreeRecord(subtree), path, out);
    }
  }
}

/**
 * Reads a value from a nested object by dotted-path segments. Returns undefined
 * if any intermediate segment is missing or non-object.
 */
function getValueAtPath(source: Record<string, unknown>, segments: readonly string[]): unknown {
  let current: unknown = source;
  for (const segment of segments) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Whether a value is worth capturing into the saved-hidden-value store. `NaN` (the number-input
 * default) is excluded — restoring it would re-leak the default into the bound model when the
 * field becomes visible again, defeating the bug fix.
 */
function isRestoreRelevant(value: unknown): boolean {
  return !(typeof value === 'number' && Number.isNaN(value));
}

/**
 * Returns a new object with `value` set at the path described by `segments`.
 * Intermediate objects are cloned shallowly to preserve immutability of `target`.
 */
function setValueAtPath(target: Record<string, unknown>, segments: readonly string[], value: unknown): Record<string, unknown> {
  if (segments.length === 0) return target;
  const [head, ...rest] = segments;
  const next = { ...target };
  if (rest.length === 0) {
    next[head] = value;
  } else {
    const child = target[head];
    const childObj = child !== null && typeof child === 'object' ? (child as Record<string, unknown>) : {};
    next[head] = setValueAtPath(childObj, rest, value);
  }
  return next;
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
  TModel extends Record<string, unknown> = InferFormModel<TFields>,
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
  // Optional so unit-test setups that drive FormStateManager directly without provideDynamicFormDI()
  // (e.g. mocked RootFormRegistryService specs) don't have to manually wire the registry. Real
  // DynamicForm usage always provides it via coreProviders; if you hit the dev warning below in
  // your own setup, you're using DynamicForm without provideDynamicFormDI() — fix the providers
  // chain rather than ignoring it.
  private readonly arrayItemRegistry = inject(ArrayItemRegistryService, { optional: true });

  /** Host component dependencies (config, formOptions, value). */
  private readonly deps = (() => {
    const raw = inject(FORM_STATE_DEPS);
    if (!raw.config || !raw.formOptions || !raw.value) {
      throw new DynamicFormError(
        'FormStateDeps must be connected before FormStateManager is created. ' +
          'Ensure DynamicForm assigns its input signals to FORM_STATE_DEPS.',
      );
    }
    // Safe cast: DynamicForm populates FormStateDeps with its concrete signals.
    // `source` is optional — `DynamicForm` always populates it, but other
    // callers of `FormStateManager` (e.g., specs) may omit it.
    return raw as {
      readonly config: Signal<FormConfig<TFields>>;
      readonly formOptions: Signal<FormOptions | undefined>;
      readonly value: WritableSignal<Partial<TModel> | undefined>;
      readonly source: Signal<'inline' | 'json'> | null;
    };
  })();

  /** Global value exclusion defaults. */
  private readonly valueExclusionDefaults = inject(VALUE_EXCLUSION_DEFAULTS);

  /** Field registry for loading components. */
  private readonly fieldRegistry = injectFieldRegistry();
  /** Addon-kind registry — feeds the addon validator at config-setup time. */
  private readonly addonKindRegistry = inject(ADDON_TYPE_REGISTRY);
  /**
   * Fingerprints of addon warnings emitted by the last config setup.
   * Used to skip re-logging warnings that already fired for the previous
   * config — avoids spam when the form swaps config repeatedly but the
   * addon issues haven't changed.
   */
  private lastAddonWarningKeys: Set<string> = new Set();

  // ─────────────────────────────────────────────────────────────────────────────
  // State Machine
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly scheduler = createSideEffectScheduler(this.injector);
  private readonly machine: FormStateMachine<TFields>;

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldProcessors = inject(CONTAINER_FIELD_PROCESSORS);

  // ─────────────────────────────────────────────────────────────────────────────
  // Internal State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /** Field loading errors accumulated during resolution. */
  readonly fieldLoadingErrors = signal<FieldLoadingError[]>([]);

  /**
   * Class-level form cache for the "hold until settled" pattern.
   * MUST be class-level — a local variable in the computed would reset on re-evaluation.
   * Mutable ref avoids a reactive cycle (form → isSettled → resolvedFields → form).
   */
  private readonly _formCache: { current: ReturnType<typeof form<TModel>> | undefined } = { current: undefined };

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
    const state = this.machine.state();

    if (state.type === LifecycleState.Uninitialized) {
      return this.deps.config();
    }

    if (isReadyState(state)) return state.config;
    if (isTransitioningState(state)) {
      if (state.phase === Phase.Teardown || state.phase === Phase.Applying) return state.currentConfig;
      return state.pendingConfig;
    }
    if (state.type === LifecycleState.Initializing) return state.config;
    return undefined;
  });

  /** Current render phase: 'render' = showing form, 'teardown' = hiding old components. */
  readonly renderPhase = computed(() => {
    const state = this.machine.state();
    if (isTransitioningState(state) && state.phase === Phase.Teardown) return Phase.Teardown;
    return 'render';
  });

  /** Whether to render the form template. */
  readonly shouldRender = computed(() => this.activeConfig() !== undefined);

  /** Computed form mode detection with validation. */
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

  /** Effective form options (merged from config and input). */
  readonly effectiveFormOptions = computed(() => {
    const config = this.activeConfig();
    const configOptions = config?.options || {};
    const inputOptions = this.deps.formOptions() ?? undefined;
    return { ...configOptions, ...inputOptions };
  });

  /** Page field definitions (for paged forms). */
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

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  /** Computed form setup — reads from the state machine, computed from config on bootstrap. */
  readonly formSetup = computed(() => {
    const registry = this.rawFieldRegistry();
    const state = this.machine.state();

    if (isReadyState(state)) {
      return state.formSetup;
    }

    if (isTransitioningState(state)) {
      if (state.phase === Phase.Restoring && state.pendingFormSetup) {
        return state.pendingFormSetup;
      }
      return state.currentFormSetup;
    }

    // Bootstrap path: compute form setup before the state machine dispatches 'initialize'.
    // Register validators/schemas here so they are available before the first form is built.
    // This is a controlled side effect: registerValidatorsFromConfig is idempotent and only
    // mutates external registries (SchemaRegistry, FunctionRegistry), not reactive state.
    // The state machine's createFormSetup callback handles registration for subsequent configs.
    const config = this.activeConfig();
    if (config) {
      this.registerValidatorsFromConfig(config as FormConfig<TFields>);
    }
    if (!config) {
      return this.createEmptyFormSetup(registry);
    }

    if (config.fields && config.fields.length > 0) {
      const modeDetection = this.formModeDetection();
      return this.createFormSetupFromConfig(config.fields as FieldDef<unknown>[], modeDetection.mode, registry);
    }

    return this.createEmptyFormSetup(registry);
  });

  /** Default values computed from field definitions. */
  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues as TModel);

  /** Valid field keys — memoized separately so the Set isn't rebuilt on every keystroke. */
  private readonly validKeys = computed(() => {
    const schemaFields = this.formSetup().schemaFields;
    if (!schemaFields || schemaFields.length === 0) return undefined;
    return new Set(schemaFields.map((f) => f.key).filter((key): key is string => key !== undefined));
  });

  /**
   * Per-field exclusion-axis state (hidden/disabled/readonly) keyed by dotted path. Drives the
   * save-on-exclude effect's transition detection. Walks recursively into groups so nested-leaf
   * transitions are captured. Arrays are treated as leaves (whole-array preservation only).
   */
  private readonly fieldStateSnapshot = computed((): Record<string, FieldExclusionAxes> => {
    const setup = this.formSetup();
    if (!setup.schemaFields || setup.schemaFields.length === 0) return {};

    const snapshot: Record<string, FieldExclusionAxes> = {};
    collectFieldStateSnapshot(setup.schemaFields, asFieldTreeRecord(this.form()), [], snapshot);
    return snapshot;
  });

  /**
   * Captured values for fields actively excluded from the bound model — either via
   * `excludeValueIfHidden`, `excludeValueIfDisabled`, or `excludeValueIfReadonly`. Restored when
   * the field becomes re-included (visible/enabled/editable). The save effect only writes here
   * when the field is being filtered out by `boundFormValue` — fields without explicit opt-in
   * never enter the store.
   */
  private readonly excludedValueStore = signal<Record<string, unknown>>({});

  /** Tracks per-path exclusion state across save-effect runs to detect newly-excluded fields. */
  private readonly prevFieldStateSnapshot = signal<Record<string, FieldExclusionAxes>>({});

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals - Entity & Form
  // ─────────────────────────────────────────────────────────────────────────────

  /** Entity (form value merged with defaults). */
  readonly entity = linkedSignal<TModel>(
    () => {
      const inputValue = this.deps.value();
      const defaults = this.defaultValues();
      const keys = this.validKeys();
      const saved = this.excludedValueStore();

      // Deep-merge so a partial nested object in `inputValue` (e.g. a group
      // value missing one of its declared sub-field keys) does not orphan
      // the absent sub-field in the Signal Forms validation graph.
      // Layer order: defaults < saved (excluded-field restorations) < inputValue.
      const withSaved = deepMergeDefaults(defaults as Record<string, unknown>, saved);
      const combined = deepMergeDefaults(withSaved, inputValue as Record<string, unknown>);

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
    },
    {
      debugName: 'FormStateManager.entity',
      equal: isEqual,
    },
  );

  /**
   * Schema derived from the current form config and field setup.
   * Separated from `form` so schema construction is memoized independently.
   * Requires `runInInjectionContext` because `createSchemaFromFields` calls `inject()` internally.
   */
  private readonly formSchema = computed((): Schema<TModel> | undefined =>
    runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();
      const config = this.activeConfig();

      if (!config) return undefined;

      if (setup.schemaFields?.length) {
        const crossFieldCollection = collectCrossFieldEntries(setup.schemaFields as FieldDef<unknown>[]);
        return createSchemaFromFields(setup.schemaFields, setup.registry, {
          crossFieldValidators: crossFieldCollection.validators,
          formLevelSchema: config.schema,
          validateWhenHidden: this.effectiveFormOptions().validateWhenHidden,
        }) as Schema<TModel>;
      }

      if (config.schema) {
        return createFormLevelSchema(config.schema) as Schema<TModel>;
      }

      return undefined;
    }),
  );

  /** The Angular Signal Form instance. */
  readonly form = computed(() => {
    const schema = this.formSchema();
    const injector = this.injector;
    return untracked(() => (schema ? form(this.entity, schema, { injector }) : form(this.entity, { injector })));
  });

  /** Whether resolvedFields has caught up with fieldsSource (set in constructor). */
  private isFieldPipelineSettled: Signal<boolean>;

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
      value: this.deps.value,
      defaultValues: this.defaultValues,
      get form() {
        const currentForm = formSignal();
        const settled = isSettled();

        if (!settled && formCache.current) {
          return formCache.current;
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

  /** Form values filtered by value exclusion rules. */
  readonly filteredFormValue = computed(() => {
    const rawValue = this.formValue();
    const setup = this.formSetup();
    const options = this.effectiveFormOptions();

    if (!setup.schemaFields || setup.schemaFields.length === 0) {
      return rawValue;
    }

    // form() returns the FieldTree<TModel> — a callable with per-key sub-trees.
    // formInstance() returns form()() — the FieldState. We need the FieldTree for
    // per-field state access (e.g., formTree[key]() gives FieldState with hidden/disabled/readonly).
    const formTree = this.form();

    const formOptions: ValueExclusionConfig = {
      excludeValueIfHidden: options.excludeValueIfHidden,
      excludeValueIfDisabled: options.excludeValueIfDisabled,
      excludeValueIfReadonly: options.excludeValueIfReadonly,
    };

    // FieldTree<TModel> is structurally a callable that also exposes per-key sub-trees
    // via bracket access (e.g., formTree['fieldKey']). TypeScript's nominal typing for
    // FieldTree doesn't expose this index signature, so we use a helper cast.
    const fieldTreeRecord = asFieldTreeRecord(formTree);

    return filterFormValue(
      rawValue as Record<string, unknown>,
      setup.schemaFields,
      fieldTreeRecord,
      setup.registry,
      this.valueExclusionDefaults,
      formOptions,
    );
  });

  /** Form value used for the outward two-way binding sync. */
  private readonly boundFormValue = computed(() => {
    const rawValue = this.formValue();
    const setup = this.formSetup();
    const options = this.effectiveFormOptions();

    if (!setup.schemaFields || setup.schemaFields.length === 0) {
      return rawValue;
    }

    const formTree = this.form();
    const formOptions: ValueExclusionConfig = {
      excludeValueIfHidden: options.excludeValueIfHidden,
      excludeValueIfDisabled: options.excludeValueIfDisabled,
      excludeValueIfReadonly: options.excludeValueIfReadonly,
    };
    const fieldTreeRecord = asFieldTreeRecord(formTree);

    return filterFormValue(
      rawValue as Record<string, unknown>,
      setup.schemaFields,
      fieldTreeRecord,
      setup.registry,
      BOUND_VALUE_EXCLUSION_BASELINE,
      formOptions,
    );
  });

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
   */
  private readonly fieldsSource = computed(
    () => {
      const state = this.machine.state();

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
        return a.every((field, i) => field === b[i]);
      },
    },
  );

  /** Injector for field components with FIELD_SIGNAL_CONTEXT. */
  private readonly fieldInjector = computed(() =>
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

  /**
   * Stream of submit events when form is valid.
   *
   * Typed as the full inferred model. The emitted payload is `filteredFormValue()`,
   * so when `excludeValueIfHidden` / `excludeValueIfDisabled` / `excludeValueIfReadonly`
   * are enabled a field that is hidden/disabled/readonly at submit time is omitted at
   * runtime while the type still lists it. Those options default off, so the type is
   * accurate for the common case; this matches the long-standing `as TModel` cast below.
   */
  readonly submitted$: Observable<TModel>;

  /** Stream of reset events. */
  readonly reset$: Observable<void>;

  /** Stream of clear events. */
  readonly cleared$: Observable<void>;

  /** Emits once when the state machine reaches 'ready'. Useful for tests. */
  get ready$(): Observable<void> {
    return this.machine.state$.pipe(
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
          if (!fields || fields.length === 0) {
            return of([] as (ResolvedField | undefined)[]);
          }

          const registry = this.rawFieldRegistry();
          const injector = this.fieldInjector();

          const syncContext = {
            getLoadedComponent: (type: string) => this.fieldRegistry.getLoadedComponent(type),
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
            const def = this.fieldRegistry.getType(f.type);
            const isCached = !def?.loadComponent || this.fieldRegistry.getLoadedComponent(f.type);

            if (isCached) {
              results[i] = resolveFieldSync(f, syncContext);
            } else {
              asyncIndexes.push(i);
              asyncObs.push(
                resolveField(f, {
                  loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
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

    this.submitted$ = this.eventBus.on<FormSubmitEvent>('submit').pipe(
      filter(() => {
        if (!this.valid()) {
          this.logger.debug('Form submitted while invalid, not emitting to (submitted) output');
          return false;
        }
        return true;
      }),
      // switchMap is intentional here: mapping is synchronous (reads signals, no async Promise).
      // The exhaustMap concern in createSubmissionHandler does not apply to this path.
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

        return of(this.filteredFormValue() as TModel);
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

    // Create the state machine eagerly
    this.machine = createFormStateMachine<TFields>({
      injector: this.injector,
      destroyRef: this.destroyRef,
      scheduler: this.scheduler,
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
      isSubmitting: this.submitting,
      isFieldPipelineSettled: () => this.isFieldPipelineSettled(),
      restoreValue: (values, validKeys) => {
        const filtered: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(values)) {
          if (validKeys.has(key)) {
            filtered[key] = val;
          }
        }
        // Strip any captured key that did NOT survive the swap (dropped or retyped). The stale
        // value lingers in `deps.value` from before teardown, and `entity` layers it on top of
        // the new field's default — so a retyped key would otherwise inherit the old value
        // instead of initializing to its declared default. `values` is the full captured
        // snapshot, so any captured key absent from `validKeys` must be removed from the model.
        this.deps.value.update((current) => {
          const next = { ...current, ...filtered } as Record<string, unknown>;
          for (const key of Object.keys(values)) {
            if (!validKeys.has(key)) delete next[key];
          }
          return next as Partial<TModel>;
        });
      },
      onTransition: (transition) => {
        this.logger.debug('State transition:', transition.from.type, '→', transition.to.type, transition.action.type);
      },
      onError: (error, action) => {
        this.logger.error(`State machine error recovery triggered for action '${action.type}':`, error);
      },
    });

    runInInjectionContext(this.injector, () => {
      this.setupEffects();
      this.setupEventHandlers();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Public Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /** Updates the form value model. */
  updateValue(value: Partial<TModel>): void {
    this.deps.value.set(value);
  }

  /** Resets the form to default values. */
  reset(): void {
    this.excludedValueStore.set({});
    const defaults = this.defaultValues();
    (this.form()().value as WritableSignal<TModel>).set(defaults);
    this.deps.value.set(defaults as Partial<TModel>);
  }

  /** Clears the form to empty state. */
  clear(): void {
    this.excludedValueStore.set({});
    const emptyValue = {} as TModel;
    (this.form()().value as WritableSignal<TModel>).set(emptyValue);
    this.deps.value.set(emptyValue);
  }

  /** Triggers form submission. */
  submit(): void {
    this.eventBus.dispatch(FormSubmitEvent);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods - Setup
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    explicitEffect([this.deps.config], ([config]) => {
      this.fieldLoadingErrors.set([]);

      const state = this.machine.currentState;
      if (state.type === LifecycleState.Uninitialized) {
        this.machine.dispatch({ type: Action.Initialize, config });
      } else {
        this.machine.dispatch({ type: Action.ConfigChange, config });
      }
    });

    // Save-on-exclude: capture entity values for fields that boundFormValue is actively
    // filtering out via any of the three axes (hidden / disabled / readonly), so they can be
    // restored when the field becomes re-included. The transition fires once per "no axis
    // asserted → at least one axis asserted" edge; subsequent axis changes while still excluded
    // are no-ops. Comparing entity vs bound at the path limits the store to fields that are
    // actually being filtered — fields without explicit opt-in never enter the store and never
    // participate in the entity merge. `NaN` values are skipped: they're the number-input default
    // and would re-leak via the merge once the field becomes re-included.
    explicitEffect([this.fieldStateSnapshot], ([snapshot]) => {
      const currentSaved = this.excludedValueStore();
      const currentEntity = this.entity() as Record<string, unknown>;
      const boundValue = this.boundFormValue() as Record<string, unknown>;
      const prev = this.prevFieldStateSnapshot();
      let newSaved = currentSaved;

      for (const [path, axes] of Object.entries(snapshot)) {
        if (isFieldExcluded(axes) && !isFieldExcluded(prev[path])) {
          const segments = path.split('.');
          const inEntity = getValueAtPath(currentEntity, segments);
          const inBound = getValueAtPath(boundValue, segments);
          if (inEntity !== undefined && inBound === undefined && isRestoreRelevant(inEntity)) {
            newSaved = setValueAtPath(newSaved, segments, inEntity);
          }
        }
      }
      this.prevFieldStateSnapshot.set({ ...snapshot });

      if (newSaved !== currentSaved && !isEqual(newSaved, currentSaved)) {
        this.excludedValueStore.set(newSaved);
      }
    });

    // Schema change resets the saved store + transition tracker so values from a stale schema
    // can't leak into the new one. Also drops every per-array slot in the registry so a fresh
    // schema starts with an empty template/itemOrder/id-counter state.
    let warnedAboutMissingArrayRegistry = false;
    explicitEffect([this.formSetup], () => {
      this.prevFieldStateSnapshot.set({});
      if (Object.keys(this.excludedValueStore()).length > 0) {
        this.excludedValueStore.set({});
      }
      if (this.arrayItemRegistry) {
        this.arrayItemRegistry.clearAll();
      } else if (DEV_MODE && !warnedAboutMissingArrayRegistry) {
        warnedAboutMissingArrayRegistry = true;
        this.logger.warn(
          'ArrayItemRegistryService was not provided to FormStateManager. ' +
            'Array fields will lose dynamically-added item templates across hide/show cycles. ' +
            'This usually means DynamicForm was bootstrapped without provideDynamicFormDI() — ' +
            'check your providers chain.',
        );
      }
    });

    // Outward sync uses boundFormValue (honors only explicit excludeValueIf* opt-ins) so
    // global defaults that target submission output don't reshape the host's bound model.
    explicitEffect([this.boundFormValue], ([currentBound]) => {
      const currentValue = this.deps.value();
      if (!isEqual(currentBound, currentValue)) {
        this.deps.value.set(currentBound as TModel);
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

    if (customFnConfig.asyncDerivations) {
      this.functionRegistry.setAsyncDerivationFunctions(customFnConfig.asyncDerivations);
    }
    if (customFnConfig.asyncConditions) {
      this.functionRegistry.setAsyncConditionFunctions(customFnConfig.asyncConditions);
    }

    this.functionRegistry.setValidators(customFnConfig.validators);
    this.functionRegistry.setAsyncValidators(customFnConfig.asyncValidators);
    this.functionRegistry.setHttpValidators(customFnConfig.httpValidators);
  }

  private createFormSetupFromConfig(fields: FieldDef<unknown>[], mode: FormMode, registry: Map<string, FieldTypeDefinition>): FormSetup {
    const normalizedFields = normalizeSimplifiedArrays(fields);
    // Two validation passes run after normalization so simplified array templates
    // are already expanded into full ArrayField.fields and reachable during traversal:
    // 1. Structural — duplicate keys, unknown field types, invalid regex patterns.
    // 2. Addon pass below — strips invalid/unsupported addons with lenient warnings.
    validateFormConfig(normalizedFields, registry, this.logger);

    // Addon pass — strip invalid / unsupported addon entries and log a warning
    // for each one dropped. Lenient by design: the form keeps rendering even
    // when a JSON-source config ships an addon the FE doesn't understand.
    //
    // Warnings are deduped across consecutive config setups: a warning that
    // already fired for the previous config is skipped, so swapping config
    // back and forth doesn't spam the console.
    const source = this.deps.source?.() ?? 'inline';
    const { fields: sanitizedFields, warnings: addonWarnings } = walkAndValidateAddons(
      normalizedFields,
      registry,
      this.addonKindRegistry,
      source,
    );
    const nextKeys = new Set<string>();
    for (const w of addonWarnings) {
      // Dedup uses a structural fingerprint so different fields with the
      // same warning category never collide; the rendered message is what
      // we log.
      const key = addonWarningKey(w);
      nextKeys.add(key);
      if (!this.lastAddonWarningKeys.has(key)) {
        this.logger.warn(formatAddonWarning(w));
      }
    }
    this.lastAddonWarningKeys = nextKeys;
    const validatedFields = sanitizedFields as FieldDef<unknown>[];

    const flattenedFields = this.fieldProcessors.memoizedFlattenFields(validatedFields, registry);
    const flattenedFieldsForRendering = this.fieldProcessors.memoizedFlattenFieldsForRendering(validatedFields, registry);
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

  private createEmptyFormSetup(registry: Map<string, FieldTypeDefinition>): FormSetup {
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
    this.machine.dispatch({ type: Action.Destroy });
  }
}

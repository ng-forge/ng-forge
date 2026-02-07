import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  linkedSignal,
  runInInjectionContext,
  untracked,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { outputFromObservable, toObservable } from '@angular/core/rxjs-interop';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { createFieldResolutionPipe, ResolvedField } from '../../utils/resolve-field/resolve-field';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { isEqual, keyBy, mapValues, memoize } from '../../utils/object-utils';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { GroupField } from '../../definitions/default/group-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTypeDefinition } from '../../models/field-type';
import { FieldTree, form } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { createSchemaFromFields } from '../../core/schema-builder';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { flattenFields } from '../../utils/flattener/field-flattener';
import { DynamicFormError } from '../../errors/dynamic-form-error';

/**
 * Container component for rendering nested form groups.
 *
 * Creates a scoped form context with its own validation state.
 * Child fields receive a FIELD_SIGNAL_CONTEXT scoped to this group's form instance.
 * Group values are nested under the group's key in the parent form.
 */
@Component({
  selector: 'fieldset[group-field]',
  imports: [NgComponentOutlet],
  template: `
    @for (field of resolvedFields(); track field.key) {
      <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
    }
  `,
  styleUrl: './group-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    role: 'group',
    '[class.disabled]': 'disabled()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GroupFieldComponent<TModel extends Record<string, unknown> = Record<string, unknown>> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly memoizedFlattenFields = memoize(
    (fields: readonly FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields([...fields], registry),
    {
      resolver: (fields, registry) =>
        JSON.stringify(fields.map((f) => ({ key: f.key, type: f.type }))) + '_' + Array.from(registry.keys()).sort().join(','),
      maxSize: 10,
    },
  );

  private readonly memoizedKeyBy = memoize(<T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'), {
    resolver: (fields) => fields.map((f) => f.key).join(','),
    maxSize: 10,
  });

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry)),
    {
      resolver: (fieldsById, registry) => Object.keys(fieldsById).sort().join(',') + '_' + Array.from(registry.keys()).sort().join(','),
      maxSize: 10,
    },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<GroupField>();
  key = input.required<string>();
  className = input<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly hostClasses = computed(() => {
    const base = 'df-field df-group';
    const custom = this.className();
    return custom ? `${base} ${custom}` : base;
  });

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  private readonly formSetup = computed(() => {
    const groupField = this.field();
    const registry = this.rawFieldRegistry();

    if (groupField.fields && groupField.fields.length > 0) {
      const flattenedFields = this.memoizedFlattenFields(groupField.fields, registry);
      const fieldsById = this.memoizedKeyBy(flattenedFields);
      const defaultValues = this.memoizedDefaultValues(fieldsById, registry);

      return {
        fields: flattenedFields,
        originalFields: groupField.fields,
        defaultValues,
        registry,
      };
    }

    return {
      fields: [],
      originalFields: [],
      defaultValues: {},
      registry,
    };
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  /**
   * Entity computed from parent value, group key, and defaults.
   * Uses deep equality check to prevent unnecessary updates when
   * object spread creates new references with identical values.
   */
  private readonly entity = linkedSignal(
    () => {
      const parentValue = this.parentFieldSignalContext.value();
      const groupKey = this.field().key;
      const defaults = this.defaultValues();
      const groupValue = (parentValue as Record<string, unknown>)?.[groupKey] || {};
      return { ...defaults, ...groupValue };
    },
    {
      debugName: 'GroupFieldComponent.entity',
      equal: isEqual,
    },
  );

  private readonly form = computed(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      if (setup.fields.length > 0) {
        const schema = createSchemaFromFields(setup.fields, setup.registry);
        return untracked(() => form(this.entity, schema));
      }

      return untracked(() => form(this.entity));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Public State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly formValue = computed(() => this.entity());
  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  private readonly nestedFieldTree = computed((): FieldTree<Record<string, unknown>> => {
    const parentForm = this.parentFieldSignalContext.form as Record<string, FieldTree<Record<string, unknown>>>;
    const groupKey = this.field().key;
    const child = parentForm[groupKey];

    if (!child) {
      throw new DynamicFormError(
        `Group field "${groupKey}" not found in parent form. ` + `Ensure the parent form schema includes this group field.`,
      );
    }

    return child;
  });

  private readonly groupInjector = computed(() => {
    const groupFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
      injector: this.injector,
      value: this.parentFieldSignalContext.value,
      defaultValues: this.defaultValues,
      form: this.nestedFieldTree(),
    };

    return Injector.create({
      parent: this.injector,
      providers: [{ provide: FIELD_SIGNAL_CONTEXT, useValue: groupFieldSignalContext }],
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Outputs
  // ─────────────────────────────────────────────────────────────────────────────

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
  readonly submitted = outputFromObservable(this.eventBus.on<SubmitEvent>('submit'));

  // ─────────────────────────────────────────────────────────────────────────────
  // Field Resolution
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly fieldsSource = computed(() => this.formSetup().fields);

  protected readonly resolvedFields = derivedFromDeferred(
    this.fieldsSource,
    createFieldResolutionPipe(() => ({
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      registry: this.rawFieldRegistry(),
      injector: this.groupInjector(),
      destroyRef: this.destroyRef,
      onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
        const fieldKey = fieldDef.key || '<no key>';
        this.logger.error(
          `Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
            `within group '${this.field().key}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      },
    })),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupEffects();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    // Emit initialization event when fields are resolved
    explicitEffect([this.resolvedFields], ([fields]) => {
      if (fields.length > 0) {
        emitComponentInitialized(this.eventBus, 'group', this.field().key, this.injector);
      }
    });
  }
}

export { GroupFieldComponent };

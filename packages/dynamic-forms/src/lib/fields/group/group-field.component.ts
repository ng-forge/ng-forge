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
import { forkJoin, map, of, pipe, scan, switchMap } from 'rxjs';
import { derivedFromDeferred } from '../../utils/derived-from-deferred/derived-from-deferred';
import { reconcileFields, ResolvedField, resolveField } from '../../utils/resolve-field/resolve-field';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { keyBy, mapValues, memoize } from '../../utils/object-utils';
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
    class: 'df-field df-group',
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly memoizedFlattenFields = memoize(
    (fields: readonly FieldDef<unknown>[], registry: Map<string, FieldTypeDefinition>) => flattenFields([...fields], registry),
    (fields, registry) =>
      JSON.stringify(fields.map((f) => ({ key: f.key, type: f.type }))) + '_' + Array.from(registry.keys()).sort().join(','),
  );

  private readonly memoizedKeyBy = memoize(
    <T extends { key: string }>(fields: T[]) => keyBy(fields, 'key'),
    (fields) => fields.map((f) => f.key).join(','),
  );

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<unknown>>(fieldsById: Record<string, T>, registry: Map<string, FieldTypeDefinition>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field, registry)),
    (fieldsById, registry) => Object.keys(fieldsById).sort().join(',') + '_' + Array.from(registry.keys()).sort().join(','),
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<GroupField>();
  key = input.required<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  private readonly formSetup = computed(() => {
    try {
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
    } catch {
      return {
        fields: [],
        originalFields: [],
        defaultValues: {},
        registry: this.rawFieldRegistry(),
      };
    }
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  private readonly entity = linkedSignal(() => {
    const parentValue = this.parentFieldSignalContext.value();
    const groupKey = this.field().key;
    const defaults = this.defaultValues();
    const groupValue = (parentValue as Record<string, unknown>)?.[groupKey] || {};
    return { ...defaults, ...groupValue };
  });

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

  /**
   * Get the nested FieldTree from the parent form for this group.
   * This allows child fields to update the parent form directly,
   * avoiding the need for separate form synchronization.
   */
  private readonly nestedFieldTree = computed((): FieldTree<Record<string, unknown>> | undefined => {
    const parentForm = this.parentFieldSignalContext.form;
    const groupKey = this.field().key;
    const child = (parentForm as Record<string, unknown>)[groupKey];
    return child as FieldTree<Record<string, unknown>> | undefined;
  });

  private readonly groupInjector = computed(() => {
    // Use the nested FieldTree from parent if available, otherwise fall back to our own form
    const formToProvide = this.nestedFieldTree() ?? (this.form() as FieldTree<Record<string, unknown>>);

    const groupFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
      injector: this.injector,
      value: this.parentFieldSignalContext.value,
      defaultValues: this.defaultValues,
      form: formToProvide,
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages,
    };

    return Injector.create({
      parent: this.injector,
      providers: [
        {
          provide: FIELD_SIGNAL_CONTEXT,
          useValue: groupFieldSignalContext,
        },
      ],
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
    pipe(
      switchMap((fields) => {
        if (!fields || fields.length === 0) {
          return of([] as (ResolvedField | undefined)[]);
        }
        const groupKey = this.field().key;
        const context = {
          loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
          registry: this.rawFieldRegistry(),
          injector: this.groupInjector(),
          destroyRef: this.destroyRef,
          onError: (fieldDef: FieldDef<unknown>, error: unknown) => {
            const fieldKey = fieldDef.key || '<no key>';
            console.error(
              `[Dynamic Forms] Failed to load component for field type '${fieldDef.type}' (key: ${fieldKey}) ` +
                `within group '${groupKey}'. Ensure the field type is registered in your field registry.`,
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

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
import { form } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldSignalContext } from '../../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { createSchemaFromFields } from '../../core/schema-builder';
import { EventBus } from '../../events/event.bus';
import { SubmitEvent } from '../../events/constants/submit.event';
import { flattenFields } from '../../utils/flattener/field-flattener';

@Component({
  selector: 'group-field',
  imports: [NgComponentOutlet],
  template: `
    <form [class.disabled]="disabled()">
      @for (field of resolvedFields(); track field.key) {
        <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
      }
    </form>
  `,
  styleUrl: './group-field.component.scss',
  host: {
    class: 'df-field df-group',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GroupFieldComponent<TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // ─────────────────────────────────────────────────────────────────────────────
  // Memoized Functions - Performance optimization for expensive operations
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

  /** Field configuration input */
  field = input.required<GroupField>();
  key = input.required<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /** Memoized field registry raw access */
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  private readonly formSetup = computed(() => {
    // Safety check: return empty setup if inputs aren't set yet
    try {
      const groupField = this.field();
      const registry = this.rawFieldRegistry();

      if (groupField.fields && groupField.fields.length > 0) {
        // Use memoized functions for expensive operations with registry
        const flattenedFields = this.memoizedFlattenFields(groupField.fields, registry);
        const fieldsById = this.memoizedKeyBy(flattenedFields);
        const defaultValues = this.memoizedDefaultValues(fieldsById, registry);

        return {
          fields: flattenedFields,
          originalFields: groupField.fields,
          defaultValues,
          registry, // Include registry for schema creation
        };
      }

      return {
        fields: [],
        originalFields: [],
        defaultValues: {},
        registry, // Include registry even for empty forms
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

  // Create reactive group value signal that extracts group-specific values from parent form
  private readonly entity = linkedSignal(() => {
    const parentValue = this.parentFieldSignalContext.value();
    const groupKey = this.field().key;
    const defaults = this.defaultValues();

    // Extract the group's nested values from parent form
    const groupValue = (parentValue as Record<string, unknown>)?.[groupKey] || {};
    return { ...defaults, ...groupValue };
  });

  // Create nested form for this group
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
  // Form State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly formValue = computed(() => this.entity());
  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  // ─────────────────────────────────────────────────────────────────────────────
  // Injector Creation
  // ─────────────────────────────────────────────────────────────────────────────

  /** Creates scoped child injector for nested fields with group's form context */
  private readonly groupInjector = computed(() => {
    const groupFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
      injector: this.injector,
      value: this.parentFieldSignalContext.value, // Pass through parent's value signal
      defaultValues: this.defaultValues, // Group-specific defaults
      form: this.form() as ReturnType<typeof form<Record<string, unknown>>>, // Group's nested form
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages, // Pass through validation messages
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

  /** Source signal for fields to render */
  private readonly fieldsSource = computed(() => this.formSetup().fields);

  /**
   * Resolved fields for declarative rendering using derivedFromDeferred.
   * Group components create a scoped FIELD_SIGNAL_CONTEXT with the group's nested form.
   */
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
          injector: this.groupInjector(), // Use group's scoped injector
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
      // Filter out undefined (failed loads) and cast to ResolvedField[]
      map((fields) => fields.filter((f): f is ResolvedField => f !== undefined)),
      // Reconcile to reuse injectors for unchanged fields
      scan(reconcileFields, [] as ResolvedField[]),
    ),
    { initialValue: [] as ResolvedField[], injector: this.injector },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects - Declarative side effects as class fields
  // ─────────────────────────────────────────────────────────────────────────────

  /** Emits initialization event when fields are resolved */
  private readonly emitInitializedOnFieldsResolved = explicitEffect([this.resolvedFields], ([fields]) => {
    if (fields.length > 0) {
      emitComponentInitialized(this.eventBus, 'group', this.field().key, this.injector);
    }
  });
}

export { GroupFieldComponent };

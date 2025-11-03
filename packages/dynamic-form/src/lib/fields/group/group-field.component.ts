import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  linkedSignal,
  runInInjectionContext,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, map, of, Subject, switchMap } from 'rxjs';
import { get, keyBy, mapValues, memoize } from 'lodash-es';
import { GroupField } from '../../definitions/default/group-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { FieldSignalContext } from '../../mappers';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { createSchemaFromFields } from '../../core';
import { EventBus, SubmitEvent } from '../../events';
import { flattenFields } from '../../utils';

@Component({
  selector: 'group-field',
  template: `
    <form [class.disabled]="disabled()" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './group-field.component.scss',
  host: {
    class: 'df-field df-group',
  },
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class GroupFieldComponent<T extends readonly FieldDef<Record<string, unknown>>[], TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // Type-safe memoized functions for performance optimization
  private readonly memoizedFlattenFields = memoize(
    (fields: readonly FieldDef<Record<string, unknown>>[]) => flattenFields(fields),
    (fields) => JSON.stringify(fields.map((f) => ({ key: f.key, type: f.type })))
  );

  private readonly memoizedKeyBy = memoize(
    <T extends { key: string }>(fields: readonly T[]) => keyBy(fields, 'key'),
    (fields) => fields.map((f) => f.key).join(',')
  );

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<Record<string, unknown>>>(fieldsById: Record<string, T>) =>
      mapValues(fieldsById, (field) => getFieldDefaultValue(field)),
    (fieldsById) => Object.keys(fieldsById).sort().join(',')
  );

  /** Field configuration input */
  field = input.required<GroupField<T>>();

  // Parent form context inputs
  parentForm = input.required<ReturnType<typeof form<TModel>>>();
  parentFieldSignalContext = input.required<FieldSignalContext<TModel>>();

  private readonly formSetup = computed(() => {
    const groupField = this.field();

    if (groupField.fields && groupField.fields.length > 0) {
      // Use memoized functions for expensive operations
      const flattenedFields = this.memoizedFlattenFields(groupField.fields);
      const fieldsById = this.memoizedKeyBy(flattenedFields);
      const defaultValues = this.memoizedDefaultValues(fieldsById);

      return {
        fields: flattenedFields,
        originalFields: groupField.fields,
        defaultValues,
      };
    }

    return {
      fields: [],
      originalFields: [],
      defaultValues: {},
    };
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  // Create reactive group value signal that extracts group-specific values from parent form
  private readonly entity = linkedSignal(() => {
    const parentValue = this.parentFieldSignalContext().value();
    const groupKey = this.field().key;
    const defaults = this.defaultValues();

    // Extract the group's nested values from parent form
    const groupValue = get(parentValue, groupKey) || {};
    return { ...defaults, ...groupValue };
  });

  // Create nested form for this group
  private readonly form = computed(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      if (setup.fields.length > 0) {
        const schema = createSchemaFromFields(setup.fields);
        return untracked(() => form(this.entity, schema));
      }

      return untracked(() => form(this.entity));
    });
  });

  readonly formValue = computed(() => this.entity());

  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
  readonly submitted = outputFromObservable(this.eventBus.subscribe<SubmitEvent>('submit'));

  private readonly fieldsInitializedSubject = new Subject<void>();

  readonly initialized$ = this.fieldsInitializedSubject.asObservable();

  // Convert field setup to observable for field mapping
  fields$ = toObservable(computed(() => this.formSetup().fields));

  // Create field fields following the dynamic form pattern
  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields: FieldDef<Record<string, unknown>>[]) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    ),
    { initialValue: [] }
  );

  private mapFields(fields: readonly FieldDef<Record<string, unknown>>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: FieldDef<Record<string, unknown>>): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        // Check if component is destroyed before creating new components
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // Create nested field signal context for group children
        // This creates a new form context scoped to this group
        const groupFieldSignalContext: FieldSignalContext<Record<string, unknown>> = {
          injector: this.injector,
          value: this.parentFieldSignalContext().value, // Pass through the parent's value signal
          defaultValues: this.defaultValues,
          form: this.form() as ReturnType<typeof form<Record<string, unknown>>>, // Use this group's nested form
        };

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext: groupFieldSignalContext,
          fieldRegistry: this.fieldRegistry.raw,
        });

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector }) as ComponentRef<FormUiControl>;
      })
      .catch((error) => {
        // Only log errors if component hasn't been destroyed
        if (!this.destroyRef.destroyed) {
          console.error(`Failed to load component for field type '${fieldDef.type}':`, error);
        }
        return undefined;
      });
  }

  onFieldsInitialized(): void {
    this.fieldsInitializedSubject.next();
  }
}

export { GroupFieldComponent };

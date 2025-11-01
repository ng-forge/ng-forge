import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  linkedSignal,
  model,
  runInInjectionContext,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, Subject, switchMap } from 'rxjs';
import { get, keyBy, mapValues } from 'lodash-es';
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
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'group-field',
  template: `
    <fieldset>
      <legend class="lib-group-field__legend">
        {{ field().label }}
      </legend>

      <form
        class="lib-group-field__content"
        [class.disabled]="disabled()"
        [fieldRenderer]="fields()"
        (fieldsInitialized)="onFieldsInitialized()"
      >
        <!-- Fields will be automatically rendered by the fieldRenderer directive -->
      </form>
    </fieldset>
  `,
  styleUrl: './group-field.component.scss',
  host: {
    class: 'lib-group-field',
  },
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class GroupFieldComponent<T extends readonly FieldDef<Record<string, unknown>>[], TModel = Record<string, unknown>> {
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<GroupField<T>>();

  // Parent form context inputs
  parentForm = input.required<ReturnType<typeof form<TModel>>>();
  parentFieldSignalContext = input.required<FieldSignalContext<TModel>>();

  // Form value model for two-way binding (represents the nested group value)
  value = model<Record<string, unknown> | undefined>(undefined);

  private readonly formSetup = computed(() => {
    const groupField = this.field();

    if (groupField.fields && groupField.fields.length > 0) {
      const flattenedFields = flattenFields(groupField.fields);
      const fieldsById = keyBy(flattenedFields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => getFieldDefaultValue(field));

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

        return combineLatest(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    ),
    { initialValue: [] }
  );

  private mapFields(fields: readonly FieldDef<Record<string, unknown>>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        let componentType;
        try {
          componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type);
        } catch (error) {
          console.error(error);
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

        return this.vcr.createComponent(componentType, { bindings, injector: this.injector });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  onFieldsInitialized(): void {
    this.fieldsInitializedSubject.next();
  }
}

export { GroupFieldComponent };

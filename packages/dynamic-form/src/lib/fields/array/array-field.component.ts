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
import { forkJoin, map, of, switchMap } from 'rxjs';
import { get, memoize } from 'lodash-es';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { FieldSignalContext } from '../../mappers';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { createSchemaFromFields } from '../../core';
import { EventBus, SubmitEvent } from '../../events';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { flattenFields } from '../../utils';

@Component({
  selector: 'array-field',
  template: `
    <form [class.disabled]="disabled()" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './array-field.component.scss',
  host: {
    class: 'df-field df-array',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  providers: [EventBus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FieldRendererDirective],
})
export default class ArrayFieldComponent<T extends any[], TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // Type-safe memoized functions for performance optimization
  private readonly memoizedFlattenFields = memoize(
    (fields: FieldDef<any>[], registry: Map<string, any>) => flattenFields(fields, registry),
    (fields, registry) =>
      JSON.stringify(fields.map((f) => ({ key: f.key, type: f.type }))) + '_' + Array.from(registry.keys()).sort().join(',')
  );

  private readonly memoizedDefaultValues = memoize(
    <T extends FieldDef<any>>(fields: T[], registry: Map<string, any>) => fields.map((field) => getFieldDefaultValue(field, registry)),
    (fields, registry) => fields.map((f) => f.key).join(',') + '_' + Array.from(registry.keys()).sort().join(',')
  );

  /** Field configuration input */
  field = input.required<ArrayField<T>>();
  key = input.required<string>();

  // Parent form context inputs
  parentForm = input.required<ReturnType<typeof form<TModel>>>();
  parentFieldSignalContext = input.required<FieldSignalContext<TModel>>();

  private readonly formSetup = computed(() => {
    const arrayField = this.field();
    const registry = this.fieldRegistry.raw;

    if (arrayField.fields && arrayField.fields.length > 0) {
      // Use memoized functions for expensive operations with registry
      const flattenedFields = this.memoizedFlattenFields(arrayField.fields, registry);
      const defaultValues = this.memoizedDefaultValues(flattenedFields, registry);

      return {
        fields: flattenedFields,
        originalFields: arrayField.fields,
        defaultValues,
        registry, // Include registry for schema creation
      };
    }

    return {
      fields: [],
      originalFields: [],
      defaultValues: [],
      registry, // Include registry even for empty forms
    };
  });

  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  // Create reactive array value signal that extracts array-specific values from parent form
  private readonly entity = linkedSignal(() => {
    const parentValue = this.parentFieldSignalContext().value();
    const arrayKey = this.field().key;
    const defaults = this.defaultValues();

    // Extract the array's nested values from parent form
    const arrayValue = get(parentValue, arrayKey) || [];
    // For arrays, we merge defaults with the array values
    return Array.isArray(arrayValue) ? arrayValue : defaults;
  });

  // Create nested form for this array
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

  readonly formValue = computed(() => this.entity());

  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));
  readonly submitted = outputFromObservable(this.eventBus.on<SubmitEvent>('submit'));

  // Convert field setup to observable for field mapping
  fields$ = toObservable(computed(() => this.formSetup().fields));

  // Create field fields following the dynamic form pattern
  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields: FieldDef<any>[]) => {
        if (!fields || fields.length === 0) {
          return of([]);
        }

        return forkJoin(this.mapFields(fields));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    ),
    { initialValue: [] }
  );

  private mapFields(fields: FieldDef<any>[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map((fieldDef) => this.mapSingleField(fieldDef))
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => field !== undefined);
  }

  private async mapSingleField(fieldDef: FieldDef<any>): Promise<ComponentRef<FormUiControl> | undefined> {
    return this.fieldRegistry
      .loadTypeComponent(fieldDef.type)
      .then((componentType) => {
        // Check if component is destroyed before creating new components
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // Create nested field signal context for array children
        // This creates a new form context scoped to this array
        const arrayFieldSignalContext: FieldSignalContext<any[]> = {
          injector: this.injector,
          value: this.parentFieldSignalContext().value, // Pass through the parent's value signal
          defaultValues: this.defaultValues,
          form: this.form() as ReturnType<typeof form<any[]>>, // Use this array's nested form
        };

        const bindings = mapFieldToBindings(fieldDef, {
          fieldSignalContext: arrayFieldSignalContext,
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
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };

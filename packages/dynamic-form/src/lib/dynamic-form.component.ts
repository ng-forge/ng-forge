import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  Injector,
  input,
  inputBinding,
  linkedSignal,
  model,
  runInInjectionContext,
  signal,
  twoWayBinding,
  untracked,
  ViewContainerRef,
  WritableSignal,
} from '@angular/core';
import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { get, keyBy, mapValues, set } from 'lodash-es';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { FieldDef, FormConfig, InferFormValue } from './models/field-config';
import { FieldRegistry } from './core/field-registry';
import { createSchemaFromFields } from './core/schema-factory';

@Component({
  selector: 'dynamic-form',
  imports: [FieldRendererDirective],
  template: `
    <form [class.disabled]="formOptions().disabled" [fieldRenderer]="fields()">
      <!-- Fields will be automatically rendered by the fieldRenderer directive -->
    </form>
  `,
  styleUrl: './dynamic-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly FieldDef[] = readonly FieldDef[], TModel = InferFormValue<TFields>> {
  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  config = input.required<FormConfig<TFields>>();

  // Form value model for two-way binding
  value = model<Partial<TModel> | undefined>(undefined);

  /**
   * Computed that determines the form approach and prepares form data
   */
  private readonly formSetup = computed(() => {
    const config = this.config();

    // Clear field signals when config changes to ensure fresh bindings
    this.fieldSignals.clear();

    if (config.fields && config.fields.length > 0) {
      const fieldsById = keyBy(config.fields, 'key');
      const defaultValues = mapValues(fieldsById, (field) => this.getFieldDefaultValue(field)) as TModel;

      return {
        approach: 'fields' as const,
        fields: config.fields,
        defaultValues,
        schema: undefined,
      };
    }

    if (config.schema?.fieldDefs) {
      const fieldsById = keyBy(config.schema.fieldDefs, 'key');
      const defaultValues = mapValues(fieldsById, (field) => this.getFieldDefaultValue(field)) as TModel;

      return {
        approach: 'schema' as const,
        fields: config.schema.fieldDefs,
        defaultValues,
        schema: config.schema.definition,
      };
    }

    // Fallback: empty form
    return {
      approach: 'fields' as const,
      fields: [],
      defaultValues: {} as TModel,
      schema: undefined,
    };
  });

  /**
   * Default values for form initialization
   */
  readonly defaultValues = linkedSignal(() => this.formSetup().defaultValues);

  /**
   * Entity signal for form binding - single source of truth
   * This linkedSignal maintains the form entity state and synchronizes with input value changes
   */
  private readonly entity = linkedSignal(() => {
    // Combine input value with default values
    const inputValue = this.value();
    const defaults = this.defaultValues();

    // Input value takes precedence over defaults
    return { ...defaults, ...inputValue } as TModel;
  });

  /**
   * Deep signal map for field properties
   * Each field gets its own signal that's bound to the entity property
   */
  private readonly fieldSignals = new Map<string, WritableSignal<any>>();

  /**
   * Gets or creates a signal for a specific field property
   */
  private getFieldSignal(fieldKey: string, initialValue: any): WritableSignal<any> {
    if (!this.fieldSignals.has(fieldKey)) {
      // Create a signal for this field property
      const fieldSignal = runInInjectionContext(this.injector, () => signal(initialValue));
      this.fieldSignals.set(fieldKey, fieldSignal);

      // Set up explicit effect to propagate field changes back to the main model
      runInInjectionContext(this.injector, () => {
        explicitEffect([fieldSignal], ([fieldValue]) => {
          untracked(() => {
            const currentModel = this.value() || ({} as TModel);
            const currentFieldValue = get(currentModel, fieldKey);

            // Only update if the value is actually different to prevent loops
            if (currentFieldValue !== fieldValue) {
              const newModel = { ...currentModel };
              set(newModel, fieldKey, fieldValue);
              this.value.set(newModel as Partial<TModel>);
            }
          });
        });
      });
    }

    return this.fieldSignals.get(fieldKey)!;
  }

  /**
   * Computed form options from config - exposed for consumers
   */
  readonly formOptions = computed(() => {
    const config = this.config();
    return config.options || {};
  });

  /**
   * Computed schema metadata from config - exposed for consumers
   */
  readonly schemaMetadata = computed(() => {
    const config = this.config();
    return config.schema?.metadata;
  });

  /**
   * Form creation - adapts based on config approach
   */
  private readonly form = computed<ReturnType<typeof form<TModel>>>(() => {
    return runInInjectionContext(this.injector, () => {
      const setup = this.formSetup();

      if (setup.fields.length > 0) {
        const schema = createSchemaFromFields(setup.fields);
        return untracked(() => form(this.entity, schema));
      }

      // Fallback for empty forms
      return untracked(() => form(this.entity));
    });
  });

  /**
   * Computed signals that expose form properties
   * These maintain the reactive connection to the underlying Angular signal form
   */
  readonly formValue = computed(() => this.entity());

  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  /**
   * Output events for form state changes (excluding value which is now a model)
   */
  readonly validityChange = outputFromObservable(toObservable(this.valid));
  readonly dirtyChange = outputFromObservable(toObservable(this.dirty));

  // TODO: Apply validation timing options (validateOnChange, validateOnBlur)
  // These options would need to be implemented at the field component level
  // or through Angular signal forms configuration when that API is available

  fields$ = toObservable(computed(() => this.formSetup().fields));

  fields = toSignal(
    this.fields$.pipe(
      switchMap((fields) => {
        const fieldArray = fields as readonly FieldDef[];

        if (!fieldArray || fieldArray.length === 0) {
          return of([]);
        }

        return combineLatest(this.mapFields(fieldArray));
      }),
      map((components) => components.filter((comp): comp is ComponentRef<FormUiControl> => !!comp))
    )
  );

  private mapFields(fields: readonly FieldDef[]): Promise<ComponentRef<FormUiControl>>[] {
    return fields
      .map(async (fieldDef) => {
        const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

        if (!componentType) {
          return undefined;
        }

        const bindings: Binding[] = [];
        const valueProp = this.getValueProp(fieldDef);

        if (valueProp) {
          // Get the current entity value and default for this field
          const currentEntity = this.entity();
          const initialValue = get(currentEntity, fieldDef.key) ?? this.getFieldDefaultValue(fieldDef);

          // Get or create a field signal for this property
          const fieldSignal = this.getFieldSignal(fieldDef.key, initialValue);

          // Sync the field signal with the current entity value when entity changes
          runInInjectionContext(this.injector, () => {
            explicitEffect([this.entity], ([entityValue]) => {
              const currentFieldValue = get(entityValue, fieldDef.key);
              const fieldSignalValue = fieldSignal();

              // Only update field signal if entity value is different to prevent loops
              if (currentFieldValue !== fieldSignalValue) {
                fieldSignal.set(currentFieldValue ?? this.getFieldDefaultValue(fieldDef));
              }
            });
          });

          bindings.push(twoWayBinding(valueProp, fieldSignal));
        }

        // Add standard bindings that most components support
        if (fieldDef.label) {
          bindings.push(inputBinding('label', () => fieldDef.label));
        }

        if (fieldDef.className) {
          bindings.push(inputBinding('className', () => fieldDef.className));
        }

        // Add custom properties from fieldDef.props
        if (fieldDef.props) {
          const propKeys = Object.keys(fieldDef.props);
          propKeys.forEach((key) => {
            const value = fieldDef.props![key];
            bindings.push(inputBinding(key, () => value));
          });
        }

        return this.vcr.createComponent(componentType, { bindings });
      })
      .filter((field): field is Promise<ComponentRef<FormUiControl>> => !!field);
  }

  private getValueProp(fieldDef: FieldDef): 'checked' | 'value' | undefined {
    // TODO: improve solution for determining value binding based on field type

    // Submit buttons don't have value bindings
    if (fieldDef.type === 'submit') {
      return undefined;
    }

    // Multi-checkbox uses 'value' (array of selected values)
    if (fieldDef.type === 'multi-checkbox') {
      return 'value';
    }

    // Single checkbox/toggle types use 'checked'
    if (fieldDef.type === 'checkbox' || fieldDef.type === 'toggle') {
      return 'checked';
    }

    // For all other field types, default to 'value'
    return 'value';
  }

  /**
   * Gets appropriate default value for a field based on its type
   */
  private getFieldDefaultValue(field: FieldDef): unknown {
    // TODO: improve the solution by binding default value logic to field type definitions

    // If field has explicit default value, use it
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    // Multi-checkbox defaults to empty array
    if (field.type === 'multi-checkbox') {
      return [];
    }

    // Single checkbox/toggle types default to false
    if (field.type === 'checkbox' || field.type === 'toggle') {
      return false;
    }

    // For all other field types, default to empty string
    return '';
  }
}

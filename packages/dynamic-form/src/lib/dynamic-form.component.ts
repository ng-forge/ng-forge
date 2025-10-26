import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  effect,
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
} from '@angular/core';

import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { outputFromObservable, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { keyBy, mapValues } from 'lodash-es';

import { FieldDef, FormConfig, InferFormValue } from './models/field-config';
import { FieldRegistry } from './core/field-registry';
import { createSchemaFromFields } from './core/schema-factory';
import { explicitEffect } from 'ngxtension/explicit-effect';

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

  // Internal form state - separate from model to avoid loops
  private readonly _internalFormValue = signal<TModel>({} as TModel);

  /**
   * Computed that determines the form approach and prepares form data
   */
  private readonly formSetup = computed(() => {
    const config = this.config();

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
  readonly formValue = computed(() => this._internalFormValue());

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

  readonly entityUpdateEffect = explicitEffect([this.entity], ([entityValue]) => {
    this._internalFormValue.set(entityValue);
  });

  // Method to update field values and sync to model
  private updateFieldValue(key: string, value: unknown): void {
    const currentValue = this._internalFormValue();
    const newValue = { ...currentValue, [key]: value } as TModel;
    this._internalFormValue.set(newValue);
    this.value.set(newValue);
  }

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
          // Create a writable signal for the field that syncs with internal state
          const currentInternalValue = this._internalFormValue();
          const initialValue = (currentInternalValue as any)?.[fieldDef.key] ?? this.getFieldDefaultValue(fieldDef);
          const formFieldValue = signal(initialValue);

          // Listen for field changes and update internal form state
          runInInjectionContext(this.injector, () => {
            effect(() => {
              const fieldValue = formFieldValue();
              untracked(() => {
                this.updateFieldValue(fieldDef.key, fieldValue);
              });
            });
          });

          bindings.push(twoWayBinding(valueProp, formFieldValue));
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

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
  output,
  runInInjectionContext,
  twoWayBinding,
  untracked,
  ViewContainerRef,
} from '@angular/core';

import { FieldRendererDirective } from './directives/dynamic-form.directive';
import { form, FormUiControl } from '@angular/forms/signals';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import { keyBy, mapValues } from 'lodash-es';

import { buildValidationRules, FieldDef, FormConfig, InferFormValue } from './models/field-config';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TFields extends readonly FieldDef[] = readonly FieldDef[], TModel = InferFormValue<TFields>> {
  private readonly fieldRegistry = inject(FieldRegistry);
  private readonly vcr = inject(ViewContainerRef);
  private readonly injector = inject(Injector);

  config = input.required<FormConfig<TFields>>();

  // Form value input/output for two-way binding
  value = input<Partial<TModel> | undefined>(undefined);

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
  readonly formValue = computed(() => this.entity());
  readonly valid = computed(() => this.form()().valid());
  readonly invalid = computed(() => this.form()().invalid());
  readonly dirty = computed(() => this.form()().dirty());
  readonly touched = computed(() => this.form()().touched());
  readonly errors = computed(() => this.form()().errors());
  readonly disabled = computed(() => this.form()().disabled());

  /**
   * Output events for form state changes
   */
  readonly valueChange = output<TModel>();
  readonly validityChange = output<boolean>();
  readonly dirtyChange = output<boolean>();

  constructor() {
    // Emit value changes for two-way binding
    effect(() => {
      const currentValue = this.formValue();
      this.valueChange.emit(currentValue);
    });
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

        return combineLatest(
          fieldArray.map(async (fieldDef) => {
            const componentType = await this.fieldRegistry.loadTypeComponent(fieldDef.type).catch(() => undefined);

            if (!componentType) {
              return undefined;
            }

            const bindings: Binding[] = [];
            const valueProp = this.getValueProp(fieldDef);

            if (valueProp) {
              // Create a linkedSignal for this specific field that syncs with the entity
              const formFieldValue = linkedSignal(() => {
                const entityValue = this.entity();
                return (entityValue as any)?.[fieldDef.key] ?? this.getFieldDefaultValue(fieldDef);
              });

              bindings.push(twoWayBinding(valueProp, formFieldValue));
            }

            // Build validation rules from field properties
            const validationRules = buildValidationRules(fieldDef);

            // Create input bindings map
            const inputBindingsMap = {
              // Base properties
              label: () => fieldDef.label,
              className: () => fieldDef.className,
              // Validation rules (built from implicit properties)
              validation: () => validationRules,
            };

            // Apply input bindings from map - only if property exists in fieldDef
            const entries = Object.keys(inputBindingsMap) as (keyof typeof inputBindingsMap)[];
            entries.forEach((key) => {
              if (key in fieldDef && (fieldDef as any)[key] !== undefined) {
                bindings.push(inputBinding(key as string, inputBindingsMap[key]));
              }
            });

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
        );
      }),
      map((fields) => (fields as ComponentRef<FormUiControl>[]).filter((field): field is ComponentRef<FormUiControl> => !!field))
    )
  );

  getValueProp(fieldDef: FieldDef): 'checked' | 'value' | undefined {
    // For checkbox/toggle types, use 'checked'
    if (fieldDef.type.indexOf('checkbox') !== -1 || fieldDef.type.indexOf('toggle') !== -1) {
      return 'checked';
    }

    // For all other field types, default to 'value'
    return 'value';
  }

  /**
   * Gets appropriate default value for a field based on its type
   */
  private getFieldDefaultValue(field: FieldDef): unknown {
    // If field has explicit default value, use it
    if (field.defaultValue !== undefined) {
      return field.defaultValue;
    }

    // For checkbox/toggle types, default to false
    if (field.type.indexOf('checkbox') !== -1 || field.type.indexOf('toggle') !== -1) {
      return false;
    }

    // For all other field types, default to empty string
    return '';
  }
}

import {
  Binding,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  computed,
  inject,
  input,
  inputBinding,
  OnDestroy,
  outputBinding,
  signal,
  viewChildren,
  ViewContainerRef,
} from '@angular/core';
import { outputFromObservable } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import type { FieldConfig } from './models/field-config';
import type { FormOptions } from './models/form-options';
import { FieldRegistry } from './core/field-registry';
import { explicitEffect } from 'ngxtension/explicit-effect';

const FIELD_TYPE_TO_PROPERTY = {
  checkbox: 'checked',
  input: 'value',
  select: 'value',
} as const;

const VALIDATION_PROPS = [
  'required',
  'validators',
  'validation',
  'minLength',
  'maxLength',
  'min',
  'max',
  'pattern',
  'email',
  'custom',
] as const;

const FIELD_ID_PREFIX = 'dynamic-field' as const;
const DEFAULT_BINDING_PROPERTY = 'value' as const;
const FIELD_CONTAINER_REF = 'fieldContainer' as const;

/**
 * The main dynamic form component that renders form fields based on configuration.
 *
 * This component provides a declarative way to build reactive forms using field configurations.
 * It supports type-safe form models, dynamic field rendering, validation, and two-way data binding.
 *
 * @template TModel - The type of the form model
 *
 * @example
 * ```typescript
 * // Basic usage
 * <dynamic-form
 *   [fields]="fieldConfigs"
 *   [value]="formModel"
 *   (valueChange)="onFormChange($event)"
 * />
 * ```
 *
 * @example
 * ```typescript
 * // With options
 * <dynamic-form
 *   [fields]="fieldConfigs"
 *   [value]="formModel"
 *   [options]="{ validateOnChange: true }"
 *   (valueChange)="onFormChange($event)"
 * />
 * ```
 */
@Component({
  selector: 'dynamic-form',
  template: `
    @for (field of processedFields(); track field.id || field.key) {
    <ng-container #fieldContainer />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicForm<TModel = unknown> implements OnDestroy {
  private fieldRegistry = inject(FieldRegistry);
  private destroy$ = new Subject<void>();

  fieldContainers = viewChildren(FIELD_CONTAINER_REF, { read: ViewContainerRef });

  /**
   * Array of field configurations that define the form structure.
   * Each field config specifies the field type, properties, validation rules, and other settings.
   */
  fields = input.required<FieldConfig<TModel>[]>();

  /**
   * The current form model value. When provided, the form will be initialized with these values.
   * Changes to this input will update the form fields accordingly.
   */
  value = input<TModel>();

  /**
   * Optional form-wide configuration options such as validation settings.
   */
  options = input<FormOptions>();

  private componentRefs: ComponentRef<unknown>[] = [];

  // Simple signal to hold current form state
  private formState = signal<TModel>({} as TModel);

  // Output subject for forwarding changes
  private valueChange$ = new Subject<TModel>();

  /**
   * Emits the updated form model whenever any field value changes.
   * Use this for two-way data binding or to react to form changes.
   *
   * @example
   * ```typescript
   * onFormChange(newValue: MyFormModel) {
   *   console.log('Form updated:', newValue);
   *   this.formModel = newValue;
   * }
   * ```
   */
  valueChange = outputFromObservable(this.valueChange$);

  // Computed current form state based on input value or form state
  currentFormValue = computed(() => {
    const inputValue = this.value();
    if (inputValue !== undefined && inputValue !== null) {
      return inputValue;
    }
    return this.formState();
  });

  // Process fields with defaults and hooks
  processedFields = computed(() => {
    return this.fields().map((field) => {
      // Generate field ID if not provided
      if (!field.id) {
        field.id = this.generateFieldId(field);
      }

      // Merge field props with type defaults
      if (field.type) {
        const fieldType = this.fieldRegistry.getType(field.type);
        if (fieldType?.defaultProps) {
          field.props = {
            ...fieldType.defaultProps,
            ...field.props,
          };
        }
      }

      // Call onInit hook
      field.hooks?.onInit?.(field);

      return field;
    });
  });

  constructor() {
    explicitEffect([this.processedFields, this.fieldContainers], ([fields, containers]) => {
      if (containers.length > 0) {
        void this.renderFields(fields, containers);
      }
    });
  }

  ngOnDestroy(): void {
    this.componentRefs.forEach((ref) => ref.destroy());
    this.destroy$.next();
    this.destroy$.complete();
    this.valueChange$.complete();
  }

  private async renderFields(fields: FieldConfig<TModel>[], containers: readonly ViewContainerRef[]): Promise<void> {
    if (containers.length === 0 || fields.length === 0) {
      return;
    }

    // Clear existing components
    this.componentRefs.forEach((ref) => ref.destroy());
    this.componentRefs = [];
    containers.forEach((container) => container.clear());

    // Render each field
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      const container = containers[i];

      if (!container) continue;

      try {
        const component = await this.fieldRegistry.loadTypeComponent(field.type);
        const bindings = this.createFieldBindings(field);
        const componentRef = container.createComponent(component, { bindings });
        this.componentRefs.push(componentRef);
      } catch (error) {
        console.error(`Failed to render field type "${field.type}":`, error);
      }
    }
  }

  private createFieldBindings(field: FieldConfig<TModel>): Binding[] {
    const bindings: Binding[] = [];

    if (field.props) {
      Object.entries(field.props).forEach(([key, value]) => {
        // Skip validation and form-related props that aren't component inputs
        if (this.isValidationProp(key)) {
          return;
        }
        bindings.push(inputBinding(key, () => value));
      });
    }

    // Bind field value using input binding for the value
    if (field.key) {
      const bindingProperty = this.getBindingProperty(field.type);

      // Input binding for the current value
      bindings.push(
        inputBinding(bindingProperty, () => {
          const currentVal = this.currentFormValue();
          return currentVal && field.key ? this.getNestedValue(currentVal, field.key) : undefined;
        })
      );

      // Output binding for value changes
      const outputProperty = `${bindingProperty}Change`;
      bindings.push(
        outputBinding(outputProperty, (newValue: unknown) => {
          if (field.key) {
            this.handleFieldChange(field.key, newValue);
          }
        })
      );
    }

    return bindings;
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current: unknown, key: string) => {
      if (current && typeof current === 'object' && key in current) {
        return (current as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
  }

  private handleFieldChange(key: string, newValue: unknown): void {
    const currentModel = this.currentFormValue() || ({} as TModel);
    const updatedModel = { ...currentModel } as Record<string, unknown>;
    this.setNestedValue(updatedModel, key, newValue);
    const finalModel = updatedModel as TModel;

    // Update form state and forward the change
    this.formState.set(finalModel);
    this.valueChange$.next(finalModel);
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.');
    const lastKey = keys.pop();
    if (!lastKey) return;
    const target = keys.reduce((current: Record<string, unknown>, key: string) => {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      return current[key] as Record<string, unknown>;
    }, obj);
    target[lastKey] = value;
  }

  private getBindingProperty(fieldType: string): string {
    type FieldType = keyof typeof FIELD_TYPE_TO_PROPERTY;
    return FIELD_TYPE_TO_PROPERTY[fieldType as FieldType] ?? DEFAULT_BINDING_PROPERTY;
  }

  private isValidationProp(key: string): key is (typeof VALIDATION_PROPS)[number] {
    return (VALIDATION_PROPS as readonly string[]).includes(key);
  }

  private generateFieldId(field: FieldConfig<TModel>): string {
    const key = field.key || field.type;
    const random = Math.random().toString(36).substring(2, 9);
    return `${FIELD_ID_PREFIX}-${key}-${random}`;
  }
}

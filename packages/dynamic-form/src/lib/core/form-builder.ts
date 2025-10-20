import { inject, Injectable } from '@angular/core';
import { FieldConfig } from '../models/field-config';
import { FieldRegistry } from './field-registry';

/**
 * Service to process dynamic form field configurations
 */
@Injectable({ providedIn: 'root' })
export class FormBuilder {
  private fieldRegistry = inject(FieldRegistry);

  /**
   * Process field configurations and apply defaults
   */
  processFields<TModel = unknown>(fields: FieldConfig<TModel>[]): FieldConfig<TModel>[] {
    return fields.map((field) => this.processField(field));
  }

  /**
   * Process a single field and apply defaults
   */
  private processField<TModel = unknown>(field: FieldConfig<TModel>): FieldConfig<TModel> {
    // Generate field ID if not provided
    if (!field.id) {
      field.id = this.generateFieldId(field);
    }

    // Handle field groups recursively
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      field.fieldGroup = field.fieldGroup.map((nestedField) => {
        nestedField.parent = field;
        return this.processField(nestedField as FieldConfig<TModel>);
      });
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
  }

  /**
   * Generate a unique ID for a field
   */
  private generateFieldId(field: FieldConfig<any>): string {
    const prefix = 'dynamic-field';
    const key = field.key || field.type;
    const random = Math.random().toString(36).substring(2, 9);
    return `${prefix}-${key}-${random}`;
  }
}

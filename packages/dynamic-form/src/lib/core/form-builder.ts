import { Injectable, inject, WritableSignal } from '@angular/core';
import { form, FieldTree, required, minLength, maxLength, min, max, email, pattern, SchemaFn } from '@angular/forms/signals';
import { FieldConfig } from '../models/field-config';
import { FormOptions } from '../models/form-options';
import { FieldRegistry } from './field-registry';

/**
 * Service to build dynamic forms from field configurations
 */
@Injectable({ providedIn: 'root' })
export class FormBuilder {
  private fieldRegistry = inject(FieldRegistry);

  /**
   * Build a signal form from field configurations
   */
  buildForm<TModel = unknown>(
    fields: FieldConfig<TModel>[],
    model: WritableSignal<TModel>,
    options?: FormOptions
  ): FieldTree<TModel> {
    // Create schema function from field configurations
    const schemaFn = this.createSchemaFromFields(fields, options);
    
    // Create and return the signal form
    return form(model, schemaFn);
  }

  /**
   * Create a schema function from field configurations
   */
  private createSchemaFromFields<TModel = unknown>(
    fields: FieldConfig<TModel>[],
    options?: FormOptions
  ): SchemaFn<TModel> {
    return (root) => {
      this.processFieldsSchema(fields, root, options);
    };
  }

  /**
   * Process fields and apply their schema rules
   */
  private processFieldsSchema<TModel = unknown>(
    fields: FieldConfig<TModel>[],
    root: any,
    options?: FormOptions
  ): void {
    fields.forEach(field => {
      this.processFieldSchema(field, root, options);
    });
  }

  /**
   * Process a single field and apply its schema rules
   */
  private processFieldSchema<TModel = unknown>(
    field: FieldConfig<TModel>,
    root: any,
    options?: FormOptions
  ): void {
    // Generate field ID if not provided
    if (!field.id) {
      field.id = this.generateFieldId(field);
    }

    // Handle field groups recursively
    if (field.fieldGroup && field.fieldGroup.length > 0) {
      field.fieldGroup.forEach(nestedField => {
        nestedField.parent = field;
        this.processFieldSchema(nestedField as FieldConfig<TModel>, root, options);
      });
      return;
    }

    // Skip fields without keys
    if (!field.key) {
      return;
    }

    // Merge field props with type defaults
    const fieldType = this.fieldRegistry.getType(field.type);
    if (fieldType?.defaultProps) {
      field.props = {
        ...fieldType.defaultProps,
        ...field.props,
      };
    }

    // Apply validators using signal forms validators
    if (field.validators) {
      this.applySignalValidators(field, root);
    }

    // Apply expressions using signal forms logic
    if (field.expressions) {
      this.applySignalExpressions(field, root);
    }

    // Call onInit hook
    field.hooks?.onInit?.(field);
  }

  /**
   * Apply signal form validators to a field
   */
  private applySignalValidators<TModel = unknown>(
    field: FieldConfig<TModel>,
    root: any
  ): void {
    if (!field.validators || !field.key) {
      return;
    }

    // Get field path from root
    const fieldPath = this.getFieldPath(field.key, root);
    
    // Convert field validators to signal form validators
    Object.entries(field.validators).forEach(([validatorName, validatorConfig]) => {
      switch (validatorName) {
        case 'required':
          if (validatorConfig) {
            required(fieldPath);
          }
          break;
        case 'minLength':
          if (typeof validatorConfig === 'number') {
            minLength(fieldPath, validatorConfig);
          }
          break;
        case 'maxLength':
          if (typeof validatorConfig === 'number') {
            maxLength(fieldPath, validatorConfig);
          }
          break;
        case 'min':
          if (typeof validatorConfig === 'number') {
            min(fieldPath, validatorConfig);
          }
          break;
        case 'max':
          if (typeof validatorConfig === 'number') {
            max(fieldPath, validatorConfig);
          }
          break;
        case 'email':
          if (validatorConfig) {
            email(fieldPath);
          }
          break;
        case 'pattern':
          if (validatorConfig instanceof RegExp) {
            pattern(fieldPath, validatorConfig);
          } else if (validatorConfig && typeof validatorConfig === 'object' && 'value' in validatorConfig) {
            const regexValue = (validatorConfig as any).value;
            if (regexValue instanceof RegExp) {
              pattern(fieldPath, regexValue);
            }
          }
          break;
      }
    });
  }

  /**
   * Apply signal form expressions to a field
   */
  private applySignalExpressions<TModel = unknown>(
    field: FieldConfig<TModel>,
    root: any
  ): void {
    if (!field.expressions || !field.key) {
      return;
    }

    // Get field path from root
    const fieldPath = this.getFieldPath(field.key, root);
    
    // TODO: Implement signal form expressions using apply() functions
    // This would involve using applyWhen, applyEach, etc. from signal forms
    console.warn('Signal form expressions not yet implemented', fieldPath);
  }

  /**
   * Get field path from root using dot notation
   */
  private getFieldPath(key: string, root: any): any {
    const keys = key.split('.');
    let path = root;
    
    for (const k of keys) {
      path = path[k];
    }
    
    return path;
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

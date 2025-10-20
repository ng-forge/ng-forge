import { Injectable } from '@angular/core';
import { FieldTypeDefinition, FieldWrapperDefinition } from '../models/field-type';
import { FormOptions } from '../models/form-options';

/**
 * Configuration object for the dynamic form
 */
export interface DynamicFormConfig {
  /** Registered field types */
  types?: FieldTypeDefinition[];

  /** Registered wrappers */
  wrappers?: FieldWrapperDefinition[];

  /** Custom validators */
  validators?: Record<string, unknown>;

  /** Default form options */
  defaultFormOptions?: Partial<FormOptions>;

  /** Default field props */
  defaultFieldProps?: Record<string, unknown>;

  /** Custom error messages */
  errorMessages?: Record<string, string | ((error: unknown, field: unknown) => string)>;
}

/**
 * Service to merge multiple configuration objects
 */
@Injectable({ providedIn: 'root' })
export class ConfigMerger {
  /**
   * Merge multiple configuration objects into one
   */
  merge(...configs: Partial<DynamicFormConfig>[]): DynamicFormConfig {
    return configs.reduce((merged, config) => {
      return {
        types: this.mergeTypes(merged.types, config.types),
        wrappers: this.mergeWrappers(merged.wrappers, config.wrappers),
        validators: { ...merged.validators, ...config.validators },
        defaultFormOptions: {
          ...merged.defaultFormOptions,
          ...config.defaultFormOptions,
        },
        defaultFieldProps: {
          ...merged.defaultFieldProps,
          ...config.defaultFieldProps,
        },
        errorMessages: {
          ...merged.errorMessages,
          ...config.errorMessages,
        },
      };
    }, this.getDefaultConfig());
  }

  /**
   * Get the default configuration
   */
  private getDefaultConfig(): DynamicFormConfig {
    return {
      types: [],
      wrappers: [],
      validators: {},
      defaultFormOptions: {
        showError: true,
        validationStrategy: 'onTouched',
        updateOn: 'change',
      },
      defaultFieldProps: {},
      errorMessages: {},
    };
  }

  /**
   * Merge field type arrays
   */
  private mergeTypes(target: FieldTypeDefinition[] = [], source: FieldTypeDefinition[] = []): FieldTypeDefinition[] {
    const merged = [...target];

    source.forEach((sourceType) => {
      const existingIndex = merged.findIndex((t) => t.name === sourceType.name);

      if (existingIndex >= 0) {
        // Override existing type
        merged[existingIndex] = sourceType;
      } else {
        // Add new type
        merged.push(sourceType);
      }
    });

    return merged;
  }

  /**
   * Merge wrapper arrays
   */
  private mergeWrappers(target: FieldWrapperDefinition[] = [], source: FieldWrapperDefinition[] = []): FieldWrapperDefinition[] {
    const merged = [...target];

    source.forEach((sourceWrapper) => {
      const existingIndex = merged.findIndex((w) => w.name === sourceWrapper.name);

      if (existingIndex >= 0) {
        // Override existing wrapper
        merged[existingIndex] = sourceWrapper;
      } else {
        // Add new wrapper
        merged.push(sourceWrapper);
      }
    });

    return merged;
  }
}

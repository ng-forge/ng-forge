import { Injectable } from '@angular/core';
import { FieldContext } from '@angular/forms/signals';
import { EvaluationContext } from '../../models';
import { RootFormRegistryService } from './root-form-registry.service';

/**
 * Service that provides field evaluation context by combining
 * field context with root form registry information.
 * 
 * This service should be provided at the component level to ensure proper
 * isolation between different form instances.
 */
@Injectable()
export class FieldContextRegistryService {
  constructor(private rootFormRegistry: RootFormRegistryService) {}

  /**
   * Creates an evaluation context for a field by combining:
   * - The field's current value
   * - The root form value from the registry
   * - The field path (if available from form context)
   * - Custom functions (if provided)
   */
  createEvaluationContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>,
    formId: string = 'default'
  ): EvaluationContext {
    const fieldValue = fieldContext.value();
    
    // Get root form value from registry
    const rootForm = this.rootFormRegistry.getRootForm(formId);
    let formValue: Record<string, unknown> = {};
    
    if (rootForm) {
      try {
        const rootValue = fieldContext.valueOf(rootForm as any);
        if (rootValue && typeof rootValue === 'object' && !Array.isArray(rootValue)) {
          formValue = rootValue as Record<string, unknown>;
        }
      } catch (error) {
        console.warn('Failed to get root form value from registry:', error);
      }
    }

    // Get field path from form context
    const formContext = this.rootFormRegistry.getFormContext(formId);
    const fieldPath = this.extractFieldPath(fieldContext, formContext);

    return {
      fieldValue,
      formValue,
      fieldPath,
      customFunctions: customFunctions || {},
    };
  }

  /**
   * Registers a field path mapping for a specific form.
   * This can be called when fields are created to maintain path information.
   */
  registerFieldPath(
    fieldKey: string | number,
    parentPath: string,
    formId: string = 'default'
  ): void {
    const context = this.rootFormRegistry.getFormContext(formId);
    const fullPath = parentPath ? `${parentPath}.${fieldKey}` : String(fieldKey);
    
    context.fieldPaths = context.fieldPaths || {};
    (context.fieldPaths as Record<string, string>)[String(fieldKey)] = fullPath;
    
    this.rootFormRegistry.registerFormContext(context, formId);
  }

  /**
   * Extracts the field path for a given field context.
   * This is a simplified implementation that could be enhanced
   * based on the specific needs of the form library.
   */
  private extractFieldPath(
    fieldContext: FieldContext<unknown>,
    formContext: Record<string, unknown>
  ): string {
    // Check if the field context has a key property (for child fields)
    const extendedContext = fieldContext as any;
    
    if (extendedContext.key && typeof extendedContext.key === 'function') {
      try {
        const key = extendedContext.key();
        const fieldPaths = formContext.fieldPaths as Record<string, string> || {};
        return fieldPaths[String(key)] || String(key);
      } catch (error) {
        console.warn('Unable to extract field key:', error);
      }
    }

    // For root fields or when key is not available
    return '';
  }

  /**
   * Creates a simplified evaluation context with just the current field value.
   * Used as a fallback when root form registry is not available.
   */
  createFallbackContext<TValue>(
    fieldContext: FieldContext<TValue>,
    customFunctions?: Record<string, (context: EvaluationContext) => unknown>
  ): EvaluationContext {
    const fieldValue = fieldContext.value();
    
    // Try to use current field value as form value if it's an object
    let formValue: Record<string, unknown> = {};
    if (fieldValue && typeof fieldValue === 'object' && !Array.isArray(fieldValue)) {
      formValue = fieldValue as Record<string, unknown>;
    }

    return {
      fieldValue,
      formValue,
      fieldPath: '',
      customFunctions: customFunctions || {},
    };
  }
}
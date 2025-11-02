import { Injectable } from '@angular/core';
import { FieldTree } from '@angular/forms/signals';

/**
 * Registry service that maintains references to root form fields.
 * This provides a type-safe way to access root form values from child fields
 * without relying on internal Angular Forms API navigation.
 * 
 * This service should be provided at the component level to ensure proper
 * isolation between different form instances.
 */
@Injectable()
export class RootFormRegistryService {
  private readonly rootForms = new Map<string, FieldTree<unknown>>();
  private readonly formContexts = new Map<string, Record<string, unknown>>();
  
  /**
   * Registers a root form field with an optional identifier.
   * If no id is provided, uses 'default' as the key.
   */
  registerRootForm(rootField: FieldTree<unknown>, formId: string = 'default'): void {
    this.rootForms.set(formId, rootField);
  }

  /**
   * Gets a registered root form field by id.
   */
  getRootForm(formId: string = 'default'): FieldTree<unknown> | undefined {
    return this.rootForms.get(formId);
  }

  /**
   * Registers form context (field paths and metadata) for a specific form.
   * This can be used to store additional context information.
   */
  registerFormContext(context: Record<string, unknown>, formId: string = 'default'): void {
    this.formContexts.set(formId, context);
  }

  /**
   * Gets form context by id.
   */
  getFormContext(formId: string = 'default'): Record<string, unknown> {
    return this.formContexts.get(formId) || {};
  }

  /**
   * Unregisters a form and its context.
   * This should be called when a form component is destroyed to prevent memory leaks.
   */
  unregisterForm(formId: string = 'default'): void {
    this.rootForms.delete(formId);
    this.formContexts.delete(formId);
  }

  /**
   * Gets all registered form IDs.
   */
  getRegisteredFormIds(): string[] {
    return Array.from(this.rootForms.keys());
  }

  /**
   * Clears all registered forms. Useful for testing.
   */
  clear(): void {
    this.rootForms.clear();
    this.formContexts.clear();
  }
}
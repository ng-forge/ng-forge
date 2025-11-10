import { Injectable } from '@angular/core';
import { EvaluationContext } from '../../models';
import { ContextAwareValidator, SimpleCustomValidator, TreeValidator } from '../validation/validator-types';

@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, (context: EvaluationContext) => unknown>();
  private readonly simpleValidators = new Map<string, SimpleCustomValidator>();
  private readonly contextValidators = new Map<string, ContextAwareValidator>();
  private readonly treeValidators = new Map<string, TreeValidator>();

  /**
   * Register custom function for expressions
   */
  registerCustomFunction(name: string, fn: (context: EvaluationContext) => unknown): void {
    this.customFunctions.set(name, fn);
  }

  /**
   * Get all custom functions as an object
   */
  getCustomFunctions(): Record<string, (context: EvaluationContext) => unknown> {
    return Object.fromEntries(this.customFunctions);
  }

  /**
   * Clear all custom functions
   */
  clearCustomFunctions(): void {
    this.customFunctions.clear();
  }

  /**
   * Register a simple custom validator
   * Simple validators only receive field value and form value
   */
  registerSimpleValidator(name: string, fn: SimpleCustomValidator): void {
    this.simpleValidators.set(name, fn);
  }

  /**
   * Register a context-aware validator
   * Context validators receive full FieldContext with access to field state and other fields
   */
  registerContextValidator(name: string, fn: ContextAwareValidator): void {
    this.contextValidators.set(name, fn);
  }

  /**
   * Register a tree validator for cross-field validation
   * Tree validators can return errors targeting specific child fields
   */
  registerTreeValidator(name: string, fn: TreeValidator): void {
    this.treeValidators.set(name, fn);
  }

  /**
   * Get a simple validator by name
   */
  getSimpleValidator(name: string): SimpleCustomValidator | undefined {
    return this.simpleValidators.get(name);
  }

  /**
   * Get a context-aware validator by name
   */
  getContextValidator(name: string): ContextAwareValidator | undefined {
    return this.contextValidators.get(name);
  }

  /**
   * Get a tree validator by name
   */
  getTreeValidator(name: string): TreeValidator | undefined {
    return this.treeValidators.get(name);
  }

  /**
   * Clear all validators
   */
  clearValidators(): void {
    this.simpleValidators.clear();
    this.contextValidators.clear();
    this.treeValidators.clear();
  }

  /**
   * Clear everything (functions and validators)
   */
  clearAll(): void {
    this.clearCustomFunctions();
    this.clearValidators();
  }
}

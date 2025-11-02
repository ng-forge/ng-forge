import { Injectable } from '@angular/core';
import { EvaluationContext } from '../../models';

@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, (context: EvaluationContext) => unknown>();

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
}

import { Injectable } from '@angular/core';
import { CustomFunction, CustomFunctionOptions, CustomFunctionScope } from '../expressions/custom-function-types';
import type { AsyncConditionFunction, AsyncDerivationFunction } from '../expressions/async-custom-function-types';
import { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../validation/validator-types';

/** Registry service for custom functions and validators */
@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, CustomFunction>();
  private readonly customFunctionScopes = new Map<string, CustomFunctionScope>();
  private readonly derivationFunctions = new Map<string, CustomFunction>();
  private readonly asyncDerivationFunctions = new Map<string, AsyncDerivationFunction>();
  private readonly asyncConditionFunctions = new Map<string, AsyncConditionFunction>();
  private readonly validators = new Map<string, CustomValidator>();
  private readonly asyncValidators = new Map<string, AsyncCustomValidator>();
  private readonly httpValidators = new Map<string, HttpCustomValidator>();

  /**
   * Register a custom function for conditional expressions
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns any value
   * @param options - Optional configuration for the function
   */
  registerCustomFunction(name: string, fn: CustomFunction, options?: CustomFunctionOptions): void {
    this.customFunctions.set(name, fn);
    // Store scope (default to 'form' for conservative cross-field detection)
    this.customFunctionScopes.set(name, options?.scope ?? 'form');
  }

  /**
   * Get the scope of a registered custom function.
   *
   * @param name - The function name
   * @returns The function scope, or undefined if not registered
   */
  getCustomFunctionScope(name: string): CustomFunctionScope | undefined {
    return this.customFunctionScopes.get(name);
  }

  /**
   * Check if a custom function is field-scoped (no cross-field dependencies).
   *
   * @param name - The function name
   * @returns true if the function is field-scoped, false if form-scoped or not registered
   */
  isFieldScopedFunction(name: string): boolean {
    return this.customFunctionScopes.get(name) === 'field';
  }

  /** Get all custom functions as an object */
  getCustomFunctions(): Record<string, CustomFunction> {
    return Object.fromEntries(this.customFunctions);
  }

  /** Clear all custom functions and their scopes */
  clearCustomFunctions(): void {
    this.customFunctions.clear();
    this.customFunctionScopes.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Derivation Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register a derivation function for value derivation logic.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns the derived value
   */
  registerDerivationFunction(name: string, fn: CustomFunction): void {
    this.derivationFunctions.set(name, fn);
  }

  /** Get a derivation function by name */
  getDerivationFunction(name: string): CustomFunction | undefined {
    return this.derivationFunctions.get(name);
  }

  /** Get all derivation functions as an object */
  getDerivationFunctions(): Record<string, CustomFunction> {
    return Object.fromEntries(this.derivationFunctions);
  }

  /**
   * Set derivation functions from a config object.
   * Only updates functions if their references have changed.
   *
   * @param derivations - Object mapping function names to derivation functions
   */
  setDerivationFunctions(derivations: Record<string, CustomFunction> | undefined): void {
    this.setRegistryIfChanged(this.derivationFunctions, derivations);
  }

  /** Clear all derivation functions */
  clearDerivationFunctions(): void {
    this.derivationFunctions.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Async Derivation Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register an async derivation function.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns Promise/Observable
   */
  registerAsyncDerivationFunction(name: string, fn: AsyncDerivationFunction): void {
    this.asyncDerivationFunctions.set(name, fn);
  }

  /** Get an async derivation function by name */
  getAsyncDerivationFunction(name: string): AsyncDerivationFunction | undefined {
    return this.asyncDerivationFunctions.get(name);
  }

  /** Get all async derivation functions as an object */
  getAsyncDerivationFunctions(): Record<string, AsyncDerivationFunction> {
    return Object.fromEntries(this.asyncDerivationFunctions);
  }

  /**
   * Set async derivation functions from a config object.
   * Only updates functions if their references have changed.
   *
   * @param fns - Object mapping function names to async derivation functions
   */
  setAsyncDerivationFunctions(fns: Record<string, AsyncDerivationFunction> | undefined): void {
    this.setRegistryIfChanged(this.asyncDerivationFunctions, fns);
  }

  /** Clear all async derivation functions */
  clearAsyncDerivationFunctions(): void {
    this.asyncDerivationFunctions.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Async Condition Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register an async condition function.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns Promise/Observable of boolean
   */
  registerAsyncConditionFunction(name: string, fn: AsyncConditionFunction): void {
    this.asyncConditionFunctions.set(name, fn);
  }

  /** Get an async condition function by name */
  getAsyncConditionFunction(name: string): AsyncConditionFunction | undefined {
    return this.asyncConditionFunctions.get(name);
  }

  /** Get all async condition functions as an object */
  getAsyncConditionFunctions(): Record<string, AsyncConditionFunction> {
    return Object.fromEntries(this.asyncConditionFunctions);
  }

  /**
   * Set async condition functions from a config object.
   * Only updates functions if their references have changed.
   *
   * @param fns - Object mapping function names to async condition functions
   */
  setAsyncConditionFunctions(fns: Record<string, AsyncConditionFunction> | undefined): void {
    this.setRegistryIfChanged(this.asyncConditionFunctions, fns);
  }

  /** Clear all async condition functions */
  clearAsyncConditionFunctions(): void {
    this.asyncConditionFunctions.clear();
  }

  /**
   * Register a custom validator using Angular's public FieldContext API
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (ctx, params?) => ValidationError | ValidationError[] | null
   */
  registerValidator(name: string, fn: CustomValidator): void {
    this.validators.set(name, fn);
  }

  /** Get a validator by name */
  getValidator(name: string): CustomValidator | undefined {
    return this.validators.get(name);
  }

  /** Clear all validators */
  clearValidators(): void {
    this.validators.clear();
  }

  /**
   * Register an async validator using Angular's public validateAsync() API
   *
   * @param name - Unique identifier for the async validator
   * @param fn - Async validator function (ctx, params?) => Observable<ValidationError | ValidationError[] | null>
   */
  registerAsyncValidator(name: string, fn: AsyncCustomValidator): void {
    this.asyncValidators.set(name, fn);
  }

  /** Get an async validator by name */
  getAsyncValidator(name: string): AsyncCustomValidator | undefined {
    return this.asyncValidators.get(name);
  }

  /** Clear all async validators */
  clearAsyncValidators(): void {
    this.asyncValidators.clear();
  }

  /**
   * Register an HTTP validator configuration using Angular's public validateHttp() API
   *
   * @param name - Unique identifier for the HTTP validator
   * @param config - HTTP validator configuration object
   */
  registerHttpValidator(name: string, config: HttpCustomValidator): void {
    this.httpValidators.set(name, config);
  }

  /** Get an HTTP validator by name */
  getHttpValidator(name: string): HttpCustomValidator | undefined {
    return this.httpValidators.get(name);
  }

  /** Clear all HTTP validators */
  clearHttpValidators(): void {
    this.httpValidators.clear();
  }

  /**
   * Generic helper to set registry values only if they have changed
   *
   * @param registry - The Map to update
   * @param values - Object mapping keys to values
   */
  private setRegistryIfChanged<T>(registry: Map<string, T>, values: Record<string, T> | undefined): void {
    if (!values) return;

    const entries = Object.entries(values);
    const hasChanges = entries.some(([name, value]) => registry.get(name) !== value);

    if (hasChanges) {
      entries.forEach(([name, value]) => registry.set(name, value));
    }
  }

  /**
   * Set validators from a config object
   * Only updates validators if their references have changed
   *
   * @param validators - Object mapping validator names to validator functions
   */
  setValidators(validators: Record<string, CustomValidator> | undefined): void {
    this.setRegistryIfChanged(this.validators, validators);
  }

  /**
   * Set async validators from a config object
   * Only updates validators if their references have changed
   *
   * @param asyncValidators - Object mapping validator names to async validator configs
   */
  setAsyncValidators(asyncValidators: Record<string, AsyncCustomValidator> | undefined): void {
    this.setRegistryIfChanged(this.asyncValidators, asyncValidators);
  }

  /**
   * Set HTTP validators from a config object
   * Only updates validators if their references have changed
   *
   * @param httpValidators - Object mapping validator names to HTTP validator configs
   */
  setHttpValidators(httpValidators: Record<string, HttpCustomValidator> | undefined): void {
    this.setRegistryIfChanged(this.httpValidators, httpValidators);
  }

  /** Clear everything (functions and all validators) */
  clearAll(): void {
    this.clearCustomFunctions();
    this.clearDerivationFunctions();
    this.clearAsyncDerivationFunctions();
    this.clearAsyncConditionFunctions();
    this.clearValidators();
    this.clearAsyncValidators();
    this.clearHttpValidators();
  }
}

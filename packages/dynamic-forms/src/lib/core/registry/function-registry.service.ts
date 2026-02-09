import { Injectable } from '@angular/core';
import { CustomFunction, CustomFunctionOptions, CustomFunctionScope } from '../expressions/custom-function-types';
import { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../validation/validator-types';

/**
 * Registry service for custom functions and validators
 *
 * This service maintains four separate registries:
 *
 * 1. **Custom Functions** - For conditional expressions (when/readonly/disabled)
 *    - Used in: when conditions, readonly logic, disabled logic
 *    - Return type: any value (typically boolean)
 *    - Example: `isAdult: (ctx) => ctx.age >= 18`
 *
 * 2. **Custom Validators** - For synchronous validation using Angular's public FieldContext API
 *    - Used in: validators array on fields
 *    - Return type: ValidationError | ValidationError[] | null
 *    - Example: `noSpaces: (ctx) => ctx.value().includes(' ') ? { kind: 'noSpaces' } : null`
 *
 * 3. **Async Validators** - For asynchronous validation (debouncing, database lookups, etc.)
 *    - Used in: validators array on fields with type 'customAsync'
 *    - Return type: Observable<ValidationError | ValidationError[] | null>
 *    - Example: `checkUsername: (ctx) => userService.checkAvailability(ctx.value())`
 *
 * 4. **HTTP Validators** - For HTTP-based validation with automatic request cancellation
 *    - Used in: validators array on fields with type 'customHttp'
 *    - Configuration object with url, method, mapResponse, etc.
 *    - Example: `{ url: '/api/check', method: 'GET', mapResponse: ... }`
 *
 * @example
 * ```typescript
 * // Register a custom function for expressions
 * registry.registerCustomFunction('isAdult', (ctx) => ctx.age >= 18);
 *
 * // Use in field configuration
 * {
 *   key: 'alcoholPreference',
 *   when: { function: 'isAdult' }
 * }
 *
 * // Register a custom validator
 * registry.registerValidator('noSpaces', (ctx) => {
 *   const value = ctx.value();
 *   return typeof value === 'string' && value.includes(' ')
 *     ? { kind: 'noSpaces' }
 *     : null;
 * });
 *
 * // Use in field configuration
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }],
 *   validationMessages: {
 *     noSpaces: 'Spaces are not allowed'
 *   }
 * }
 * ```
 */
@Injectable()
export class FunctionRegistryService {
  private readonly customFunctions = new Map<string, CustomFunction>();
  private readonly customFunctionScopes = new Map<string, CustomFunctionScope>();
  private readonly derivationFunctions = new Map<string, CustomFunction>();
  private readonly propertyDerivationFunctions = new Map<string, CustomFunction>();
  private readonly validators = new Map<string, CustomValidator>();
  private readonly asyncValidators = new Map<string, AsyncCustomValidator>();
  private readonly httpValidators = new Map<string, HttpCustomValidator>();

  /**
   * Register a custom function for conditional expressions
   *
   * Custom functions are used for control flow logic (when/readonly/disabled),
   * NOT for validation. They return any value, typically boolean.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns any value
   * @param options - Optional configuration for the function
   *
   * @example
   * ```typescript
   * // Form-level function (default) - may access other fields
   * registry.registerCustomFunction('isAdult', (ctx) => ctx.formValue.age >= 18);
   *
   * // Field-level function - only uses current field value (performance optimization)
   * registry.registerCustomFunction('isEmpty', (ctx) => !ctx.fieldValue, { scope: 'field' });
   * ```
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

  /**
   * Get all custom functions as an object
   */
  getCustomFunctions(): Record<string, CustomFunction> {
    return Object.fromEntries(this.customFunctions);
  }

  /**
   * Clear all custom functions and their scopes
   */
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
   * Derivation functions compute derived values and are called when a
   * `DerivationLogicConfig` references them by `functionName`.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns the derived value
   *
   * @example
   * ```typescript
   * registry.registerDerivationFunction('getCurrencyForCountry', (ctx) => {
   *   const countryToCurrency = { 'USA': 'USD', 'Germany': 'EUR', 'UK': 'GBP' };
   *   return countryToCurrency[ctx.formValue.country] ?? 'USD';
   * });
   * ```
   */
  registerDerivationFunction(name: string, fn: CustomFunction): void {
    this.derivationFunctions.set(name, fn);
  }

  /**
   * Get a derivation function by name
   */
  getDerivationFunction(name: string): CustomFunction | undefined {
    return this.derivationFunctions.get(name);
  }

  /**
   * Get all derivation functions as an object
   */
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

  /**
   * Clear all derivation functions
   */
  clearDerivationFunctions(): void {
    this.derivationFunctions.clear();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Property Derivation Functions
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Register a property derivation function.
   *
   * Property derivation functions compute derived values for field properties
   * (like `minDate`, `options`, `label`) and are called when a
   * `PropertyDerivationLogicConfig` references them by `functionName`.
   *
   * @param name - Unique identifier for the function
   * @param fn - Function that receives EvaluationContext and returns the derived property value
   */
  registerPropertyDerivationFunction(name: string, fn: CustomFunction): void {
    this.propertyDerivationFunctions.set(name, fn);
  }

  /**
   * Get a property derivation function by name
   */
  getPropertyDerivationFunction(name: string): CustomFunction | undefined {
    return this.propertyDerivationFunctions.get(name);
  }

  /**
   * Get all property derivation functions as an object
   */
  getPropertyDerivationFunctions(): Record<string, CustomFunction> {
    return Object.fromEntries(this.propertyDerivationFunctions);
  }

  /**
   * Set property derivation functions from a config object.
   * Only updates functions if their references have changed.
   *
   * @param functions - Object mapping function names to property derivation functions
   */
  setPropertyDerivationFunctions(functions: Record<string, CustomFunction> | undefined): void {
    this.setRegistryIfChanged(this.propertyDerivationFunctions, functions);
  }

  /**
   * Clear all property derivation functions
   */
  clearPropertyDerivationFunctions(): void {
    this.propertyDerivationFunctions.clear();
  }

  /**
   * Register a custom validator using Angular's public FieldContext API
   *
   * Validators receive the full FieldContext, allowing access to:
   * - Current field value: `ctx.value()`
   * - Field state: `ctx.state` (errors, touched, dirty, etc.)
   * - Other field values: `ctx.valueOf(path)` (public API!)
   * - Other field states: `ctx.stateOf(path)`
   * - Parameters from JSON configuration via second argument
   *
   * @param name - Unique identifier for the validator
   * @param fn - Validator function (ctx, params?) => ValidationError | ValidationError[] | null
   *
   * @example Single Field Validation
   * ```typescript
   * registry.registerValidator('noSpaces', (ctx) => {
   *   const value = ctx.value();
   *   if (typeof value === 'string' && value.includes(' ')) {
   *     return { kind: 'noSpaces' };
   *   }
   *   return null;
   * });
   * ```
   *
   * @example Cross-Field Validation (Public API)
   * ```typescript
   * registry.registerValidator('lessThan', (ctx, params) => {
   *   const value = ctx.value();
   *   const compareToPath = params?.field as string;
   *
   *   // Use valueOf() to access other fields - public API!
   *   const otherValue = ctx.valueOf(compareToPath as any);
   *
   *   if (otherValue !== undefined && value >= otherValue) {
   *     return { kind: 'notLessThan' };
   *   }
   *   return null;
   * });
   * ```
   *
   * @example Multiple Errors (Cross-Field Validation)
   * ```typescript
   * registry.registerValidator('validateDateRange', (ctx) => {
   *   const errors: ValidationError[] = [];
   *   const startDate = ctx.valueOf('startDate' as any);
   *   const endDate = ctx.valueOf('endDate' as any);
   *
   *   if (!startDate) errors.push({ kind: 'startDateRequired' });
   *   if (!endDate) errors.push({ kind: 'endDateRequired' });
   *   if (startDate && endDate && startDate > endDate) {
   *     errors.push({ kind: 'invalidDateRange' });
   *   }
   *
   *   return errors.length > 0 ? errors : null;
   * });
   * ```
   */
  registerValidator(name: string, fn: CustomValidator): void {
    this.validators.set(name, fn);
  }

  /**
   * Get a validator by name
   */
  getValidator(name: string): CustomValidator | undefined {
    return this.validators.get(name);
  }

  /**
   * Clear all validators
   */
  clearValidators(): void {
    this.validators.clear();
  }

  /**
   * Register an async validator using Angular's public validateAsync() API
   *
   * Async validators return Observables for asynchronous validation logic.
   * Use for debouncing, database lookups, or complex async business logic.
   *
   * @param name - Unique identifier for the async validator
   * @param fn - Async validator function (ctx, params?) => Observable<ValidationError | ValidationError[] | null>
   *
   * @example Debounced Username Check
   * ```typescript
   * registry.registerAsyncValidator('checkUsernameAvailable', (ctx) => {
   *   const username = ctx.value();
   *   return of(username).pipe(
   *     debounceTime(300),
   *     switchMap(name => userService.checkAvailability(name)),
   *     map(available => available ? null : { kind: 'usernameTaken' })
   *   );
   * });
   * ```
   *
   * @example Async Cross-Field Validation
   * ```typescript
   * registry.registerAsyncValidator('validatePasswordStrength', (ctx) => {
   *   const password = ctx.value();
   *   const email = ctx.valueOf('email' as any);
   *   return passwordService.checkStrength(password, email).pipe(
   *     map(result => result.strong ? null : { kind: 'weakPassword' })
   *   );
   * });
   * ```
   */
  registerAsyncValidator(name: string, fn: AsyncCustomValidator): void {
    this.asyncValidators.set(name, fn);
  }

  /**
   * Get an async validator by name
   */
  getAsyncValidator(name: string): AsyncCustomValidator | undefined {
    return this.asyncValidators.get(name);
  }

  /**
   * Clear all async validators
   */
  clearAsyncValidators(): void {
    this.asyncValidators.clear();
  }

  /**
   * Register an HTTP validator configuration using Angular's public validateHttp() API
   *
   * HTTP validators provide optimized HTTP validation with automatic request cancellation,
   * caching, and debouncing. Preferred over AsyncCustomValidator for HTTP requests.
   *
   * @param name - Unique identifier for the HTTP validator
   * @param config - HTTP validator configuration object
   *
   * @example Username Availability Check
   * ```typescript
   * registry.registerHttpValidator('checkUsername', {
   *   url: (ctx) => `/api/users/check-username?username=${encodeURIComponent(ctx.value())}`,
   *   method: 'GET',
   *   mapResponse: (response, ctx) => {
   *     return response.available ? null : { kind: 'usernameTaken' };
   *   }
   * });
   * ```
   *
   * @example POST Request with Body
   * ```typescript
   * registry.registerHttpValidator('validateAddress', {
   *   url: '/api/validate-address',
   *   method: 'POST',
   *   body: (ctx) => ({
   *     street: ctx.valueOf('street' as any),
   *     city: ctx.valueOf('city' as any),
   *     zipCode: ctx.value()
   *   }),
   *   mapResponse: (response) => {
   *     return response.valid ? null : { kind: 'invalidAddress' };
   *   },
   *   debounceTime: 500
   * });
   * ```
   */
  registerHttpValidator(name: string, config: HttpCustomValidator): void {
    this.httpValidators.set(name, config);
  }

  /**
   * Get an HTTP validator by name
   */
  getHttpValidator(name: string): HttpCustomValidator | undefined {
    return this.httpValidators.get(name);
  }

  /**
   * Clear all HTTP validators
   */
  clearHttpValidators(): void {
    this.httpValidators.clear();
  }

  /**
   * Generic helper to set registry values only if they have changed
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

  /**
   * Clear everything (functions and all validators)
   */
  clearAll(): void {
    this.clearCustomFunctions();
    this.clearDerivationFunctions();
    this.clearPropertyDerivationFunctions();
    this.clearValidators();
    this.clearAsyncValidators();
    this.clearHttpValidators();
  }
}

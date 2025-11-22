import { Schema } from '@angular/forms/signals';
import { InferFormValue, RegisteredFieldTypes } from './types';
import { SchemaDefinition } from './schemas';
import { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../core/validation/validator-types';
import { CustomFunction } from '../core/expressions/custom-function-types';
import { ValidationMessages } from './validation-types';

/**
 * Configuration interface for defining dynamic form structure and behavior.
 *
 * This interface defines the complete form schema including field definitions,
 * validation rules, conditional logic, and submission handling using Angular's
 * signal-based reactive forms.
 *
 * @example
 * ```typescript
 * const formConfig: FormConfig = {
 *   fields: [
 *     { type: 'input', key: 'email', label: 'Email', validation: ['required', 'email'] },
 *     { type: 'group', key: 'address', label: 'Address', fields: [
 *       { type: 'input', key: 'street', label: 'Street' },
 *       { type: 'input', key: 'city', label: 'City' }
 *     ]},
 *     { type: 'button', key: 'submit', label: 'Submit', buttonType: 'submit' }
 *   ],
 *   options: { validateOnChange: true },
 *   schemas: [
 *     { name: 'emailSchema', schema: { email: validators.email } }
 *   ]
 * };
 * ```
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TValue - The strongly-typed interface for form values
 *
 * @public
 */
export interface FormConfig<TFields extends RegisteredFieldTypes[] = RegisteredFieldTypes[], TValue = InferFormValue<TFields>> {
  /**
   * Array of field definitions that define the form structure.
   *
   * Fields are rendered in the order they appear in this array.
   * Supports nested groups and conditional field visibility.
   *
   * @example
   * ```typescript
   * fields: [
   *   { type: 'input', key: 'firstName', label: 'First Name' },
   *   { type: 'group', key: 'address', label: 'Address', fields: [
   *     { type: 'input', key: 'street', label: 'Street' }
   *   ]}
   * ]
   * ```
   */
  fields: TFields;

  /**
   * Optional form-level validation schema.
   *
   * Provides additional validation beyond field-level validation.
   * Useful for cross-field validation rules.
   *
   * @example
   * ```typescript
   * schema: {
   *   passwordConfirm: validators.equals('password')
   * }
   * ```
   */
  schema?: Schema<TValue>;

  /**
   * Global form configuration options.
   *
   * Controls form-wide behavior like validation timing and disabled state.
   *
   * @value {}
   */
  options?: FormOptions;

  /**
   * Global schemas available to all fields.
   *
   * Reusable validation schemas that can be referenced by field definitions.
   * Promotes consistency and reduces duplication.
   *
   * @example
   * ```typescript
   * schemas: [
   *   { name: 'addressSchema', schema: {
   *     street: validators.required,
   *     zipCode: validators.pattern(/^\d{5}$/)
   *   }}
   * ]
   * ```
   */
  schemas?: SchemaDefinition[];

  /**
   * Form-level validation messages that act as fallback for field-level messages.
   *
   * These messages are used when a field has validation errors but no
   * field-level `validationMessages` are defined for that specific error.
   * This allows you to define common validation messages once at the form level
   * instead of repeating them for each field.
   *
   * @example
   * ```typescript
   * defaultValidationMessages: {
   *   required: 'This field is required',
   *   email: 'Please enter a valid email address',
   *   minLength: 'Must be at least {{requiredLength}} characters'
   * }
   * ```
   */
  defaultValidationMessages?: ValidationMessages;

  /**
   * Signal forms adapter configuration.
   */
  customFnConfig?: CustomFnConfig;
}

/**
 * Signal forms adapter configuration for advanced form behavior.
 *
 * Provides configuration options for signal forms integration including
 * legacy migration, custom functions, and custom validators.
 *
 * @example
 * ```typescript
 * customFnConfig: {
 *   customFunctions: {
 *     isAdult: (context) => context.age >= 18,
 *     formatCurrency: (context) => new Intl.NumberFormat('en-US', {
 *       style: 'currency',
 *       currency: 'USD'
 *     }).format(context.value)
 *   },
 *   simpleValidators: {
 *     noSpaces: (value) => {
 *       return typeof value === 'string' && value.includes(' ')
 *         ? { kind: 'noSpaces', message: 'Spaces not allowed' }
 *         : null;
 *     }
 *   },
 *   contextValidators: {
 *     lessThanField: (ctx, params) => {
 *       const value = ctx.value();
 *       const otherField = params?.field as string;
 *       const otherValue = ctx.root()[otherField]?.value();
 *       if (otherValue !== undefined && value >= otherValue) {
 *         return { kind: 'notLessThan', message: `Must be less than ${otherField}` };
 *       }
 *       return null;
 *     }
 *   }
 * }
 * ```
 *
 * @public
 */
export interface CustomFnConfig {
  /**
   * Custom evaluation functions for conditional expressions.
   *
   * Used for: when/readonly/disabled logic
   * Return type: any value (typically boolean)
   *
   * @example
   * ```typescript
   * customFunctions: {
   *   isAdult: (context) => context.age >= 18,
   *   calculateAge: (context) => {
   *     const birthDate = new Date(context.birthDate);
   *     return new Date().getFullYear() - birthDate.getFullYear();
   *   }
   * }
   * ```
   */
  customFunctions?: Record<string, CustomFunction>;

  /**
   * Custom validators using Angular's public FieldContext API
   *
   * (ctx, params?) => ValidationError | ValidationError[] | null
   *
   * Validators receive FieldContext which provides access to:
   * - Current field value: `ctx.value()`
   * - Field state: `ctx.state` (errors, touched, dirty, etc.)
   * - Other field values: `ctx.valueOf(path)` - public API!
   * - Other field states: `ctx.stateOf(path)`
   * - Parameters from JSON configuration
   *
   * **Return Types:**
   * - Single error: `{ kind: 'errorKind' }` for field-level validation
   * - Multiple errors: `[{ kind: 'error1' }, { kind: 'error2' }]` for cross-field validation
   * - No error: `null` when validation passes
   *
   * @example Single Field Validation
   * ```typescript
   * validators: {
   *   noSpaces: (ctx) => {
   *     const value = ctx.value();
   *     if (typeof value === 'string' && value.includes(' ')) {
   *       return { kind: 'noSpaces' };
   *     }
   *     return null;
   *   }
   * }
   * ```
   *
   * @example Cross-Field Validation (Public API)
   * ```typescript
   * validators: {
   *   lessThan: (ctx, params) => {
   *     const value = ctx.value();
   *     const compareToPath = params?.field as string;
   *
   *     // Use valueOf() to access other field - public API!
   *     const otherValue = ctx.valueOf(compareToPath as any);
   *
   *     if (otherValue !== undefined && value >= otherValue) {
   *       return { kind: 'notLessThan' };
   *     }
   *     return null;
   *   }
   * }
   * ```
   *
   * @example Multiple Errors
   * ```typescript
   * validators: {
   *   validateDateRange: (ctx) => {
   *     const errors: ValidationError[] = [];
   *     const startDate = ctx.valueOf('startDate' as any);
   *     const endDate = ctx.valueOf('endDate' as any);
   *
   *     if (!startDate) errors.push({ kind: 'startDateRequired' });
   *     if (!endDate) errors.push({ kind: 'endDateRequired' });
   *     if (startDate && endDate && startDate > endDate) {
   *       errors.push({ kind: 'invalidDateRange' });
   *     }
   *
   *     return errors.length > 0 ? errors : null;
   *   }
   * }
   * ```
   */
  validators?: Record<string, CustomValidator>;

  /**
   * Async custom validators using Angular's resource-based validateAsync() API
   *
   * Angular's validateAsync uses the resource API for async validation.
   * Validators must provide params, factory, onSuccess, and optional onError callbacks.
   *
   * **Structure:**
   * - `params`: Function that computes params from field context
   * - `factory`: Function that creates ResourceRef from params signal
   * - `onSuccess`: Maps resource result to validation errors
   * - `onError`: Optional handler for resource errors
   *
   * **Use Cases:**
   * - Database lookups via services with resource API
   * - Complex async business logic with Angular resources
   *
   * **Note:** For HTTP validation, prefer `httpValidators` which provides
   * a simpler API specifically designed for HTTP requests.
   *
   * @example Database Lookup with Resource
   * ```typescript
   * asyncValidators: {
   *   checkUsernameAvailable: {
   *     params: (ctx) => ({ username: ctx.value() }),
   *     factory: (params) => {
   *       const injector = inject(Injector);
   *       return resource({
   *         request: () => params(),
   *         loader: ({ request }) => {
   *           if (!request?.username) return null;
   *           const service = injector.get(UserService);
   *           return firstValueFrom(service.checkAvailability(request.username));
   *         }
   *       });
   *     },
   *     onSuccess: (result, ctx) => {
   *       if (!result) return null;
   *       return result.available ? null : { kind: 'usernameTaken' };
   *     },
   *     onError: (error, ctx) => {
   *       console.error('Availability check failed:', error);
   *       return null; // Don't block form on network errors
   *     }
   *   }
   * }
   * ```
   */
  asyncValidators?: Record<string, AsyncCustomValidator>;

  /**
   * HTTP validators using Angular's validateHttp() API
   *
   * Angular's validateHttp provides HTTP validation with automatic request
   * cancellation and integration with the resource API.
   *
   * **Structure:**
   * - `request`: Function that returns URL string or HttpResourceRequest
   * - `onSuccess`: REQUIRED - Maps HTTP response to validation errors (inverted logic!)
   * - `onError`: Optional handler for HTTP errors
   *
   * **Benefits:**
   * - Automatic request cancellation when field value changes
   * - Built-in integration with Angular's resource management
   * - Simpler than asyncValidators for HTTP use cases
   *
   * **Important:** `onSuccess` uses inverted logic - it maps SUCCESSFUL HTTP responses
   * to validation errors. For example, if the API returns `{ available: false }`,
   * your `onSuccess` should return `{ kind: 'usernameTaken' }`.
   *
   * @example Username Availability Check (GET)
   * ```typescript
   * httpValidators: {
   *   checkUsername: {
   *     request: (ctx) => {
   *       const username = ctx.value();
   *       if (!username) return undefined; // Skip validation if empty
   *       return `/api/users/check-username?username=${encodeURIComponent(username)}`;
   *     },
   *     onSuccess: (response, ctx) => {
   *       // Inverted logic: successful response may indicate validation failure
   *       return response.available ? null : { kind: 'usernameTaken' };
   *     },
   *     onError: (error, ctx) => {
   *       console.error('Availability check failed:', error);
   *       return null; // Don't block form on network errors
   *     }
   *   }
   * }
   * ```
   *
   * @example Address Validation (POST with Body)
   * ```typescript
   * httpValidators: {
   *   validateAddress: {
   *     request: (ctx) => {
   *       const zipCode = ctx.value();
   *       if (!zipCode) return undefined;
   *
   *       return {
   *         url: '/api/validate-address',
   *         method: 'POST',
   *         body: {
   *           street: ctx.valueOf('street' as any),
   *           city: ctx.valueOf('city' as any),
   *           zipCode: zipCode
   *         },
   *         headers: { 'Content-Type': 'application/json' }
   *       };
   *     },
   *     onSuccess: (response) => {
   *       return response.valid ? null : { kind: 'invalidAddress' };
   *     }
   *   }
   * }
   * ```
   */
  httpValidators?: Record<string, HttpCustomValidator>;
}

/**
 * Global form configuration options.
 *
 * Controls form-wide behavior including validation timing,
 * disabled state, and user interaction handling.
 *
 * @example
 * ```typescript
 * options: {
 *   validateOnChange: true,
 *   validateOnBlur: false,
 *   disabled: false
 * }
 * ```
 *
 * @public
 */
export interface FormOptions {
  /**
   * Enable validation on value change.
   *
   * When enabled, form fields are validated immediately when
   * their values change, providing real-time feedback.
   *
   * @value false
   */
  validateOnChange?: boolean;

  /**
   * Enable validation on field blur.
   *
   * When enabled, form fields are validated when they lose focus,
   * providing validation feedback after user interaction.
   *
   * @value true
   */
  validateOnBlur?: boolean;

  /**
   * Disable the entire form.
   *
   * When enabled, all form fields become read-only and cannot
   * be modified by user interaction.
   *
   * @value false
   */
  disabled?: boolean;
}

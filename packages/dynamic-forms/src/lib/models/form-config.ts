import { Signal } from '@angular/core';
import { InferFormValue } from './types/form-value-inference';
import { NarrowFields, RegisteredFieldTypes } from './registry/field-registry';
import { SchemaDefinition } from './schemas/schema-definition';
import { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../core/validation/validator-types';
import { CustomFunction } from '../core/expressions/custom-function-types';
import { ValidationMessages } from './validation-types';
import { SubmissionConfig } from './submission-config';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Configuration interface for defining dynamic form structure and behavior.
 *
 * This interface defines the complete form schema including field definitions,
 * validation rules, conditional logic, and submission handling using Angular's
 * signal-based reactive forms.
 *
 * @example
 * ```typescript
 * const formConfig = {
 *   fields: [
 *     { type: 'input', key: 'email', value: '', label: 'Email', required: true },
 *     { type: 'group', key: 'address', label: 'Address', fields: [
 *       { type: 'input', key: 'street', value: '', label: 'Street' },
 *       { type: 'input', key: 'city', value: '', label: 'City' }
 *     ]},
 *   ],
 * } as const satisfies FormConfig;
 *
 * // Infer form value type from config
 * type FormValue = InferFormValue<typeof formConfig>;
 * ```
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TValue - The strongly-typed interface for form values
 * @typeParam TProps - The type for form-level default props (library-specific)
 *
 * @public
 */
export interface FormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
  TProps extends object = Record<string, unknown>,
  TSchemaValue = unknown,
> {
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
   * Optional form-level validation schema using Standard Schema spec.
   *
   * Provides additional validation beyond field-level validation.
   * Supports Zod, Valibot, ArkType, and other Standard Schema compliant libraries.
   * Useful for cross-field validation rules.
   *
   * @example
   * ```typescript
   * import { z } from 'zod';
   * import { standardSchema } from '@ng-forge/dynamic-forms/schema';
   *
   * const PasswordSchema = z.object({
   *   password: z.string().min(8),
   *   confirmPassword: z.string(),
   * }).refine(
   *   (data) => data.password === data.confirmPassword,
   *   { message: 'Passwords must match', path: ['confirmPassword'] }
   * );
   *
   * const formConfig = {
   *   fields: [...],
   *   schema: standardSchema(PasswordSchema),
   * } as const satisfies FormConfig;
   * ```
   */
  schema?: FormSchema<TSchemaValue>;

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

  /**
   * Form submission configuration.
   *
   * When provided, enables integration with Angular Signal Forms' native `submit()` function.
   * The submission mechanism is **optional** - you can still handle submission manually
   * via the `(submitted)` output if you prefer.
   *
   * While the submission action is executing, `form().submitting()` will be `true`,
   * which automatically disables submit buttons (unless configured otherwise).
   *
   * Server errors returned from the action will be automatically applied to the
   * corresponding form fields.
   *
   * @example
   * ```typescript
   * const config: FormConfig = {
   *   fields: [...],
   *   submission: {
   *     action: async (form) => {
   *       const value = form().value();
   *       try {
   *         await this.api.submit(value);
   *         return undefined;
   *       } catch (error) {
   *         return [{ field: form.email, error: { kind: 'server', message: 'Email exists' }}];
   *       }
   *     }
   *   }
   * };
   * ```
   */
  submission?: SubmissionConfig<TValue>;

  /**
   * Default props applied to all fields in the form.
   *
   * These props serve as defaults that can be overridden at the field level.
   * Useful for setting consistent styling across the entire form (e.g., appearance,
   * size, or other UI library-specific props).
   *
   * The cascade order is: Library config → Form defaultProps → Field props
   * Each level can override the previous one.
   *
   * @example
   * ```typescript
   * // Material example
   * const config: MatFormConfig = {
   *   defaultProps: {
   *     appearance: 'outline',
   *     subscriptSizing: 'dynamic',
   *   },
   *   fields: [
   *     { type: 'input', key: 'name', label: 'Name' },  // Uses defaultProps
   *     { type: 'input', key: 'email', props: { appearance: 'fill' } },  // Override
   *   ],
   * };
   * ```
   */
  defaultProps?: TProps;

  /**
   * External data signals available to conditional logic and derivations.
   *
   * Provides a way to inject external application state into form expressions.
   * Each property is a Signal that will be unwrapped and made available in the
   * `EvaluationContext` under `externalData`.
   *
   * The signals are read reactively in logic functions (when/readonly/disabled)
   * so changes to the external data will trigger re-evaluation of conditions.
   *
   * @example
   * ```typescript
   * const config: FormConfig = {
   *   externalData: {
   *     userRole: computed(() => this.authService.currentRole()),
   *     permissions: computed(() => this.authService.permissions()),
   *     featureFlags: computed(() => this.featureFlagService.flags()),
   *   },
   *   fields: [
   *     {
   *       type: 'input',
   *       key: 'adminField',
   *       label: 'Admin Only Field',
   *       logic: [{
   *         effect: 'show',
   *         condition: {
   *           type: 'javascript',
   *           expression: "externalData.userRole === 'admin'"
   *         }
   *       }]
   *     },
   *     {
   *       type: 'select',
   *       key: 'advancedOption',
   *       label: 'Advanced Option',
   *       logic: [{
   *         effect: 'show',
   *         condition: {
   *           type: 'javascript',
   *           expression: "externalData.featureFlags.advancedMode === true"
   *         }
   *       }]
   *     }
   *   ]
   * };
   * ```
   */
  externalData?: Record<string, Signal<unknown>>;
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
 *   derivations: {
 *     getCurrencyForCountry: (context) => {
 *       const countryToCurrency: Record<string, string> = {
 *         'USA': 'USD', 'Germany': 'EUR', 'UK': 'GBP'
 *       };
 *       return countryToCurrency[context.formValue.country as string] ?? 'USD';
 *     }
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
   * Custom derivation functions for value derivation logic.
   *
   * These functions compute derived values and are called when a
   * `DerivationLogicConfig` references them by `functionName`.
   *
   * Derivation functions:
   * - Receive an `EvaluationContext` with access to `formValue`
   * - Return the value to set on the target field
   * - Are called reactively when dependencies change
   *
   * Use derivation functions for complex mappings or logic that
   * can't be easily expressed as a JavaScript expression.
   *
   * @example
   * ```typescript
   * derivations: {
   *   // Country to currency mapping
   *   getCurrencyForCountry: (context) => {
   *     const countryToCurrency: Record<string, string> = {
   *       'USA': 'USD',
   *       'Germany': 'EUR',
   *       'France': 'EUR',
   *       'UK': 'GBP',
   *       'Japan': 'JPY'
   *     };
   *     return countryToCurrency[context.formValue.country as string] ?? 'USD';
   *   },
   *
   *   // Complex tax calculation
   *   calculateTax: (context) => {
   *     const subtotal = context.formValue.subtotal as number ?? 0;
   *     const state = context.formValue.state as string;
   *     const taxRates: Record<string, number> = {
   *       'CA': 0.0725, 'NY': 0.08, 'TX': 0.0625
   *     };
   *     return subtotal * (taxRates[state] ?? 0);
   *   },
   *
   *   // Format phone number
   *   formatPhoneNumber: (context) => {
   *     const phone = context.fieldValue as string ?? '';
   *     const digits = phone.replace(/\D/g, '');
   *     if (digits.length === 10) {
   *       return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
   *     }
   *     return phone;
   *   }
   * }
   * ```
   *
   * Field configuration using a derivation function:
   * ```typescript
   * // Derivation is defined on the target field (currency), not the source field (country)
   * {
   *   key: 'currency',
   *   type: 'select',
   *   logic: [
   *     {
   *       type: 'derivation',
   *       functionName: 'getCurrencyForCountry',
   *       dependsOn: ['country']
   *     }
   *   ]
   * }
   * ```
   */
  derivations?: Record<string, CustomFunction>;

  /**
   * Custom property derivation functions for reactive property updates.
   *
   * These functions compute derived values for field properties (like `minDate`,
   * `options`, `label`, `placeholder`) and are called when a
   * `PropertyDerivationLogicConfig` references them by `functionName`.
   *
   * Property derivation functions:
   * - Receive an `EvaluationContext` with access to `formValue`
   * - Return the value to set on the target property
   * - Are called reactively when dependencies change
   *
   * @example
   * ```typescript
   * propertyDerivations: {
   *   getCitiesForCountry: (context) => {
   *     const countryCities: Record<string, Array<{ label: string; value: string }>> = {
   *       'USA': [{ label: 'New York', value: 'ny' }, { label: 'LA', value: 'la' }],
   *       'Germany': [{ label: 'Berlin', value: 'berlin' }, { label: 'Munich', value: 'munich' }],
   *     };
   *     return countryCities[context.formValue.country as string] ?? [];
   *   },
   * }
   * ```
   *
   * Field configuration using a property derivation function:
   * ```typescript
   * {
   *   key: 'city',
   *   type: 'select',
   *   logic: [{
   *     type: 'propertyDerivation',
   *     targetProperty: 'options',
   *     functionName: 'getCitiesForCountry',
   *     dependsOn: ['country']
   *   }]
   * }
   * ```
   */
  propertyDerivations?: Record<string, CustomFunction>;

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
 * Controls form-wide behavior including disabled state
 * and button behavior configuration.
 *
 * @example
 * ```typescript
 * options: {
 *   disabled: false,
 *   submitButton: { disableWhenInvalid: true }
 * }
 * ```
 *
 * @public
 */
export interface FormOptions {
  /**
   * Disable the entire form.
   *
   * When enabled, all form fields become read-only and cannot
   * be modified by user interaction.
   *
   * @value false
   */
  disabled?: boolean;

  /**
   * Maximum number of iterations for derivation chain processing.
   *
   * Derivations can trigger other derivations (e.g., A → B → C).
   * This limit prevents infinite loops in case of circular dependencies
   * that weren't caught at build time.
   *
   * Increase this value if you have legitimate deep derivation chains
   * (more than 10 levels deep).
   *
   * @default 10
   */
  maxDerivationIterations?: number;

  /**
   * Default disabled behavior for submit buttons.
   *
   * Controls when submit buttons are automatically disabled.
   * Can be overridden per-button via the `logic` array on individual button fields.
   *
   * @example
   * ```typescript
   * options: {
   *   submitButton: {
   *     disableWhenInvalid: true,      // Disable when form is invalid
   *     disableWhileSubmitting: true,  // Disable during submission
   *   }
   * }
   * ```
   */
  submitButton?: SubmitButtonOptions;

  /**
   * Default disabled behavior for next page buttons.
   *
   * Controls when next page buttons are automatically disabled in paged forms.
   * Can be overridden per-button via the `logic` array on individual button fields.
   *
   * @example
   * ```typescript
   * options: {
   *   nextButton: {
   *     disableWhenPageInvalid: true,  // Disable when current page is invalid
   *     disableWhileSubmitting: true,  // Disable during submission
   *   }
   * }
   * ```
   */
  nextButton?: NextButtonOptions;

  /**
   * Whether to exclude values of hidden fields from submission output.
   *
   * Overrides the global `withValueExclusionDefaults()` setting for this form.
   * Can be further overridden per-field on individual `FieldDef` entries.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfHidden?: boolean;

  /**
   * Whether to exclude values of disabled fields from submission output.
   *
   * Overrides the global `withValueExclusionDefaults()` setting for this form.
   * Can be further overridden per-field on individual `FieldDef` entries.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfDisabled?: boolean;

  /**
   * Whether to exclude values of readonly fields from submission output.
   *
   * Overrides the global `withValueExclusionDefaults()` setting for this form.
   * Can be further overridden per-field on individual `FieldDef` entries.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfReadonly?: boolean;

  /**
   * Whether to attach the current form value to all events dispatched through the EventBus.
   *
   * This per-form setting overrides the global `withEventFormValue()` feature:
   * - `true` - Enable form value emission for this form (even if globally disabled)
   * - `false` - Disable form value emission for this form (even if globally enabled)
   * - `undefined` - Use global setting (default)
   *
   * When enabled, events will include a `formValue` property with the current form state.
   * Use the `hasFormValue()` type guard to safely access this property.
   *
   * @example
   * ```typescript
   * // Enable for this form only (no global withEventFormValue() needed)
   * const config: FormConfig = {
   *   fields: [...],
   *   options: { emitFormValueOnEvents: true }
   * };
   *
   * // Disable for this form (when globally enabled)
   * const config: FormConfig = {
   *   fields: [...],
   *   options: { emitFormValueOnEvents: false }
   * };
   * ```
   *
   * @default undefined (uses global setting)
   */
  emitFormValueOnEvents?: boolean;
}

/**
 * Options for controlling submit button disabled behavior.
 *
 * @public
 */
export interface SubmitButtonOptions {
  /**
   * Disable submit button when the form is invalid.
   *
   * @default true
   */
  disableWhenInvalid?: boolean;

  /**
   * Disable submit button while the form is submitting.
   *
   * Requires `submission.action` to be configured for automatic detection.
   *
   * @default true
   */
  disableWhileSubmitting?: boolean;
}

/**
 * Options for controlling next page button disabled behavior.
 *
 * @public
 */
export interface NextButtonOptions {
  /**
   * Disable next button when the current page has invalid fields.
   *
   * @default true
   */
  disableWhenPageInvalid?: boolean;

  /**
   * Disable next button while the form is submitting.
   *
   * @default true
   */
  disableWhileSubmitting?: boolean;
}

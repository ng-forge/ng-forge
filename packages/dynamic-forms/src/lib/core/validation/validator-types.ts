import { FieldContext, ValidationError, TreeValidationResult } from '@angular/forms/signals';
import { Signal, ResourceRef } from '@angular/core';

/**
 * Custom validator function signature using Angular's public FieldContext API
 *
 * Takes FieldContext (full Angular context) and optional params, returns validation error(s) or null.
 * Provides access to field state, form hierarchy, and other fields for validation logic.
 *
 * **Use FieldContext public APIs to access:**
 * - Current field value: `ctx.value()`
 * - Field state: `ctx.state` (errors, touched, dirty, etc.)
 * - Other field values: `ctx.valueOf(path)` where path is a FieldPath
 * - Other field states: `ctx.stateOf(path)`
 * - Other fields: `ctx.fieldTreeOf(path)`
 * - Current field tree: `ctx.fieldTree`
 *
 * **Return Types:**
 * - Single error: `{ kind: 'errorKind' }` for field-level validation
 * - Multiple errors: `[{ kind: 'error1' }, { kind: 'error2' }]` for cross-field validation
 * - No error: `null` when validation passes
 *
 * **Best Practice - Return Only Error Kind:**
 * Validators should focus on validation logic, not presentation.
 * Return just the error `kind` and configure messages at field level for i18n support.
 *
 * @example Single Field Validation
 * ```typescript
 * const noSpaces: CustomValidator<string> = (ctx) => {
 *   const value = ctx.value();
 *   if (typeof value === 'string' && value.includes(' ')) {
 *     return { kind: 'noSpaces' };
 *   }
 *   return null;
 * };
 *
 * // Field configuration
 * {
 *   key: 'username',
 *   validators: [{ type: 'custom', functionName: 'noSpaces' }],
 *   validationMessages: {
 *     noSpaces: 'Spaces are not allowed'
 *   }
 * }
 * ```
 *
 * @example Cross-Field Validation with valueOf()
 * ```typescript
 * // Compare two fields using public API
 * const lessThan: CustomValidator<number> = (ctx, params) => {
 *   const value = ctx.value();
 *   const compareToPath = params?.field as string;
 *
 *   // Use valueOf() to access other field - public API!
 *   const otherValue = ctx.valueOf(compareToPath as any);
 *
 *   if (otherValue !== undefined && value >= otherValue) {
 *     return { kind: 'notLessThan' };
 *   }
 *   return null;
 * };
 * ```
 *
 * @example Multiple Errors (Cross-Field Validation)
 * ```typescript
 * const validateDateRange: CustomValidator = (ctx) => {
 *   const errors: ValidationError[] = [];
 *
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
 * };
 * ```
 *
 * **Message Resolution Priority:**
 * 1. Field-level `validationMessages[kind]` (highest priority - per-field customization)
 * 2. Form-level `defaultValidationMessages[kind]` (fallback for common messages)
 * 3. **No message configured = Warning logged + error NOT displayed**
 *
 * **Important:** Validator-returned messages are NOT used. All messages MUST be explicitly configured.
 *
 * @template TValue The type of value stored in the field being validated
 */
export type CustomValidator<TValue = unknown> = (
  ctx: FieldContext<TValue>,
  params?: Record<string, unknown>,
) => ValidationError | ValidationError[] | null;

/**
 * Async custom validator configuration using Angular's resource-based API
 *
 * Angular's validateAsync uses the resource API for async validation,
 * which provides better integration with Signal Forms lifecycle management.
 *
 * **Structure:**
 * - `params`: Function that computes params from field context
 * - `factory`: Function that creates a ResourceRef from params signal
 * - `onSuccess`: Maps successful resource result to validation errors
 * - `onError`: Optional handler for resource errors (network failures, etc.)
 *
 * **Use Cases:**
 * - Database lookups via services with resource API
 * - Complex async business logic with Angular resources
 * - Any async operation using Angular's resource pattern
 *
 * **Note:** For HTTP validation, prefer `HttpCustomValidator` which provides
 * a simpler API specifically designed for HTTP requests.
 *
 * @example Database Lookup with Resource
 * ```typescript
 * const checkUsernameAvailable: AsyncCustomValidator<string> = {
 *   params: (ctx) => ({ username: ctx.value() }),
 *   factory: (params) => {
 *     const injector = inject(Injector);
 *     return resource({
 *       request: () => params(),
 *       loader: ({ request }) => {
 *         if (!request?.username) return null;
 *         const service = injector.get(UserService);
 *         return firstValueFrom(service.checkAvailability(request.username));
 *       }
 *     });
 *   },
 *   onSuccess: (result, ctx) => {
 *     if (!result) return null;
 *     return result.available ? null : { kind: 'usernameTaken' };
 *   },
 *   onError: (error, ctx) => {
 *     console.error('Availability check failed:', error);
 *     return null; // Don't block form on network errors
 *   }
 * };
 * ```
 *
 * @template TValue The type of value stored in the field being validated
 * @template TParams The type of params passed to the resource
 * @template TResult The type of result returned by the resource
 */
export interface AsyncCustomValidator<TValue = unknown, TParams = unknown, TResult = unknown> {
  /**
   * Function that receives field context and returns resource params.
   * Params will be tracked as a signal and trigger resource reload when changed.
   */
  readonly params: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => TParams;

  /**
   * Function that creates a ResourceRef from the params signal.
   * The resource will be automatically managed by Angular's lifecycle.
   */
  readonly factory: (params: Signal<TParams | undefined>) => ResourceRef<TResult | undefined>;

  /**
   * Optional function to map successful resource result to validation errors.
   * Return null if validation passes, or ValidationError/ValidationError[] if validation fails.
   */
  readonly onSuccess?: (result: TResult, ctx: FieldContext<TValue>) => TreeValidationResult;

  /**
   * Optional error handler for resource errors (network failures, etc.).
   * Return null to ignore the error, or ValidationError to display it to the user.
   */
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

/**
 * HTTP request configuration for validateHttp API
 */
export interface HttpResourceRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string | string[]>;
}

/**
 * HTTP-based validator configuration for Angular's validateHttp API
 *
 * Angular's validateHttp provides optimized HTTP validation with automatic
 * request cancellation and integration with the resource API.
 *
 * **Benefits:**
 * - Automatic request cancellation when field value changes
 * - Built-in integration with Angular's resource management
 * - Simpler than AsyncCustomValidator for HTTP use cases
 *
 * **Structure:**
 * - `request`: Function that returns URL string or HttpResourceRequest
 * - `onSuccess`: REQUIRED - Maps HTTP response to validation errors (inverted logic!)
 * - `onError`: Optional handler for HTTP errors (network failures, 4xx/5xx)
 *
 * **Important:** `onSuccess` uses inverted logic - it maps SUCCESSFUL HTTP responses
 * to validation errors. For example, if the API returns `{ available: false }`,
 * your `onSuccess` should return `{ kind: 'usernameTaken' }`.
 *
 * @example Username Availability Check (GET)
 * ```typescript
 * const checkUsername: HttpCustomValidator<string> = {
 *   request: (ctx) => {
 *     const username = ctx.value();
 *     if (!username) return undefined; // Skip validation if empty
 *     return `/api/users/check-username?username=${encodeURIComponent(username)}`;
 *   },
 *   onSuccess: (response, ctx) => {
 *     // Inverted logic: successful response may indicate validation failure
 *     return response.available ? null : { kind: 'usernameTaken' };
 *   },
 *   onError: (error, ctx) => {
 *     console.error('Availability check failed:', error);
 *     return null; // Don't block form on network errors
 *   }
 * };
 * ```
 *
 * @example Address Validation (POST with Body)
 * ```typescript
 * const validateAddress: HttpCustomValidator = {
 *   request: (ctx) => {
 *     const zipCode = ctx.value();
 *     if (!zipCode) return undefined;
 *
 *     return {
 *       url: '/api/validate-address',
 *       method: 'POST',
 *       body: {
 *         street: ctx.valueOf('street' as any),
 *         city: ctx.valueOf('city' as any),
 *         zipCode: zipCode
 *       },
 *       headers: { 'Content-Type': 'application/json' }
 *     };
 *   },
 *   onSuccess: (response) => {
 *     return response.valid ? null : { kind: 'invalidAddress' };
 *   }
 * };
 * ```
 *
 * @template TValue The type of value stored in the field being validated
 * @template TResult The type of HTTP response
 */
export interface HttpCustomValidator<TValue = unknown, TResult = unknown> {
  /**
   * Function that returns the HTTP request configuration.
   * Can return:
   * - `undefined` to skip validation (e.g., if field is empty)
   * - `string` for simple GET requests (just the URL)
   * - `HttpResourceRequest` for full control (method, body, headers)
   */
  readonly request: (ctx: FieldContext<TValue>, config?: Record<string, unknown>) => string | HttpResourceRequest | undefined;

  /**
   * REQUIRED function to map successful HTTP response to validation errors.
   *
   * **Inverted Logic:** This is called on successful HTTP responses.
   * Return null if validation passes, or ValidationError/ValidationError[] if validation fails.
   *
   * Example: API returns `{ available: false }` → return `{ kind: 'usernameTaken' }`
   */
  readonly onSuccess: (result: TResult, ctx: FieldContext<TValue>) => TreeValidationResult;

  /**
   * Optional error handler for HTTP errors (network failures, 4xx/5xx status codes).
   * Return null to ignore the error, or ValidationError to display it to the user.
   *
   * Common pattern: Log the error and return null to avoid blocking form submission
   * on network issues.
   */
  readonly onError?: (error: unknown, ctx: FieldContext<TValue>) => ValidationError | ValidationError[] | null;
}

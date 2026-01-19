import { Injector, runInInjectionContext, signal, StaticProvider, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from '../../src/lib/models/field-signal-context.token';
import { FieldSignalContext } from '../../src/lib/mappers/types';
import { FormOptions } from '../../src/lib/models/form-config';
import { ValidationMessages } from '../../src/lib/models/validation-types';

/**
 * Configuration for creating a test form injector with field signal context
 */
export interface TestFieldContextConfig<TModel extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Parent injector to use. If not provided, uses an empty injector.
   */
  parentInjector?: Injector;

  /**
   * Initial value for the form. If not provided, uses an empty object.
   */
  initialValue?: Partial<TModel>;

  /**
   * Default values function. If not provided, returns the initial value.
   */
  defaultValues?: () => TModel;

  /**
   * Default validation messages for the form.
   * Provided via DEFAULT_VALIDATION_MESSAGES injection token.
   */
  defaultValidationMessages?: ValidationMessages;

  /**
   * Form options for button disabled state defaults.
   * Provided via FORM_OPTIONS injection token.
   */
  formOptions?: FormOptions;

  /**
   * Custom value signal. If provided, this will be used instead of creating a new one.
   */
  valueSignal?: WritableSignal<Partial<TModel> | undefined>;

  /**
   * Custom form instance. If provided, this will be used instead of creating a new one.
   */
  form?: ReturnType<typeof form<TModel>>;
}

/**
 * Creates a test injector with FIELD_SIGNAL_CONTEXT provided.
 *
 * This utility simplifies testing of mappers and components that inject FIELD_SIGNAL_CONTEXT.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const testInjector = createTestFormInjector();
 *
 * // With custom initial value
 * const testInjector = createTestFormInjector({
 *   initialValue: { username: 'test' }
 * });
 *
 * // With validation messages
 * const testInjector = createTestFormInjector({
 *   defaultValidationMessages: { required: 'This field is required' }
 * });
 * ```
 */
export function createTestFormInjector<TModel extends Record<string, unknown> = Record<string, unknown>>(
  config: TestFieldContextConfig<TModel> = {},
): Injector {
  const {
    parentInjector,
    initialValue = {} as Partial<TModel>,
    defaultValues = () => initialValue as TModel,
    defaultValidationMessages,
    formOptions,
    valueSignal,
    form: customForm,
  } = config;

  // Create value signal
  const value = valueSignal ?? signal<Partial<TModel> | undefined>(initialValue);

  // Create form instance in injection context
  let formInstance: ReturnType<typeof form<TModel>>;
  if (customForm) {
    formInstance = customForm;
  } else {
    const tempInjector = parentInjector || Injector.create({ providers: [] });
    formInstance = runInInjectionContext(tempInjector, () => form(value)) as ReturnType<typeof form<TModel>>;
  }

  // Create field signal context (form-level config now provided via dedicated tokens)
  const fieldSignalContext: FieldSignalContext<TModel> = {
    injector: parentInjector || Injector.create({ providers: [] }),
    value,
    defaultValues,
    form: formInstance,
  };

  // Build providers array with all tokens
  const providers: StaticProvider[] = [{ provide: FIELD_SIGNAL_CONTEXT, useValue: fieldSignalContext }];

  if (defaultValidationMessages !== undefined) {
    providers.push({ provide: DEFAULT_VALIDATION_MESSAGES, useValue: defaultValidationMessages });
  }

  if (formOptions !== undefined) {
    providers.push({ provide: FORM_OPTIONS, useValue: formOptions });
  }

  // Create injector with context and tokens
  return Injector.create({
    parent: parentInjector,
    providers,
  });
}

/**
 * Runs a mapper function in a test injection context.
 *
 * This is a convenience wrapper that creates a test injector and runs the mapper
 * function within it, returning the result.
 *
 * @example
 * ```typescript
 * // Test a mapper without context overrides
 * const bindings = testMapper(() => mapValueField(fieldDef));
 *
 * // Test a mapper with custom context
 * const bindings = testMapper(
 *   () => mapValueField(fieldDef),
 *   { initialValue: { username: 'test' } }
 * );
 *
 * // Test a mapper with validation messages
 * const bindings = testMapper(
 *   () => mapValueField(fieldDef),
 *   { defaultValidationMessages: { required: 'Required field' } }
 * );
 * ```
 */
export function testMapper<T>(mapperFn: () => T, context?: TestFieldContextConfig<Record<string, unknown>>): T {
  const testInjector = createTestFormInjector(context);
  return runInInjectionContext(testInjector, mapperFn);
}

/**
 * Creates a field signal context for testing without creating an injector.
 *
 * Useful when you need to manually provide the context or test context creation logic.
 *
 * @example
 * ```typescript
 * const context = createTestFieldContext({
 *   initialValue: { name: 'test' }
 * });
 *
 * // Use in your own injector
 * const injector = Injector.create({
 *   providers: [
 *     { provide: FIELD_SIGNAL_CONTEXT, useValue: context }
 *   ]
 * });
 * ```
 */
export function createTestFieldContext<TModel extends Record<string, unknown> = Record<string, unknown>>(
  config: TestFieldContextConfig<TModel> = {},
): FieldSignalContext<TModel> {
  const {
    parentInjector,
    initialValue = {} as Partial<TModel>,
    defaultValues = () => initialValue as TModel,
    valueSignal,
    form: customForm,
  } = config;

  const injector = parentInjector || Injector.create({ providers: [] });
  const value = valueSignal ?? signal<Partial<TModel> | undefined>(initialValue);

  let formInstance: ReturnType<typeof form<TModel>>;
  if (customForm) {
    formInstance = customForm;
  } else {
    formInstance = runInInjectionContext(injector, () => form(value)) as ReturnType<typeof form<TModel>>;
  }

  // Note: defaultValidationMessages and formOptions are no longer in FieldSignalContext
  // They should be provided via their respective injection tokens
  return {
    injector,
    value,
    defaultValues,
    form: formInstance,
  };
}

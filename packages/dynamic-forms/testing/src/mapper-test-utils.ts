import { Injector, runInInjectionContext, signal, StaticProvider, WritableSignal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { DEFAULT_VALIDATION_MESSAGES, FIELD_SIGNAL_CONTEXT, FORM_OPTIONS } from '@ng-forge/dynamic-forms/internal';
import { FieldSignalContext } from '@ng-forge/dynamic-forms/internal';
import { FormOptions } from '@ng-forge/dynamic-forms/internal';
import { ValidationMessages } from '@ng-forge/dynamic-forms/internal';

/** Configuration for creating a test form injector with field signal context */
export interface TestFieldContextConfig<TModel extends Record<string, unknown> = Record<string, unknown>> {
  /** Parent injector to use. If not provided, uses an empty injector. */
  parentInjector?: Injector;

  /** Initial value for the form. If not provided, uses an empty object. */
  initialValue?: Partial<TModel>;

  /** Default values function. If not provided, returns the initial value. */
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

  /** Custom value signal. If provided, this will be used instead of creating a new one. */
  valueSignal?: WritableSignal<Partial<TModel> | undefined>;

  /** Custom form instance. If provided, this will be used instead of creating a new one. */
  form?: ReturnType<typeof form<TModel>>;
}

/** Creates a test injector with FIELD_SIGNAL_CONTEXT provided. */
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

/** Runs a mapper function in a test injection context. */
export function testMapper<T>(mapperFn: () => T, context?: TestFieldContextConfig<Record<string, unknown>>): T {
  const testInjector = createTestFormInjector(context);
  return runInInjectionContext(testInjector, mapperFn);
}

/** Creates a field signal context for testing without creating an injector. */
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

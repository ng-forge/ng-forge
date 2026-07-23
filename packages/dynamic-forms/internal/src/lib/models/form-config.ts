import { Signal } from '@angular/core';
import { InferFormValue } from './types/form-value-inference';
import { NarrowFields, RegisteredFieldTypes } from './registry/field-registry';
import { SchemaDefinition } from './schemas/schema-definition';
import { AsyncCustomValidator, CustomValidator, HttpCustomValidator } from '../core/validation/validator-types';
import { CustomFunction } from '../core/expressions/custom-function-types';
import type { AsyncConditionFunction, AsyncDerivationFunction } from '../core/expressions/async-custom-function-types';
import { ValidationMessages } from './validation-types';
import { SubmissionConfig } from './submission-config';
import { WrapperConfig } from './wrapper-type';
import type { FormSchema } from '@ng-forge/dynamic-forms/schema';

/**
 * Configuration interface for defining dynamic form structure and behavior.
 *
 * @typeParam TFields - Array of registered field types available for this form
 * @typeParam TValue - The strongly-typed interface for form values
 * @typeParam TProps - The type for form-level default props (library-specific)
 */
export interface FormConfig<
  TFields extends NarrowFields | RegisteredFieldTypes[] = RegisteredFieldTypes[],
  TValue = InferFormValue<TFields extends readonly RegisteredFieldTypes[] ? TFields : RegisteredFieldTypes[]>,
  TProps extends object = Record<string, unknown>,
  TSchemaValue = unknown,
> {
  /** Array of field definitions that define the form structure. */
  fields: TFields;

  /** Optional form-level validation schema using Standard Schema spec. */
  schema?: FormSchema<TSchemaValue>;

  /**
   * Global form configuration options.
   *
   * @value {}
   */
  options?: FormOptions;

  /** Global schemas available to all fields. */
  schemas?: SchemaDefinition[];

  /** Form-level validation messages that act as fallback for field-level messages. */
  defaultValidationMessages?: ValidationMessages;

  /** Signal forms adapter configuration. */
  customFnConfig?: CustomFnConfig<TValue extends Record<string, unknown> ? TValue : Record<string, unknown>>;

  /** Form submission configuration. */
  submission?: SubmissionConfig<TValue>;

  /** Default props applied to all fields in the form. */
  defaultProps?: TProps;

  /** External data signals available to conditional logic and derivations. */
  externalData?: Record<string, Signal<unknown>>;

  /** Form-wide default wrappers applied to every field that does not explicitly opt out. */
  defaultWrappers?: readonly WrapperConfig[];
}

/** Signal forms adapter configuration for advanced form behavior. */
export interface CustomFnConfig<TFormValue extends Record<string, unknown> = Record<string, unknown>> {
  /** Custom evaluation functions for conditional expressions. */
  customFunctions?: Record<string, CustomFunction<TFormValue>>;

  /** Custom derivation functions for value derivation logic. */
  derivations?: Record<string, CustomFunction<TFormValue>>;

  /** Async derivation functions for asynchronous value derivation logic. */
  asyncDerivations?: Record<string, AsyncDerivationFunction<TFormValue>>;

  /** Async condition functions for asynchronous field state logic. */
  asyncConditions?: Record<string, AsyncConditionFunction<TFormValue>>;

  /** Custom validators using Angular's public FieldContext API */
  validators?: Record<string, CustomValidator>;

  /** Async custom validators using Angular's resource-based validateAsync() API */
  asyncValidators?: Record<string, AsyncCustomValidator>;

  /** HTTP validators using Angular's validateHttp() API. */
  httpValidators?: Record<string, HttpCustomValidator>;
}

/** Global form configuration options. */
export interface FormOptions {
  /**
   * Disable the entire form.
   *
   * @value false
   */
  disabled?: boolean;

  /**
   * Prefix scoping every field's DOM `id` (and matching `for` / `data-testid` /
   * `aria-describedby`) to this form instance, as the outermost id segment:
   * `{idPrefix}_{group}_{key}_{index}`. Use it when rendering multiple forms
   * from the same config on one page so their ids don't collide.
   *
   * When omitted, a lone form stays unprefixed and a generated prefix (`df-1`,
   * `df-2`, …) is applied automatically once a second form is mounted. Characters
   * invalid in an id token (whitespace, punctuation) are replaced with `_`.
   *
   * @example
   * ```typescript
   * options: { idPrefix: 'billing' } // → id="billing_email-input"
   * ```
   *
   * @default undefined (auto-prefix only when multiple forms are mounted)
   */
  idPrefix?: string;

  /**
   * Maximum number of iterations for derivation chain processing.
   *
   * @default 10
   */
  maxDerivationIterations?: number;

  /** Default disabled behavior for submit buttons. */
  submitButton?: SubmitButtonOptions;

  /** Default disabled behavior for next page buttons. */
  nextButton?: NextButtonOptions;

  /**
   * For paged forms: how many pages on each side of the current page are eagerly
   * mounted (the "preload window"). Pages outside the window render a lightweight
   * placeholder and mount when navigation brings them into range.
   *
   * `0` mounts only the current page; `1` mounts ±1 for flicker-free sequential
   * navigation; higher values pre-warm more pages for jump navigation at the cost
   * of more initial DOM + change detection.
   *
   * Overrides the global `withPagePreload(n)` default for this form.
   *
   * @default undefined (uses global setting, which defaults to `1`)
   */
  pagePreloadWindow?: number;

  /**
   * Whether to exclude values of hidden fields from submission output.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfHidden?: boolean;

  /**
   * Whether to exclude values of disabled fields from submission output.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfDisabled?: boolean;

  /**
   * Whether to exclude values of readonly fields from submission output.
   *
   * @default undefined (uses global setting)
   */
  excludeValueIfReadonly?: boolean;

  /**
   * Whether to run validation when a field is hidden.
   *
   * @default undefined (uses global setting, which defaults to `false`)
   */
  validateWhenHidden?: boolean;

  /**
   * Whether to attach the current form value to all events dispatched through the EventBus.
   *
   * @default undefined (uses global setting)
   */
  emitFormValueOnEvents?: boolean;
}

/** Options for controlling submit button disabled behavior. */
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
   * @default true
   */
  disableWhileSubmitting?: boolean;
}

/** Options for controlling next page button disabled behavior. */
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

import { z } from 'zod';

/**
 * Schema for submit button options.
 */
export const SubmitButtonOptionsSchema = z.object({
  /**
   * Whether to disable the submit button when the form is invalid.
   * Defaults to true.
   */
  disableWhenInvalid: z.boolean().optional(),

  /**
   * Whether to disable the submit button while the form is submitting.
   * Defaults to true.
   */
  disableWhileSubmitting: z.boolean().optional(),
});

/**
 * Schema for next button options (multi-page forms).
 */
export const NextButtonOptionsSchema = z.object({
  /**
   * Whether to disable the next button when the current page is invalid.
   * Defaults to true.
   */
  disableWhenPageInvalid: z.boolean().optional(),

  /**
   * Whether to disable the next button while the form is submitting.
   * Defaults to true.
   */
  disableWhileSubmitting: z.boolean().optional(),
});

/**
 * Schema for form options. Mirrors the `FormOptions` interface in
 * `@ng-forge/dynamic-forms`.
 */
export const FormOptionsSchema = z.object({
  /**
   * Whether the entire form is disabled.
   */
  disabled: z.boolean().optional(),

  /**
   * Maximum number of derivation iterations before stopping.
   * Prevents infinite loops in circular derivations.
   * Defaults to 10.
   */
  maxDerivationIterations: z.number().positive().optional(),

  /**
   * Options for the submit button behavior.
   */
  submitButton: SubmitButtonOptionsSchema.optional(),

  /**
   * Options for the next button behavior (multi-page forms).
   */
  nextButton: NextButtonOptionsSchema.optional(),

  /**
   * Whether to exclude values of hidden fields from submission output.
   * Overrides the global withValueExclusionDefaults() setting for this form.
   */
  excludeValueIfHidden: z.boolean().optional(),

  /**
   * Whether to exclude values of disabled fields from submission output.
   * Overrides the global withValueExclusionDefaults() setting for this form.
   */
  excludeValueIfDisabled: z.boolean().optional(),

  /**
   * Whether to exclude values of readonly fields from submission output.
   * Overrides the global withValueExclusionDefaults() setting for this form.
   */
  excludeValueIfReadonly: z.boolean().optional(),

  /**
   * Whether to run validation while a field is hidden.
   * Acts as the root inherited value for the form. Per-field
   * validateWhenHidden overrides cascade through the field tree.
   */
  validateWhenHidden: z.boolean().optional(),
});

export type FormOptionsSchemaType = z.infer<typeof FormOptionsSchema>;

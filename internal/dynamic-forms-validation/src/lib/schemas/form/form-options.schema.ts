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
 * Schema for WebMCP tool options (experimental).
 */
export const WebMcpToolOptionsSchema = z.object({
  /**
   * Base name for this form's tools, registered as `fill_{name}` and
   * `submit_{name}`. Must be unique across every form mounted on the page.
   */
  name: z.string().min(1),

  /**
   * What this form is for, and when an agent should reach for it.
   */
  description: z.string().min(1),

  /**
   * Whether an agent may submit this form directly. Off by default; without it
   * the agent can fill the form but a human presses the button.
   */
  allowSubmit: z.boolean().optional(),
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

  /**
   * Exposes this form to browser AI agents as WebMCP tools (experimental).
   * Requires the `withWebMcp()` feature on `provideDynamicForm(...)`.
   */
  webMcp: WebMcpToolOptionsSchema.optional(),
});

export type FormOptionsSchemaType = z.infer<typeof FormOptionsSchema>;

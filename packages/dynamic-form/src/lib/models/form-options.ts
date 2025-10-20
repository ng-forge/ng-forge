/**
 * Dynamic form configuration options
 */
export interface FormOptions {
  /** Show validation errors */
  showError?: boolean;
  
  /** Validation strategy */
  validationStrategy?: ValidationStrategy;
  
  /** Update model on field change */
  updateOn?: 'change' | 'blur' | 'submit';
  
  /** Additional CSS classes for the form */
  formClassName?: string;
  
  /** Custom error messages */
  errorMessages?: Record<string, string | ((error: unknown, field: unknown) => string)>;
  
  /** Reset form on submit */
  resetOnSubmit?: boolean;
  
  /** Disable form during submission */
  disableOnSubmit?: boolean;
}

/**
 * Validation display strategy
 */
export type ValidationStrategy = 
  | 'onTouched'   // Show errors only after field is touched
  | 'onDirty'     // Show errors only after field is modified
  | 'onSubmit'    // Show errors only after form submission
  | 'always';     // Always show errors

/**
 * Form state
 */
export interface FormState {
  /** Is form submitting */
  submitting: boolean;
  
  /** Form has been submitted */
  submitted: boolean;
  
  /** Form is valid */
  valid: boolean;
  
  /** Form is dirty (has changes) */
  dirty: boolean;
  
  /** Form is touched */
  touched: boolean;
}

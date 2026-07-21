import { FormStateCondition } from '../../models/logic/logic-config';

/** Accessors for the form/page state a {@link FormStateCondition} depends on. */
export interface FormStateAccessors {
  /** Whether the root form is currently valid. */
  formValid(): boolean;
  /** Whether the root form is currently submitting. */
  formSubmitting(): boolean;
  /** Whether the current page is valid (paged forms only). Absent → `pageInvalid` is false. */
  currentPageValid?: () => boolean;
}

/**
 * Shared evaluator for form-state conditions (`formInvalid` / `formSubmitting` / `pageInvalid`),
 * used by both the leaf (Signal Forms schema) and non-field logic paths so the two agree.
 */
export function evaluateFormStateCondition(condition: FormStateCondition, state: FormStateAccessors): boolean {
  switch (condition) {
    case 'formInvalid':
      return !state.formValid();
    case 'formSubmitting':
      return state.formSubmitting();
    case 'pageInvalid':
      return state.currentPageValid ? !state.currentPageValid() : false;
    default:
      return false;
  }
}

// Public API - builder functions for creating button fields
export { submitButton, nextPageButton, previousPageButton, actionButton } from './prime-button.function';

// Public API - types for type safety
export type {
  PrimeButtonProps,
  PrimeButtonField,
  PrimeSubmitButtonField,
  PrimeNextButtonField,
  PrimePreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './prime-button.type';

// Public API - component
export { default as PrimeButtonFieldComponent } from './prime-button.component';

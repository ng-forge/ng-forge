// Public API - builder functions for creating button fields
export { submitButton, nextPageButton, previousPageButton, actionButton } from './ionic-button.function';

// Public API - types for type safety
export type {
  IonicButtonProps,
  IonicButtonField,
  IonicSubmitButtonField,
  IonicNextButtonField,
  IonicPreviousButtonField,
  AddArrayItemButtonField,
  RemoveArrayItemButtonField,
} from './ionic-button.type';

// Public API - component
export { default as IonicButtonFieldComponent } from './ionic-button.component';

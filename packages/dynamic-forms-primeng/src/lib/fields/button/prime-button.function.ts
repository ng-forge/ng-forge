import { PrimeButtonField, PrimeNextButtonField, PrimePreviousButtonField, PrimeSubmitButtonField } from './prime-button.type';
import { FormEvent } from '@ng-forge/dynamic-forms';

/**
 * Generic action button factory - for custom buttons with specific events
 * For standard submit/next/previous buttons, use the specific functions below
 */
export function actionButton<T extends FormEvent>(options: Omit<PrimeButtonField<T>, 'type'>): PrimeButtonField<T> {
  return {
    type: 'button',
    key: options.key,
    label: options.label,
    disabled: options.disabled || false,
    className: options.className,
    props: options.props,
    event: options.event,
  };
}

/**
 * Creates a submit button with preconfigured SubmitEvent
 * Automatically disabled when the form is invalid
 * @param options Button configuration (event is preconfigured)
 */
export function submitButton(options: Omit<PrimeSubmitButtonField, 'type' | 'event'>): PrimeSubmitButtonField {
  return {
    type: 'submit',
    key: options.key,
    label: options.label,
    disabled: options.disabled,
    className: options.className,
    props: options.props,
  };
}

/**
 * Creates a next page button with preconfigured NextPageEvent
 * @param options Button configuration (event is preconfigured)
 */
export function nextPageButton(options: Omit<PrimeNextButtonField, 'type' | 'event'>): PrimeNextButtonField {
  return {
    type: 'next',
    key: options.key,
    label: options.label,
    disabled: options.disabled,
    className: options.className,
    props: options.props,
  };
}

/**
 * Creates a previous page button with preconfigured PreviousPageEvent
 * @param options Button configuration (event is preconfigured)
 */
export function previousPageButton(options: Omit<PrimePreviousButtonField, 'type' | 'event'>): PrimePreviousButtonField {
  return {
    type: 'previous',
    key: options.key,
    label: options.label,
    disabled: options.disabled,
    className: options.className,
    props: options.props,
  };
}

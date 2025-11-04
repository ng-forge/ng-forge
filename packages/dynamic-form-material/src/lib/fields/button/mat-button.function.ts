import { MatButtonField, MatSubmitButtonField, MatNextButtonField, MatPreviousButtonField } from './mat-button.type';
import { FormEvent, NextPageEvent, PreviousPageEvent, SubmitEvent } from '@ng-forge/dynamic-form';

/**
 * Generic action button factory - for custom buttons with specific events
 * For standard submit/next/previous buttons, use the specific functions below
 */
export function actionButton<T extends FormEvent>(options: Omit<MatButtonField<T>, 'type'>): MatButtonField<T> {
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
export function submitButton(options: Omit<MatSubmitButtonField, 'type' | 'event'>): MatSubmitButtonField {
  return {
    type: 'submit-button',
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
export function nextPageButton(options: Omit<MatNextButtonField, 'type' | 'event'>): MatNextButtonField {
  return {
    type: 'next-button',
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
export function previousPageButton(options: Omit<MatPreviousButtonField, 'type' | 'event'>): MatPreviousButtonField {
  return {
    type: 'previous-button',
    key: options.key,
    label: options.label,
    disabled: options.disabled,
    className: options.className,
    props: options.props,
  };
}

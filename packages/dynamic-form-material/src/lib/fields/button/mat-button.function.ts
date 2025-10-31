import { MatButtonField } from './mat-button.type';
import { FormEvent, NextPageEvent, PreviousPageEvent, SubmitEvent } from '@ng-forge/dynamic-form';

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

export function submitButton(options: Omit<MatButtonField<SubmitEvent>, 'type' | 'event'>): MatButtonField<SubmitEvent> {
  return actionButton({ ...options, event: SubmitEvent });
}

export function nextPageButton(options: Omit<MatButtonField<NextPageEvent>, 'type' | 'event'>): MatButtonField<NextPageEvent> {
  return actionButton({ ...options, event: NextPageEvent });
}

export function previousPageButton(options: Omit<MatButtonField<PreviousPageEvent>, 'type' | 'event'>): MatButtonField<PreviousPageEvent> {
  return actionButton({ ...options, event: PreviousPageEvent });
}

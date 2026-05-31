import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Event dispatched when the form should be reset to its default values. */
export class FormResetEvent implements FormEvent {
  readonly type = 'form-reset' as const;
}

import { FormEvent } from '@ng-forge/dynamic-forms/internal';

export class FormSubmitEvent implements FormEvent {
  readonly type = 'submit' as const;
}

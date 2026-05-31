import { FormEvent } from '@ng-forge/dynamic-forms/internal';

export class SubmitEvent implements FormEvent {
  readonly type = 'submit' as const;
}

import { FormEvent } from '../interfaces/form-event';

export class ComponentInitializedEvent implements FormEvent {
  readonly type = 'component-initialized' as const;

  constructor(
    public componentType: 'dynamic-forms' | 'page' | 'row' | 'group',
    public componentId: string,
  ) {}
}

import { FormEvent } from '../interfaces/form-event';

export class ComponentInitializedEvent implements FormEvent {
  readonly type = 'component-initialized' as const;

  constructor(
    public componentType: 'dynamic-form' | 'page' | 'row' | 'group' | 'array',
    public componentId: string,
  ) {}
}

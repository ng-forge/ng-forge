import { FormEvent } from '@ng-forge/dynamic-forms/internal';

/** Emitted after the active page and all of its visible fields have rendered. */
export class ActivePageInitializedEvent implements FormEvent {
  readonly type = 'active-page-initialized' as const;

  constructor(
    public readonly pageIndex: number,
    public readonly pageKey: string,
  ) {}
}

import { describe, expect, it } from 'vitest';
import type { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { collectInitializingContainerKeys } from './container-utils';

describe('collectInitializingContainerKeys', () => {
  it('uses group-scoped identities for containers with the same local key', () => {
    const fields = [
      {
        key: 'billing',
        type: 'group',
        fields: [{ key: 'details', type: 'group', fields: [{ key: 'name', type: 'input' }] }],
      },
      {
        key: 'shipping',
        type: 'group',
        fields: [{ key: 'details', type: 'group', fields: [{ key: 'name', type: 'input' }] }],
      },
    ] as FieldDef<unknown>[];

    expect(collectInitializingContainerKeys(fields)).toEqual([
      'group:billing',
      'group:billing.details',
      'group:shipping',
      'group:shipping.details',
    ]);
  });

  it('does not expect initialization events from statically hidden subtrees', () => {
    const fields = [
      {
        key: 'hidden',
        type: 'group',
        hidden: true,
        fields: [{ key: 'nested', type: 'group', fields: [] }],
      },
      { key: 'visible', type: 'group', fields: [] },
    ] as FieldDef<unknown>[];

    expect(collectInitializingContainerKeys(fields)).toEqual(['group:visible']);
  });

  it('tracks rows using the container identity emitted by ContainerFieldComponent', () => {
    const fields = [
      {
        key: 'nameRow',
        type: 'row',
        fields: [{ key: 'name', type: 'input' }],
      },
    ] as FieldDef<unknown>[];

    expect(collectInitializingContainerKeys(fields)).toEqual(['container:nameRow']);
  });
});

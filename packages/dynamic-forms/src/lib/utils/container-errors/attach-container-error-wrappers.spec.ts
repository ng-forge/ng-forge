import { describe, expect, it } from 'vitest';
import { FieldDef } from '@ng-forge/dynamic-forms/internal';
import { attachContainerErrorWrappers } from './attach-container-error-wrappers';

/** Wrapper configs on a field, typed loosely for assertions. */
function wrappersOf(field: FieldDef<unknown> | undefined): { type: string; validationMessages?: Record<string, unknown> }[] {
  return ((field as { wrappers?: unknown[] } | undefined)?.wrappers ?? []) as {
    type: string;
    validationMessages?: Record<string, unknown>;
  }[];
}

describe('attachContainerErrorWrappers', () => {
  it('should append the container-errors wrapper to a group that declares validators', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'period',
        type: 'group',
        fields: [{ key: 'dateFrom', type: 'input' }],
        validators: [{ type: 'custom', functionName: 'dateOrder' }],
      } as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);

    expect(wrappersOf(result[0]).map((w) => w.type)).toEqual(['container-errors']);
  });

  it('should append the container-errors wrapper to an array that declares validators', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'periods',
        type: 'array',
        fields: [[{ key: 'from', type: 'input' }]],
        validators: [{ type: 'custom', functionName: 'periodOrder' }],
      } as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);

    expect(wrappersOf(result[0]).map((w) => w.type)).toEqual(['container-errors']);
  });

  it('should forward validationMessages onto the wrapper config', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'period',
        type: 'group',
        fields: [],
        validators: [{ type: 'custom', functionName: 'dateOrder' }],
        validationMessages: { dateOrder: 'The end must not be before the start.' },
      } as unknown as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);

    expect(wrappersOf(result[0])[0].validationMessages).toEqual({ dateOrder: 'The end must not be before the start.' });
  });

  it('should keep the container-errors wrapper innermost so it renders inside existing wrappers', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'period',
        type: 'group',
        fields: [],
        wrappers: [{ type: 'css', cssClasses: 'card' }],
        validators: [{ type: 'custom', functionName: 'dateOrder' }],
      } as unknown as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);

    expect(wrappersOf(result[0]).map((w) => w.type)).toEqual(['css', 'container-errors']);
  });

  it('should leave a container without validators untouched', () => {
    const group = { key: 'period', type: 'group', fields: [{ key: 'dateFrom', type: 'input' }] } as FieldDef<unknown>;

    const result = attachContainerErrorWrappers([group]);

    expect(result[0]).toBe(group);
  });

  it('should leave a leaf field with validators untouched', () => {
    const leaf = {
      key: 'email',
      type: 'input',
      validators: [{ type: 'custom', functionName: 'x' }],
    } as FieldDef<unknown>;

    const result = attachContainerErrorWrappers([leaf]);

    expect(result[0]).toBe(leaf);
  });

  it('should reach a group nested inside another container', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'outer',
        type: 'group',
        fields: [
          {
            key: 'period',
            type: 'group',
            fields: [],
            validators: [{ type: 'custom', functionName: 'dateOrder' }],
          },
        ],
      } as unknown as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);
    const nested = (result[0] as unknown as { fields: FieldDef<unknown>[] }).fields[0];

    expect(wrappersOf(nested).map((w) => w.type)).toEqual(['container-errors']);
  });

  it('should reach a group nested inside an array item template', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'rows',
        type: 'array',
        fields: [
          [
            {
              key: 'period',
              type: 'group',
              fields: [],
              validators: [{ type: 'custom', functionName: 'dateOrder' }],
            },
          ],
        ],
      } as unknown as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(fields);
    const item = (result[0] as unknown as { fields: FieldDef<unknown>[][] }).fields[0];

    expect(wrappersOf(item[0]).map((w) => w.type)).toEqual(['container-errors']);
  });

  it('should not attach twice when run over an already-normalized config', () => {
    const fields: FieldDef<unknown>[] = [
      {
        key: 'period',
        type: 'group',
        fields: [],
        validators: [{ type: 'custom', functionName: 'dateOrder' }],
      } as unknown as FieldDef<unknown>,
    ];

    const result = attachContainerErrorWrappers(attachContainerErrorWrappers(fields));

    expect(wrappersOf(result[0]).map((w) => w.type)).toEqual(['container-errors']);
  });

  it('should leave the input array untouched', () => {
    const group = {
      key: 'period',
      type: 'group',
      fields: [],
      validators: [{ type: 'custom', functionName: 'dateOrder' }],
    } as unknown as FieldDef<unknown>;

    attachContainerErrorWrappers([group]);

    expect((group as { wrappers?: unknown }).wrappers).toBeUndefined();
  });
});

/**
 * Pins the nullable-restriction contract at the type level: container and checked
 * fields must NOT accept `nullable`. If a future refactor moves `nullable` into
 * `FieldDef` (or a shared base), these `@ts-expect-error` assertions will stop
 * failing and break CI — drawing attention to the semantic expansion.
 *
 * Containers defer nullable because their "null" semantics are ambiguous
 * (see rationale in the PR for #341).
 * Checked fields defer because tri-state boolean requires UX design.
 */
import { expectTypeOf } from 'vitest';
import type { GroupField } from './default/group-field';
import type { ArrayField } from './default/array-field';
import type { PageField } from './default/page-field';
import type { RowField } from './default/row-field';

describe('Nullable restriction — containers', () => {
  it('GroupField must not accept a `nullable` property', () => {
    // @ts-expect-error - nullable is intentionally unavailable on GroupField
    const _group: GroupField = { key: 'g', type: 'group', fields: [], nullable: true };
    expectTypeOf(_group).not.toBeAny();
  });

  it('ArrayField must not accept a `nullable` property', () => {
    // @ts-expect-error - nullable is intentionally unavailable on ArrayField
    const _arr: ArrayField = { key: 'a', type: 'array', fields: [], nullable: true };
    expectTypeOf(_arr).not.toBeAny();
  });

  it('PageField must not accept a `nullable` property', () => {
    // @ts-expect-error - nullable is intentionally unavailable on PageField
    const _page: PageField = { key: 'p', type: 'page', fields: [], nullable: true };
    expectTypeOf(_page).not.toBeAny();
  });

  it('RowField must not accept a `nullable` property', () => {
    // @ts-expect-error - nullable is intentionally unavailable on RowField
    const _row: RowField = { key: 'r', type: 'row', fields: [], nullable: true };
    expectTypeOf(_row).not.toBeAny();
  });
});

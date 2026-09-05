import { describe, expect, it, vi } from 'vitest';
import { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { buildFieldPlan, PlanNode, PlanWarn, ScalarPlan } from './field-plan';
import { setNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';

/**
 * The plan carries more than the tool schema does: the schema drops every field
 * an agent may not write, so a policy, an option label or a constraint on a
 * withheld field is only observable here.
 */
const registry = new Map<string, FieldTypeDefinition>([
  ['input', { name: 'input', scope: ['text-input', 'numeric'] }],
  ['select', { name: 'select', scope: 'single-select' }],
  ['multiselect', { name: 'multiselect', scope: 'multi-select' }],
  ['checkbox', { name: 'checkbox', scope: 'boolean' }],
  ['datepicker', { name: 'datepicker', scope: 'date' }],
  ['slider', { name: 'slider', scope: 'numeric' }],
  ['hidden', { name: 'hidden', valueHandling: 'include' }],
  ['button', { name: 'button', valueHandling: 'exclude' }],
  ['row', { name: 'row', valueHandling: 'flatten' }],
  ['group', { name: 'group', valueHandling: 'include' }],
  ['array', { name: 'array', valueHandling: 'include' }],
  // Declares a scope pair that is not the text-input/numeric one, so the
  // disambiguation branch has to fall through to the first entry.
  ['exotic', { name: 'exotic', scope: ['boolean', 'date'] }],
]);

const plan = (fields: unknown[], warn?: PlanWarn) => buildFieldPlan(fields as FieldDef<unknown>[], registry, warn);
const first = (fields: unknown[]) => plan(fields)[0];
const scalar = (fields: unknown[]) => first(fields) as ScalarPlan;

describe('buildFieldPlan', () => {
  describe('exposure policy', () => {
    it('lets an ordinary field be both read and written', () => {
      expect(first([{ key: 'a', type: 'input' }]).policy).toEqual({ readable: true, writable: true });
    });

    it('treats `webMcp: false` as hiding the field from agents entirely', () => {
      expect(first([{ key: 'a', type: 'input', webMcp: false }]).policy).toEqual({ readable: false, writable: false });
    });

    it('withholds a password from reading but still allows writing it', () => {
      // An agent signing a user up has to set a password; it has no business
      // reading one back.
      expect(first([{ key: 'a', type: 'input', props: { type: 'password' } }]).policy).toEqual({
        readable: false,
        writable: true,
      });
    });

    it('closes a hidden field type on both axes', () => {
      expect(first([{ key: 'a', type: 'hidden' }]).policy).toEqual({ readable: false, writable: false });
    });

    it('makes a statically readonly field readable but not writable', () => {
      expect(first([{ key: 'a', type: 'input', readonly: true }]).policy).toEqual({ readable: true, writable: false });
    });

    it('makes a field readonly by logic rule not writable either', () => {
      const policy = first([{ key: 'a', type: 'input', logic: [{ type: 'readonly' }] }]).policy;

      expect(policy).toEqual({ readable: true, writable: false });
    });

    it('makes a field derived by logic rule not writable', () => {
      const policy = first([{ key: 'a', type: 'input', logic: [{ type: 'derivation' }] }]).policy;

      expect(policy).toEqual({ readable: true, writable: false });
    });

    it('ignores unrelated logic rules', () => {
      const policy = first([{ key: 'a', type: 'input', logic: [{ type: 'hidden' }, { type: 'required' }] }]).policy;

      expect(policy).toEqual({ readable: true, writable: true });
    });

    it('lets an explicit policy re-open a field the defaults would have closed', () => {
      const policy = first([{ key: 'a', type: 'input', readonly: true, webMcp: { writable: true } }]).policy;

      expect(policy).toEqual({ readable: true, writable: true });
    });

    it('lets an explicit policy close a field the defaults would have opened', () => {
      expect(first([{ key: 'a', type: 'input', webMcp: { readable: false } }]).policy).toEqual({
        readable: false,
        writable: true,
      });
    });
  });

  describe('options', () => {
    it('carries each option label as the title an agent reads', () => {
      const node = scalar([
        {
          key: 'plan',
          type: 'select',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Pro', value: 'pro' },
          ],
        },
      ]);

      expect(node.options).toEqual([
        { value: 'free', title: 'Free' },
        { value: 'pro', title: 'Pro' },
      ]);
    });

    it('leaves the title off an option whose label is not a literal string', () => {
      const node = scalar([{ key: 'plan', type: 'select', options: [{ label: { expression: 'x' }, value: 'free' }] }]);

      expect(node.options).toEqual([{ value: 'free' }]);
    });

    it('drops a disabled option, which an agent could not select anyway', () => {
      const node = scalar([{ key: 'plan', type: 'select', options: [{ value: 'free' }, { value: 'legacy', disabled: true }] }]);

      expect(node.options).toEqual([{ value: 'free' }]);
    });

    it('falls back to a plain scalar when every option is disabled', () => {
      const node = scalar([{ key: 'plan', type: 'select', value: 'free', options: [{ value: 'legacy', disabled: true }] }]);

      expect(node.options).toBeUndefined();
      expect(node.types).toEqual(['string']);
    });

    it('marks a multi-select as multiple and does not widen its item type with null', () => {
      const node = scalar([{ key: 'tags', type: 'multiselect', nullable: true, options: [{ value: 'a' }] }]);

      expect(node.multiple).toBe(true);
      expect(node.types).toEqual(['string']);
    });
  });

  describe('scalar types', () => {
    it('describes a date-scoped field as a string with a date format', () => {
      const node = scalar([{ key: 'due', type: 'datepicker' }]);

      expect(node.types).toEqual(['string']);
      expect(node.constraints.format).toBe('date');
    });

    it('widens a nullable date field with null', () => {
      expect(scalar([{ key: 'due', type: 'datepicker', nullable: true }]).types).toEqual(['string', 'null']);
    });

    it('lets an explicit email rule win over the date format default', () => {
      const node = scalar([{ key: 'due', type: 'datepicker', email: true }]);

      expect(node.constraints.format).toBe('email');
    });

    it('takes the first scope of a pair it cannot disambiguate', () => {
      expect(scalar([{ key: 'a', type: 'exotic' }]).types).toEqual(['boolean']);
    });

    it('infers a boolean from the declared default of an unregistered type', () => {
      expect(scalar([{ key: 'a', type: 'mystery', value: true }]).types).toEqual(['boolean']);
    });

    it('falls back to string when an unregistered type has a null default', () => {
      expect(scalar([{ key: 'a', type: 'mystery', value: null }]).types).toEqual(['string']);
    });

    it('records a null default rather than dropping it', () => {
      expect(scalar([{ key: 'a', type: 'input', nullable: true, value: null }]).default).toBeNull();
    });

    it('drops a default that is not a JSON primitive', () => {
      expect(scalar([{ key: 'a', type: 'input', value: { nested: true } }]).default).toBeUndefined();
    });

    it('drops a non-finite numeric default', () => {
      expect(scalar([{ key: 'a', type: 'slider', value: Number.NaN }]).default).toBeUndefined();
    });
  });

  describe('constraints', () => {
    it('reads the shorthand rules', () => {
      const node = scalar([{ key: 'a', type: 'input', minLength: 2, maxLength: 8, min: 1, max: 9, pattern: '^x$' }]);

      expect(node.constraints).toEqual({ minLength: 2, maxLength: 8, minimum: 1, maximum: 9, pattern: '^x$' });
    });

    it('does not read a list length as a string length', () => {
      // `minLength` on an array field bounds the number of items, not characters.
      const node = plan([{ key: 'tags', type: 'array', minLength: 1, maxLength: 5, fields: [{ key: 't', type: 'input' }] }])[0];

      expect(node).toMatchObject({ kind: 'array', minItems: 1, maxItems: 5 });
    });

    it('carries the field’s validation messages onto the node', () => {
      const messages = { required: 'Needed' };
      expect(first([{ key: 'a', type: 'input', validationMessages: messages }]).messages).toBe(messages);
    });
  });

  describe('paths', () => {
    it('gives a top-level field its key as its path', () => {
      expect(first([{ key: 'a', type: 'input' }]).path).toBe('a');
    });

    it('dots a group’s children onto the group path', () => {
      const group = first([{ key: 'person', type: 'group', fields: [{ key: 'first', type: 'input' }] }]);

      expect((group as { children: PlanNode[] }).children[0].path).toBe('person.first');
    });

    it('keeps a flattened container’s children at the parent level', () => {
      const nodes = plan([{ type: 'row', fields: [{ key: 'a', type: 'input' }] }]);

      expect(nodes.map((node) => node.path)).toEqual(['a']);
    });

    it('marks array item paths as belonging to the template', () => {
      const node = plan([{ key: 'lines', type: 'array', fields: [[{ key: 'sku', type: 'input' }]] }])[0];

      expect((node as { item: { children: PlanNode[] } }).item.children[0].path).toBe('lines[].sku');
    });
  });

  describe('array item shape', () => {
    it('accepts items that differ only by their prefilled value', () => {
      const node = plan([
        {
          key: 'tags',
          type: 'array',
          fields: [
            { key: 't', type: 'input', value: 'one' },
            { key: 't', type: 'input', value: 'two' },
          ],
        },
      ])[0];

      expect(node).toMatchObject({ kind: 'array', item: { kind: 'value' } });
    });

    it('rejects items whose groups differ, not just their leaves', () => {
      const warn = vi.fn();
      const node = plan(
        [
          {
            key: 'rows',
            type: 'array',
            fields: [
              [{ key: 'g', type: 'group', fields: [{ key: 'a', type: 'input' }] }],
              [{ key: 'g', type: 'group', fields: [{ key: 'a', type: 'checkbox' }] }],
            ],
          },
        ],
        warn,
      )[0];

      expect((node as { item: unknown }).item).toBeUndefined();
      expect(warn).toHaveBeenCalledOnce();
    });

    it('accepts items whose nested arrays match', () => {
      const item = [{ key: 'inner', type: 'array', fields: [{ key: 'v', type: 'input' }] }];
      const node = plan([{ key: 'rows', type: 'array', fields: [item, item] }])[0];

      expect((node as { item: unknown }).item).toBeDefined();
    });

    it('rejects items of different arities', () => {
      const warn = vi.fn();
      const node = plan(
        [
          {
            key: 'rows',
            type: 'array',
            fields: [
              [{ key: 'a', type: 'input' }],
              [
                { key: 'a', type: 'input' },
                { key: 'b', type: 'input' },
              ],
            ],
          },
        ],
        warn,
      )[0];

      expect((node as { item: unknown }).item).toBeUndefined();
    });

    it('prefers the normalized template over the items that happen to exist', () => {
      const field = { key: 'tags', type: 'array', fields: [] } as unknown as FieldDef<unknown>;
      setNormalizedArrayMetadata(field as unknown as Record<string, unknown>, {
        template: { key: 't', type: 'checkbox' } as never,
      });

      const node = plan([field])[0] as { item: { kind: string; value: ScalarPlan } };

      expect(node.item.kind).toBe('value');
      expect(node.item.value.types).toEqual(['boolean']);
    });

    it('leaves the item shape undefined when there is nothing to derive it from', () => {
      expect(plan([{ key: 'tags', type: 'array', fields: [] }])[0]).toMatchObject({ kind: 'array', item: undefined });
    });

    it('leaves the item shape undefined for a primitive item that is not a scalar', () => {
      // A group as a bare (non-array-wrapped) item has no scalar value to carry.
      const node = plan([{ key: 'rows', type: 'array', fields: [{ key: 'g', type: 'group', fields: [{ key: 'a', type: 'input' }] }] }])[0];

      expect((node as { item: unknown }).item).toBeUndefined();
    });
  });

  describe('what it skips', () => {
    it('skips a field type whose value handling excludes it', () => {
      expect(plan([{ key: 'go', type: 'button' }])).toEqual([]);
    });

    it('skips a value-bearing field with no key', () => {
      expect(plan([{ type: 'input' }])).toEqual([]);
    });

    it('skips a flatten container with no children', () => {
      expect(plan([{ type: 'row' }])).toEqual([]);
    });

    it('treats a group with no fields as an empty object rather than dropping it', () => {
      expect(plan([{ key: 'g', type: 'group' }])).toMatchObject([{ kind: 'group', children: [] }]);
    });

    it('ignores a label that is not a literal string', () => {
      expect(first([{ key: 'a', type: 'input', label: { expression: 'x' } }]).label).toBeUndefined();
    });

    it('ignores an empty-string label', () => {
      expect(first([{ key: 'a', type: 'input', label: '' }]).label).toBeUndefined();
    });
  });
});

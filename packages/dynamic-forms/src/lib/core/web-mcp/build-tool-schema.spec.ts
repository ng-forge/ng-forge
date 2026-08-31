import { describe, expect, it, vi } from 'vitest';
import { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { buildToolSchema } from './build-tool-schema';
import { buildFieldPlan, PlanWarn } from './field-plan';
import { setNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';

/**
 * Minimal registry standing in for an adapter's field config. Mirrors the
 * `scope` / `valueHandling` axes every adapter declares (see
 * `material-field-config.ts`) so these tests stay adapter-agnostic.
 */
const registry = new Map<string, FieldTypeDefinition>([
  ['input', { name: 'input', scope: ['text-input', 'numeric'] }],
  ['textarea', { name: 'textarea', scope: 'text-input' }],
  ['select', { name: 'select', scope: 'single-select' }],
  ['multiselect', { name: 'multiselect', scope: 'multi-select' }],
  ['checkbox', { name: 'checkbox', scope: 'boolean' }],
  ['datepicker', { name: 'datepicker', scope: 'date' }],
  ['slider', { name: 'slider', scope: 'numeric' }],
  ['button', { name: 'button', valueHandling: 'exclude' }],
  ['text', { name: 'text', valueHandling: 'exclude' }],
  ['hidden', { name: 'hidden', valueHandling: 'include' }],
  ['row', { name: 'row', valueHandling: 'flatten' }],
  ['page', { name: 'page', valueHandling: 'flatten' }],
  ['group', { name: 'group', valueHandling: 'include' }],
  ['array', { name: 'array', valueHandling: 'include' }],
]);

const build = (fields: FieldDef<unknown>[], warn?: PlanWarn) => buildToolSchema(buildFieldPlan(fields, registry, warn));

describe('buildToolSchema', () => {
  describe('scalar types', () => {
    it('maps a text-input field to a string property', () => {
      const schema = build([{ key: 'name', type: 'input' } as FieldDef<unknown>]);

      expect(schema).toEqual({
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false,
      });
    });

    it('maps a boolean-scoped field to a boolean property', () => {
      const schema = build([{ key: 'agree', type: 'checkbox' } as FieldDef<unknown>]);

      expect(schema.properties?.['agree']).toEqual({ type: 'boolean' });
    });

    it('maps a numeric-scoped field to a number property', () => {
      const schema = build([{ key: 'amount', type: 'slider' } as FieldDef<unknown>]);

      expect(schema.properties?.['amount']).toEqual({ type: 'number' });
    });

    it('resolves the ambiguous text-input/numeric scope via props.type', () => {
      const schema = build([
        { key: 'label', type: 'input' } as FieldDef<unknown>,
        { key: 'qty', type: 'input', props: { type: 'number' } } as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['label']).toEqual({ type: 'string' });
      expect(schema.properties?.['qty']).toEqual({ type: 'number' });
    });

    it('maps a date-scoped field to a string with a date format hint', () => {
      const schema = build([{ key: 'due', type: 'datepicker' } as FieldDef<unknown>]);

      expect(schema.properties?.['due']).toEqual({ type: 'string', format: 'date' });
    });
  });

  describe('patch semantics', () => {
    it('emits no required list, since any subset is a valid call', () => {
      const schema = build([
        { key: 'a', type: 'input', required: true } as unknown as FieldDef<unknown>,
        { key: 'b', type: 'input', validators: [{ type: 'required' }] } as unknown as FieldDef<unknown>,
      ]);

      expect(schema).not.toHaveProperty('required');
    });

    it('emits no required list inside a nested group either', () => {
      const schema = build([
        {
          key: 'address',
          type: 'group',
          fields: [{ key: 'street', type: 'input', required: true }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['address']).not.toHaveProperty('required');
    });
  });

  describe('nullable', () => {
    it('widens a nullable field to a multi-type including null', () => {
      const schema = build([{ key: 'nickname', type: 'input', nullable: true } as FieldDef<unknown>]);

      expect(schema.properties?.['nickname']).toEqual({ type: ['string', 'null'] });
    });

    it('widens a nullable select alongside its enum', () => {
      const schema = build([
        {
          key: 'status',
          type: 'select',
          nullable: true,
          options: [{ value: 'draft' }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['status']).toEqual({ type: ['string', 'null'], enum: ['draft', null] });
    });
  });

  describe('options', () => {
    it('emits an enum plus titled anyOf branches for a single-select field', () => {
      const schema = build([
        {
          key: 'plan',
          type: 'select',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Pro (billed yearly)', value: 'pro' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['plan']).toEqual({
        type: 'string',
        enum: ['free', 'pro'],
        anyOf: [
          { const: 'free', title: 'Free' },
          { const: 'pro', title: 'Pro (billed yearly)' },
        ],
      });
    });

    it('omits disabled options entirely — an agent cannot select them', () => {
      const schema = build([
        {
          key: 'plan',
          type: 'select',
          options: [
            { label: 'Free', value: 'free' },
            { label: 'Legacy', value: 'legacy', disabled: true },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['plan']).toMatchObject({ enum: ['free'] });
    });

    it('skips anyOf when no option carries a static label', () => {
      const schema = build([
        { key: 'plan', type: 'select', options: [{ value: 'free' }, { value: 'pro' }] } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['plan']).toEqual({ type: 'string', enum: ['free', 'pro'] });
    });

    it('emits an array of enum values for a multi-select field', () => {
      const schema = build([
        {
          key: 'tags',
          type: 'multiselect',
          options: [
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['tags']).toEqual({
        type: 'array',
        items: {
          type: 'string',
          enum: ['a', 'b'],
          anyOf: [
            { const: 'a', title: 'A' },
            { const: 'b', title: 'B' },
          ],
        },
      });
    });

    it('infers a numeric enum type from numeric option values', () => {
      const schema = build([
        {
          key: 'rating',
          type: 'select',
          options: [{ value: 1 }, { value: 2 }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['rating']).toEqual({ type: 'number', enum: [1, 2] });
    });
  });

  describe('annotations', () => {
    it('carries the field-level placeholder as the description', () => {
      const schema = build([
        {
          key: 'email',
          type: 'input',
          label: 'Email address',
          value: 'a@b.com',
          placeholder: 'you@example.com',
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['email']).toEqual({
        type: 'string',
        title: 'Email address',
        description: 'you@example.com',
        default: 'a@b.com',
      });
    });

    it('falls back to props.placeholder, then props.hint', () => {
      const fromProps = build([{ key: 'a', type: 'input', props: { placeholder: 'p' } } as unknown as FieldDef<unknown>]);
      const fromHint = build([{ key: 'a', type: 'input', props: { hint: 'h' } } as unknown as FieldDef<unknown>]);

      expect(fromProps.properties?.['a']).toMatchObject({ description: 'p' });
      expect(fromHint.properties?.['a']).toMatchObject({ description: 'h' });
    });

    it('ignores non-string dynamic label/placeholder expressions', () => {
      const schema = build([
        {
          key: 'email',
          type: 'input',
          label: { expression: 'formValue.x' },
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['email']).toEqual({ type: 'string' });
    });
  });

  describe('shorthand validators become constraints', () => {
    it('maps the shorthand length and pattern rules onto a string property', () => {
      const schema = build([
        {
          key: 'code',
          type: 'input',
          minLength: 2,
          maxLength: 8,
          pattern: '^[a-z]+$',
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['code']).toEqual({
        type: 'string',
        minLength: 2,
        maxLength: 8,
        pattern: '^[a-z]+$',
      });
    });

    it('maps shorthand min/max onto a number property', () => {
      const schema = build([{ key: 'age', type: 'input', props: { type: 'number' }, min: 18, max: 99 } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['age']).toEqual({ type: 'number', minimum: 18, maximum: 99 });
    });

    it('maps the shorthand email rule onto a format hint', () => {
      const schema = build([{ key: 'email', type: 'input', email: true } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['email']).toEqual({ type: 'string', format: 'email' });
    });

    it('serialises a shorthand RegExp pattern to its source', () => {
      const schema = build([{ key: 'code', type: 'input', pattern: /^\d+$/ } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['code']).toEqual({ type: 'string', pattern: '^\\d+$' });
    });
  });

  describe('advanced validators become constraints', () => {
    it('maps length and pattern validators onto a string property', () => {
      const schema = build([
        {
          key: 'code',
          type: 'input',
          validators: [
            { type: 'minLength', value: 2 },
            { type: 'maxLength', value: 8 },
            { type: 'pattern', value: '^[a-z]+$' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['code']).toEqual({
        type: 'string',
        minLength: 2,
        maxLength: 8,
        pattern: '^[a-z]+$',
      });
    });

    it('lets an explicit validator override the shorthand', () => {
      const schema = build([
        { key: 'code', type: 'input', minLength: 2, validators: [{ type: 'minLength', value: 5 }] } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['code']).toMatchObject({ minLength: 5 });
    });

    it('omits conditional validators — they are dynamic, not structural', () => {
      const schema = build([
        {
          key: 'a',
          type: 'input',
          validators: [
            { type: 'required', when: { expression: 'formValue.b' } },
            { type: 'minLength', value: 3, when: { expression: 'formValue.b' } },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['a']).toEqual({ type: 'string' });
    });

    it('omits expression-driven validator values', () => {
      const schema = build([
        {
          key: 'a',
          type: 'input',
          validators: [{ type: 'minLength', expression: 'formValue.limit' }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['a']).toEqual({ type: 'string' });
    });
  });

  describe('exposure policy', () => {
    it('omits a field an agent may not write', () => {
      const schema = build([
        { key: 'a', type: 'input' } as FieldDef<unknown>,
        { key: 'locked', type: 'input', webMcp: { writable: false } } as unknown as FieldDef<unknown>,
      ]);

      expect(Object.keys(schema.properties ?? {})).toEqual(['a']);
    });

    it('omits a hidden field type by default', () => {
      const schema = build([{ key: 'correlationId', type: 'hidden' } as unknown as FieldDef<unknown>]);

      expect(schema.properties).toEqual({});
    });

    it('omits a readonly or derived field by default', () => {
      const schema = build([
        { key: 'ro', type: 'input', readonly: true } as unknown as FieldDef<unknown>,
        { key: 'derived', type: 'input', derivation: 'formValue.a' } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties).toEqual({});
    });

    it('still offers a password field for writing — only reading it back is off', () => {
      const schema = build([{ key: 'password', type: 'input', props: { type: 'password' } } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['password']).toEqual({ type: 'string' });
    });
  });

  describe('containers', () => {
    it('omits fields whose type has exclude value handling', () => {
      const schema = build([
        { key: 'a', type: 'input' } as FieldDef<unknown>,
        { key: 'go', type: 'button' } as FieldDef<unknown>,
        { type: 'text', label: 'hi' } as unknown as FieldDef<unknown>,
      ]);

      expect(Object.keys(schema.properties ?? {})).toEqual(['a']);
    });

    it('flattens row and page containers into the parent object', () => {
      const schema = build([
        {
          type: 'page',
          fields: [
            {
              type: 'row',
              fields: [
                { key: 'a', type: 'input' },
                { key: 'b', type: 'checkbox' },
              ],
            },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties).toEqual({ a: { type: 'string' }, b: { type: 'boolean' } });
    });

    it('nests a group as its own object', () => {
      const schema = build([
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input', required: true },
            { key: 'zip', type: 'input' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['address']).toEqual({
        type: 'object',
        properties: { street: { type: 'string' }, zip: { type: 'string' } },
        additionalProperties: false,
      });
    });
  });

  describe('arrays', () => {
    it('emits items for a homogeneous primitive array', () => {
      const schema = build([{ key: 'tags', type: 'array', fields: [{ key: 'tag', type: 'input' }] } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['tags']).toEqual({ type: 'array', items: { type: 'string' } });
    });

    it('emits items for a homogeneous object array', () => {
      const schema = build([
        {
          key: 'lines',
          type: 'array',
          fields: [
            [
              { key: 'sku', type: 'input' },
              { key: 'qty', type: 'input', props: { type: 'number' } },
            ],
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['lines']).toEqual({
        type: 'array',
        items: {
          type: 'object',
          properties: { sku: { type: 'string' }, qty: { type: 'number' } },
          additionalProperties: false,
        },
      });
    });

    it('describes an empty array from its normalized template', () => {
      const field = { key: 'tags', type: 'array', fields: [] } as unknown as FieldDef<unknown>;
      setNormalizedArrayMetadata(field as unknown as Record<string, unknown>, {
        template: { key: 'tag', type: 'input' } as never,
      });

      const schema = build([field]);

      expect(schema.properties?.['tags']).toEqual({ type: 'array', items: { type: 'string' } });
    });

    it('describes an empty object array from its normalized template', () => {
      const field = { key: 'lines', type: 'array', fields: [] } as unknown as FieldDef<unknown>;
      setNormalizedArrayMetadata(field as unknown as Record<string, unknown>, {
        template: [
          { key: 'sku', type: 'input' },
          { key: 'remove', type: 'button' },
        ] as never,
      });

      const schema = build([field]);

      expect(schema.properties?.['lines']).toEqual({
        type: 'array',
        items: { type: 'object', properties: { sku: { type: 'string' } }, additionalProperties: false },
      });
    });

    it('carries array minLength/maxLength onto the array property', () => {
      const schema = build([
        {
          key: 'tags',
          type: 'array',
          minLength: 1,
          maxLength: 5,
          fields: [{ key: 'tag', type: 'input' }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['tags']).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 5,
      });
    });

    it('treats items differing only by their default value as homogeneous', () => {
      const schema = build([
        {
          key: 'tags',
          type: 'array',
          fields: [
            { key: 'tag', type: 'input', value: 'first' },
            { key: 'tag', type: 'input', value: 'second' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['tags']).toMatchObject({ type: 'array', items: { type: 'string' } });
    });

    it('omits a heterogeneous array and warns — tuples are not expressible', () => {
      const warn = vi.fn();
      const schema = build(
        [
          {
            key: 'mixed',
            type: 'array',
            fields: [
              { key: 'a', type: 'input' },
              { key: 'b', type: 'checkbox' },
            ],
          } as unknown as FieldDef<unknown>,
          { key: 'keep', type: 'input' } as FieldDef<unknown>,
        ],
        warn,
      );

      expect(Object.keys(schema.properties ?? {})).toEqual(['keep']);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0][0]).toContain('mixed');
    });

    it('omits an array with neither items nor a template', () => {
      const schema = build([{ key: 'empty', type: 'array', fields: [] } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['empty']).toBeUndefined();
    });
  });

  describe('keyless and unknown fields', () => {
    it('skips a value-bearing field with no key', () => {
      const schema = build([{ type: 'input' } as FieldDef<unknown>]);

      expect(schema.properties).toEqual({});
    });

    it('falls back to string for a field type with no registry scope', () => {
      const schema = build([{ key: 'mystery', type: 'custom-thing' } as FieldDef<unknown>]);

      expect(schema.properties?.['mystery']).toEqual({ type: 'string' });
    });

    it('infers the fallback type from an explicit default value', () => {
      const schema = build([{ key: 'mystery', type: 'custom-thing', value: 42 } as unknown as FieldDef<unknown>]);

      expect(schema.properties?.['mystery']).toEqual({ type: 'number', default: 42 });
    });
  });
});

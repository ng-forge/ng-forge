import { describe, expect, it, vi } from 'vitest';
import { FieldDef, FieldTypeDefinition } from '@ng-forge/dynamic-forms/internal';
import { buildToolSchema } from './build-tool-schema';

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
  ['row', { name: 'row', valueHandling: 'flatten' }],
  ['page', { name: 'page', valueHandling: 'flatten' }],
  ['group', { name: 'group', valueHandling: 'include' }],
  ['array', { name: 'array', valueHandling: 'include' }],
]);

const build = (fields: FieldDef<unknown>[]) => buildToolSchema(fields, registry);

describe('buildToolSchema', () => {
  describe('scalar types', () => {
    it('maps a text-input field to a string property', () => {
      const schema = build([{ key: 'name', type: 'input' } as FieldDef<unknown>]);

      expect(schema).toEqual({
        type: 'object',
        properties: { name: { type: 'string' } },
        required: [],
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
          options: [{ label: 'Draft', value: 'draft' }],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['status']).toEqual({ type: ['string', 'null'], enum: ['draft', null] });
    });
  });

  describe('options become enums', () => {
    it('emits an enum for a single-select field', () => {
      const schema = build([
        {
          key: 'status',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['status']).toEqual({ type: 'string', enum: ['draft', 'published'] });
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
        items: { type: 'string', enum: ['a', 'b'] },
      });
    });

    it('infers a numeric enum type from numeric option values', () => {
      const schema = build([
        {
          key: 'rating',
          type: 'select',
          options: [
            { label: 'One', value: 1 },
            { label: 'Two', value: 2 },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['rating']).toEqual({ type: 'number', enum: [1, 2] });
    });
  });

  describe('annotations', () => {
    it('carries label as title, placeholder as description and value as default', () => {
      const schema = build([
        {
          key: 'email',
          type: 'input',
          label: 'Email address',
          value: 'a@b.com',
          props: { placeholder: 'you@example.com' },
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['email']).toEqual({
        type: 'string',
        title: 'Email address',
        description: 'you@example.com',
        default: 'a@b.com',
      });
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

  describe('static validators become constraints', () => {
    it('maps required into the parent required list', () => {
      const schema = build([
        { key: 'a', type: 'input', validators: [{ type: 'required' }] } as unknown as FieldDef<unknown>,
        { key: 'b', type: 'input' } as FieldDef<unknown>,
      ]);

      expect(schema.required).toEqual(['a']);
    });

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

    it('maps min/max validators onto a number property', () => {
      const schema = build([
        {
          key: 'age',
          type: 'input',
          props: { type: 'number' },
          validators: [
            { type: 'min', value: 18 },
            { type: 'max', value: 99 },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['age']).toEqual({ type: 'number', minimum: 18, maximum: 99 });
    });

    it('serialises a RegExp pattern value to its source', () => {
      const schema = build([
        { key: 'code', type: 'input', validators: [{ type: 'pattern', value: /^\d+$/ }] } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['code']).toEqual({ type: 'string', pattern: '^\\d+$' });
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

      expect(schema.required).toEqual([]);
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

    it('nests a group as its own object with its own required list', () => {
      const schema = build([
        {
          key: 'address',
          type: 'group',
          fields: [
            { key: 'street', type: 'input', validators: [{ type: 'required' }] },
            { key: 'zip', type: 'input' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['address']).toEqual({
        type: 'object',
        properties: { street: { type: 'string' }, zip: { type: 'string' } },
        required: ['street'],
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
          required: [],
          additionalProperties: false,
        },
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

    it('treats repeated identical item definitions as homogeneous', () => {
      const schema = build([
        {
          key: 'tags',
          type: 'array',
          fields: [
            { key: 'tag', type: 'input' },
            { key: 'tag', type: 'input' },
          ],
        } as unknown as FieldDef<unknown>,
      ]);

      expect(schema.properties?.['tags']).toEqual({ type: 'array', items: { type: 'string' } });
    });

    it('omits a heterogeneous array and warns — tuples are not expressible', () => {
      const warn = vi.fn();
      const schema = buildToolSchema(
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
        registry,
        warn,
      );

      expect(Object.keys(schema.properties ?? {})).toEqual(['keep']);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0][0]).toContain('mixed');
    });

    it('omits an array with no item definitions', () => {
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

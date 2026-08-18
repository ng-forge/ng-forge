import { describe, it, expect } from 'vitest';
import type { z } from 'zod';
import { MatLeafFieldSchema } from '../../../../material/src/mat-leaf-field.schema';
import { BsLeafFieldSchema } from '../../../../bootstrap/src/bs-leaf-field.schema';
import { PrimeLeafFieldSchema } from '../../../../primeng/src/prime-leaf-field.schema';
import { IonicLeafFieldSchema } from '../../../../ionic/src/ionic-leaf-field.schema';

/**
 * Smoke coverage for the nullable contract across every adapter's leaf-field
 * discriminatedUnion. Guards the `.superRefine(nullableValueRefine)` on each
 * union — if someone removes it from one adapter, the corresponding assertions
 * fail loudly.
 *
 * Checked fields (checkbox, toggle) deliberately excluded — tri-state still
 * deferred.
 */

type AdapterCase = {
  name: string;
  schema: z.ZodTypeAny;
  // Minimal valid shapes per field type; options included for fields that need them.
  fields: Array<{
    type: string;
    extras?: Record<string, unknown>;
  }>;
};

const ADAPTERS: AdapterCase[] = [
  {
    name: 'material',
    schema: MatLeafFieldSchema,
    fields: [
      { type: 'input' },
      { type: 'textarea' },
      { type: 'select', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'radio', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'multi-checkbox', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'slider' },
      { type: 'datepicker' },
    ],
  },
  {
    name: 'bootstrap',
    schema: BsLeafFieldSchema,
    fields: [
      { type: 'input' },
      { type: 'textarea' },
      { type: 'select', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'radio', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'multi-checkbox', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'slider' },
      { type: 'datepicker' },
    ],
  },
  {
    name: 'primeng',
    schema: PrimeLeafFieldSchema,
    fields: [
      { type: 'input' },
      { type: 'textarea' },
      { type: 'select', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'radio', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'multi-checkbox', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'slider' },
      { type: 'datepicker' },
    ],
  },
  {
    name: 'ionic',
    schema: IonicLeafFieldSchema,
    fields: [
      { type: 'input' },
      { type: 'textarea' },
      { type: 'select', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'radio', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'multi-checkbox', extras: { options: [{ label: 'A', value: 'a' }] } },
      { type: 'slider' },
      { type: 'datepicker' },
    ],
  },
];

describe('nullable contract — cross-adapter', () => {
  for (const adapter of ADAPTERS) {
    describe(`${adapter.name} leaf-field schema`, () => {
      for (const field of adapter.fields) {
        describe(`field type: ${field.type}`, () => {
          it('accepts nullable:true + value:null', () => {
            const result = adapter.schema.safeParse({
              key: 'foo',
              type: field.type,
              label: 'Foo',
              nullable: true,
              value: null,
              ...field.extras,
            });
            expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
          });

          it('rejects value:null when nullable is absent', () => {
            const result = adapter.schema.safeParse({
              key: 'foo',
              type: field.type,
              label: 'Foo',
              value: null,
              ...field.extras,
            });
            expect(result.success).toBe(false);
            if (!result.success) {
              const hasValueIssue = result.error.issues.some((i) => i.path.includes('value'));
              expect(hasValueIssue).toBe(true);
            }
          });

          it('accepts nullable:true without an explicit value', () => {
            const result = adapter.schema.safeParse({
              key: 'foo',
              type: field.type,
              label: 'Foo',
              nullable: true,
              ...field.extras,
            });
            expect(result.success, result.success ? '' : JSON.stringify(result.error.issues)).toBe(true);
          });
        });
      }
    });
  }
});

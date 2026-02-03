import { TestBed } from '@angular/core/testing';
import { computed, signal, runInInjectionContext, Injector, isSignal } from '@angular/core';
import { form, schema, readonly as sfReadonly, applyEach, FieldTree } from '@angular/forms/signals';
import { describe, it, expect, beforeEach } from 'vitest';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { createSchemaFromFields } from '../../core/schema-builder';
import { SchemaRegistryService } from '../../core/registry/schema-registry.service';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { FieldDef } from '../../definitions/base/field-def';
import { FieldTypeDefinition } from '../../models/field-type';

/**
 * Investigation: Understanding how Angular Signal Forms exposes array item FieldTrees
 *
 * Key questions:
 * 1. What does rootForm['arrayKey'][index] return?
 * 2. Does it preserve readonly state from schema?
 * 3. How does bracket notation compare to local form creation?
 */
describe('Array FieldTree Readonly Investigation', () => {
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RootFormRegistryService,
        SchemaRegistryService,
        FunctionRegistryService,
        { provide: DynamicFormLogger, useValue: console },
      ],
    });
    injector = TestBed.inject(Injector);
  });

  it('should show readonly state when accessing array items via bracket notation', () => {
    runInInjectionContext(injector, () => {
      // Create entity with array
      const entity = signal({
        lineItems: [
          { quantity: 2, unitPrice: 50, lineTotal: 100 },
          { quantity: 3, unitPrice: 30, lineTotal: 90 },
        ],
      });

      // Create item schema with readonly on lineTotal only
      type LineItem = { quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        // Only lineTotal should be readonly
        sfReadonly(path.lineTotal);
      });

      // Create form schema using applyEach
      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      // Create form
      const testForm = form(entity, formSchema);

      // Initialize form structure by calling it
      testForm();

      // Access array FieldTree - avoid console.log on Proxy objects
      const lineItemsFieldTree = (testForm as Record<string, unknown>)['lineItems'];
      console.log('lineItemsFieldTree type:', typeof lineItemsFieldTree);
      console.log('lineItemsFieldTree is function:', typeof lineItemsFieldTree === 'function');
      console.log('lineItemsFieldTree is signal:', isSignal(lineItemsFieldTree));

      expect(lineItemsFieldTree).toBeDefined();

      // Try to understand the structure
      if (typeof lineItemsFieldTree === 'function') {
        // FieldTree is a callable that returns FieldState
        const arrayState = (lineItemsFieldTree as () => unknown)();
        console.log('arrayState type:', typeof arrayState);

        // Check what properties exist on the FieldTree (function object)
        const keys = Object.keys(lineItemsFieldTree);
        console.log('lineItemsFieldTree own keys:', keys);

        // Try numeric index access
        const item0 = (lineItemsFieldTree as Record<number, unknown>)[0];
        console.log('item0 type:', typeof item0);
        console.log('item0 is function:', typeof item0 === 'function');
        console.log('item0 is signal:', isSignal(item0));

        if (item0 !== undefined) {
          expect(item0).toBeDefined();

          if (typeof item0 === 'function') {
            // Call item FieldTree to get FieldState
            const item0State = (item0 as () => Record<string, unknown>)();
            console.log('item0State type:', typeof item0State);

            // Check readonly at item level
            const itemReadonlyFn = (item0State as { readonly?: () => boolean }).readonly;
            if (itemReadonlyFn) {
              console.log('item0 readonly:', itemReadonlyFn());
            }

            // Access quantity field
            const quantityField = (item0 as Record<string, unknown>)['quantity'];
            console.log('quantityField type:', typeof quantityField);

            if (quantityField && typeof quantityField === 'function') {
              const quantityState = (quantityField as () => Record<string, unknown>)();
              const quantityReadonlyFn = (quantityState as { readonly?: () => boolean }).readonly;
              const quantityReadonly = quantityReadonlyFn?.();
              console.log('quantity readonly:', quantityReadonly);
              console.log('Expected: false');

              // This is the key assertion - quantity should NOT be readonly
              expect(quantityReadonly).toBe(false);
            }

            // Access lineTotal field
            const lineTotalField = (item0 as Record<string, unknown>)['lineTotal'];
            console.log('lineTotalField type:', typeof lineTotalField);

            if (lineTotalField && typeof lineTotalField === 'function') {
              const lineTotalState = (lineTotalField as () => Record<string, unknown>)();
              const lineTotalReadonlyFn = (lineTotalState as { readonly?: () => boolean }).readonly;
              const lineTotalReadonly = lineTotalReadonlyFn?.();
              console.log('lineTotal readonly:', lineTotalReadonly);
              console.log('Expected: true');

              // This is the key assertion - lineTotal should be readonly
              expect(lineTotalReadonly).toBe(true);
            }
          }
        } else {
          console.log('item0 is undefined - bracket notation may not work on FieldTree');
          // Try alternative: maybe array items are accessed differently

          // Check if there's a length property or similar
          const lengthProp = (lineItemsFieldTree as Record<string, unknown>)['length'];
          console.log('length property type:', typeof lengthProp);
        }
      }
    });
  });

  it('should compare local form vs root form array access', () => {
    runInInjectionContext(injector, () => {
      // Create item entity
      const itemEntity = signal({ quantity: 2, unitPrice: 50, lineTotal: 100 });

      // Create item schema with readonly on lineTotal only
      type LineItem = { quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        sfReadonly(path.lineTotal);
      });

      // Create LOCAL form for just this item
      const localForm = form(itemEntity, itemSchema);
      localForm();

      // Check local form's readonly states
      const localQuantity = (localForm as Record<string, unknown>)['quantity'];
      const localLineTotal = (localForm as Record<string, unknown>)['lineTotal'];

      if (localQuantity && typeof localQuantity === 'function') {
        const state = (localQuantity as () => { readonly?: () => boolean })();
        console.log('LOCAL form quantity readonly:', state.readonly?.());
        expect(state.readonly?.()).toBe(false);
      }

      if (localLineTotal && typeof localLineTotal === 'function') {
        const state = (localLineTotal as () => { readonly?: () => boolean })();
        console.log('LOCAL form lineTotal readonly:', state.readonly?.());
        expect(state.readonly?.()).toBe(true);
      }
    });
  });

  it('should investigate array FieldTree structure more deeply', () => {
    runInInjectionContext(injector, () => {
      const entity = signal({
        lineItems: [{ quantity: 2, unitPrice: 50, lineTotal: 100 }],
      });

      type LineItem = { quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        sfReadonly(path.lineTotal);
      });

      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      const testForm = form(entity, formSchema);
      testForm();

      const lineItemsFieldTree = (testForm as Record<string, unknown>)['lineItems'];

      // Check prototype chain
      console.log('lineItemsFieldTree constructor name:', (lineItemsFieldTree as object)?.constructor?.name);

      // Check if it has a Proxy handler (will throw if not a Proxy)
      try {
        const proto = Object.getPrototypeOf(lineItemsFieldTree);
        console.log('prototype:', proto?.constructor?.name);
      } catch (e) {
        console.log('Error getting prototype:', (e as Error).message);
      }

      // Try to iterate
      if (typeof lineItemsFieldTree === 'function') {
        // Check if it's iterable
        const isIterable = typeof (lineItemsFieldTree as unknown as { [Symbol.iterator]?: unknown })[Symbol.iterator] === 'function';
        console.log('Is iterable:', isIterable);

        // Check array-like length
        const len = (lineItemsFieldTree as unknown as { length?: number }).length;
        console.log('length property:', len);

        // Try calling the FieldTree to get the FieldState
        const arrayFieldState = (lineItemsFieldTree as () => unknown)();
        console.log('arrayFieldState constructor:', (arrayFieldState as object)?.constructor?.name);

        // The FieldState for an array should have value() that returns the array
        const valueFn = (arrayFieldState as { value?: () => unknown }).value;
        if (valueFn) {
          const arrayValue = valueFn();
          console.log('Array value:', JSON.stringify(arrayValue));
          console.log('Array value length:', (arrayValue as unknown[])?.length);
        }
      }
    });
  });

  it('should simulate how component receives and uses field tree', () => {
    runInInjectionContext(injector, () => {
      // Setup form like the derivation scenario
      const entity = signal({
        lineItems: [
          { description: 'Product A', quantity: 2, unitPrice: 50, lineTotal: 100 },
          { description: 'Product B', quantity: 3, unitPrice: 30, lineTotal: 90 },
        ],
      });

      type LineItem = { description: string; quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        // Only lineTotal should be readonly - mimicking the scenario config
        sfReadonly(path.lineTotal);
      });

      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      const testForm = form(entity, formSchema);
      testForm();

      // Simulate what create-array-item-injector does:
      // 1. Access rootForm['lineItems'][index]
      const arrayFieldTree = (testForm as Record<string, unknown>)['lineItems'];
      const item0 = (arrayFieldTree as Record<number, unknown>)[0];
      const item1 = (arrayFieldTree as Record<number, unknown>)[1];

      // Simulate what value-field.mapper does:
      // 2. Access context.form[fieldKey] where context.form = item0
      // For quantity field:
      const item0QuantityFieldTree = (item0 as Record<string, unknown>)['quantity'];
      const item1QuantityFieldTree = (item1 as Record<string, unknown>)['quantity'];

      // For lineTotal field:
      const item0LineTotalFieldTree = (item0 as Record<string, unknown>)['lineTotal'];
      const item1LineTotalFieldTree = (item1 as Record<string, unknown>)['lineTotal'];

      // Simulate what mat-input.component does:
      // 3. this.field()().readonly() where this.field() returns the FieldTree
      // The component calls field() to get FieldTree, then () to get FieldState, then .readonly()

      // For item 0 quantity
      if (item0QuantityFieldTree && typeof item0QuantityFieldTree === 'function') {
        const fieldState = (item0QuantityFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 0 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      // For item 0 lineTotal
      if (item0LineTotalFieldTree && typeof item0LineTotalFieldTree === 'function') {
        const fieldState = (item0LineTotalFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 0 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }

      // For item 1 quantity
      if (item1QuantityFieldTree && typeof item1QuantityFieldTree === 'function') {
        const fieldState = (item1QuantityFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 1 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      // For item 1 lineTotal
      if (item1LineTotalFieldTree && typeof item1LineTotalFieldTree === 'function') {
        const fieldState = (item1LineTotalFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 1 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }
    });
  });

  it('should work with RootFormRegistryService and getter-based context', () => {
    runInInjectionContext(injector, () => {
      // Setup form like the derivation scenario
      const entity = signal({
        lineItems: [
          { description: 'Product A', quantity: 2, unitPrice: 50, lineTotal: 100 },
          { description: 'Product B', quantity: 3, unitPrice: 30, lineTotal: 90 },
        ],
      });

      type LineItem = { description: string; quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        sfReadonly(path.lineTotal);
      });

      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      const testForm = form(entity, formSchema);
      testForm();

      // Register root form like dynamic-form.component does
      const rootFormRegistry = injector.get(RootFormRegistryService);
      rootFormRegistry.registerRootForm(testForm as FieldTree<Record<string, unknown>>);

      // Simulate create-array-item-injector's itemFormAccessor computed
      const indexSignal = signal(0);
      const arrayKey = 'lineItems';

      const itemFormAccessor = computed(() => {
        const rootForm = rootFormRegistry.getRootForm();
        if (!rootForm) {
          console.log('getRootForm() returned null/undefined');
          return undefined;
        }
        const index = indexSignal();
        const arrayFieldTree = (rootForm as Record<string, unknown>)[arrayKey];
        if (!arrayFieldTree) {
          console.log('arrayFieldTree is null/undefined');
          return undefined;
        }
        return (arrayFieldTree as unknown[])[index] as FieldTree<unknown> | undefined;
      });

      // Simulate the FieldSignalContext with getter (like create-array-item-injector does)
      const itemFieldSignalContext = {
        get form(): FieldTree<Record<string, unknown>> {
          return itemFormAccessor() as FieldTree<Record<string, unknown>>;
        },
      };

      // Simulate value-field.mapper's getFieldTree function
      const getFieldTree = (fieldKey: string): FieldTree<unknown> | undefined => {
        const formRoot = itemFieldSignalContext.form as Record<string, FieldTree<unknown> | undefined> | undefined;
        if (!formRoot) {
          console.log('formRoot is null/undefined in getFieldTree');
          return undefined;
        }
        return formRoot[fieldKey];
      };

      // Simulate mat-input.component's field access
      // The component receives the FieldTree directly and calls field()().readonly()

      // Get quantity field tree
      const quantityFieldTree = getFieldTree('quantity');
      console.log('quantityFieldTree type:', typeof quantityFieldTree);
      expect(quantityFieldTree).toBeDefined();

      if (quantityFieldTree && typeof quantityFieldTree === 'function') {
        const fieldState = (quantityFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Via registry - quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      // Get lineTotal field tree
      const lineTotalFieldTree = getFieldTree('lineTotal');
      console.log('lineTotalFieldTree type:', typeof lineTotalFieldTree);
      expect(lineTotalFieldTree).toBeDefined();

      if (lineTotalFieldTree && typeof lineTotalFieldTree === 'function') {
        const fieldState = (lineTotalFieldTree as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Via registry - lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }

      // Test with index = 1
      indexSignal.set(1);

      const quantityFieldTree1 = getFieldTree('quantity');
      if (quantityFieldTree1 && typeof quantityFieldTree1 === 'function') {
        const fieldState = (quantityFieldTree1 as () => { readonly: () => boolean })();
        console.log('Via registry - item[1] quantity readonly:', fieldState.readonly());
        expect(fieldState.readonly()).toBe(false);
      }

      const lineTotalFieldTree1 = getFieldTree('lineTotal');
      if (lineTotalFieldTree1 && typeof lineTotalFieldTree1 === 'function') {
        const fieldState = (lineTotalFieldTree1 as () => { readonly: () => boolean })();
        console.log('Via registry - item[1] lineTotal readonly:', fieldState.readonly());
        expect(fieldState.readonly()).toBe(true);
      }
    });
  });

  it('should work with nested schema (row container inside array)', () => {
    runInInjectionContext(injector, () => {
      // This mirrors the actual scenario: array with row container
      // The form schema flattens the row, so fields are at itemPath['quantity'], not itemPath['itemRow']['quantity']
      const entity = signal({
        lineItems: [
          { description: 'Product A', quantity: 2, unitPrice: 50, lineTotal: 100 },
          { description: 'Product B', quantity: 3, unitPrice: 30, lineTotal: 90 },
        ],
      });

      // Create item schema that mimics how form-mapping.ts creates it
      // When a row is encountered, its children are mapped at the item level (flattened)
      type LineItem = { description: string; quantity: number; unitPrice: number; lineTotal: number };
      const itemSchema = schema<LineItem>((itemPath) => {
        // Simulate mapContainerChildren for row - maps children directly to itemPath
        // description - no readonly
        // quantity - no readonly
        // unitPrice - no readonly
        // lineTotal - readonly: true

        // Only lineTotal has readonly
        sfReadonly(itemPath.lineTotal);
      });

      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      const testForm = form(entity, formSchema);
      testForm();

      // Register root form like dynamic-form.component does
      const rootFormRegistry = injector.get(RootFormRegistryService);
      rootFormRegistry.registerRootForm(testForm as FieldTree<Record<string, unknown>>);

      // Access items via root form
      const arrayFieldTree = (testForm as Record<string, unknown>)['lineItems'];
      const item0 = (arrayFieldTree as Record<number, unknown>)[0];
      const item1 = (arrayFieldTree as Record<number, unknown>)[1];

      // Check readonly states
      console.log('\n=== Nested schema (row container) test ===');

      // Item 0
      const item0Quantity = (item0 as Record<string, unknown>)['quantity'];
      const item0LineTotal = (item0 as Record<string, unknown>)['lineTotal'];

      if (item0Quantity && typeof item0Quantity === 'function') {
        const fieldState = (item0Quantity as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 0 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      if (item0LineTotal && typeof item0LineTotal === 'function') {
        const fieldState = (item0LineTotal as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 0 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }

      // Item 1
      const item1Quantity = (item1 as Record<string, unknown>)['quantity'];
      const item1LineTotal = (item1 as Record<string, unknown>)['lineTotal'];

      if (item1Quantity && typeof item1Quantity === 'function') {
        const fieldState = (item1Quantity as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 1 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      if (item1LineTotal && typeof item1LineTotal === 'function') {
        const fieldState = (item1LineTotal as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('Item 1 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }
    });
  });

  it('should work with createSchemaFromFields (actual app flow)', () => {
    runInInjectionContext(injector, () => {
      // This mirrors the EXACT scenario config from array-field-derivation.scenario.ts
      const fields: FieldDef<unknown>[] = [
        {
          key: 'invoiceNumber',
          type: 'input',
          label: 'Invoice Number',
          value: 'INV-001',
          col: 12,
        },
        {
          key: 'lineItems',
          type: 'array',
          fields: [
            {
              key: 'itemRow',
              type: 'row',
              fields: [
                {
                  key: 'description',
                  type: 'input',
                  label: 'Description',
                  col: 4,
                },
                {
                  key: 'quantity',
                  type: 'input',
                  label: 'Quantity',
                  props: { type: 'number' },
                  col: 2,
                },
                {
                  key: 'unitPrice',
                  type: 'input',
                  label: 'Unit Price',
                  props: { type: 'number' },
                  col: 2,
                },
                {
                  key: 'lineTotal',
                  type: 'input',
                  label: 'Line Total',
                  readonly: true,
                  col: 4,
                },
              ],
            },
          ],
        },
      ];

      // Create a minimal registry with 'input', 'array', and 'row' types
      const registry = new Map<string, FieldTypeDefinition>([
        ['input', { valueHandling: 'include' }],
        ['array', { valueHandling: 'include' }],
        ['row', { valueHandling: 'flatten' }],
      ]);

      // Create entity with initial values
      const entity = signal({
        invoiceNumber: 'INV-001',
        lineItems: [
          { description: 'Product A', quantity: 2, unitPrice: 50, lineTotal: 100 },
          { description: 'Product B', quantity: 3, unitPrice: 30, lineTotal: 90 },
        ],
      });

      // Create schema using the actual createSchemaFromFields function
      const formSchema = createSchemaFromFields(fields, registry);

      // Create form
      const testForm = form(entity, formSchema);
      testForm();

      // Register root form
      const rootFormRegistry = injector.get(RootFormRegistryService);
      rootFormRegistry.registerRootForm(testForm as FieldTree<Record<string, unknown>>);

      console.log('\n=== createSchemaFromFields test ===');

      // Access items via root form
      const arrayFieldTree = (testForm as Record<string, unknown>)['lineItems'];
      const item0 = (arrayFieldTree as Record<number, unknown>)[0];
      const item1 = (arrayFieldTree as Record<number, unknown>)[1];

      // Check readonly states
      // Item 0
      const item0Quantity = (item0 as Record<string, unknown>)['quantity'];
      const item0LineTotal = (item0 as Record<string, unknown>)['lineTotal'];

      if (item0Quantity && typeof item0Quantity === 'function') {
        const fieldState = (item0Quantity as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('createSchemaFromFields - Item 0 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      if (item0LineTotal && typeof item0LineTotal === 'function') {
        const fieldState = (item0LineTotal as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('createSchemaFromFields - Item 0 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }

      // Item 1
      const item1Quantity = (item1 as Record<string, unknown>)['quantity'];
      const item1LineTotal = (item1 as Record<string, unknown>)['lineTotal'];

      if (item1Quantity && typeof item1Quantity === 'function') {
        const fieldState = (item1Quantity as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('createSchemaFromFields - Item 1 quantity readonly:', readonlyValue);
        expect(readonlyValue).toBe(false);
      }

      if (item1LineTotal && typeof item1LineTotal === 'function') {
        const fieldState = (item1LineTotal as () => { readonly: () => boolean })();
        const readonlyValue = fieldState.readonly();
        console.log('createSchemaFromFields - Item 1 lineTotal readonly:', readonlyValue);
        expect(readonlyValue).toBe(true);
      }
    });
  });

  it('should correctly read readonly from field input signal (simulating component)', () => {
    runInInjectionContext(injector, () => {
      // Create form with readonly field
      const entity = signal({
        lineItems: [
          { quantity: 2, lineTotal: 100 },
          { quantity: 3, lineTotal: 90 },
        ],
      });

      type LineItem = { quantity: number; lineTotal: number };
      const itemSchema = schema<LineItem>((path) => {
        sfReadonly(path.lineTotal);
      });

      type FormModel = { lineItems: LineItem[] };
      const formSchema = schema<FormModel>((path) => {
        applyEach(path.lineItems, itemSchema);
      });

      const testForm = form(entity, formSchema);
      testForm();

      // Get field trees
      const arrayFieldTree = (testForm as Record<string, unknown>)['lineItems'];
      const item0 = (arrayFieldTree as Record<number, unknown>)[0];
      const item0QuantityFieldTree = (item0 as Record<string, unknown>)['quantity'];
      const item0LineTotalFieldTree = (item0 as Record<string, unknown>)['lineTotal'];

      // Simulate what the component does:
      // 1. field input receives FieldTree
      // 2. isReadonly = computed(() => this.field()().readonly())

      // Create a signal to simulate the field input
      const fieldInputSignal = signal(item0QuantityFieldTree as FieldTree<unknown>);

      // Create a computed like the component does
      const isReadonly = computed(() => {
        const fieldTree = fieldInputSignal();
        if (!fieldTree || typeof fieldTree !== 'function') {
          console.log('fieldTree is undefined or not a function');
          return true; // Default to readonly if field tree is not available
        }
        const fieldState = (fieldTree as () => { readonly: () => boolean })();
        return fieldState.readonly();
      });

      console.log('\n=== Component simulation test ===');

      // Test with quantity field (should be false)
      console.log('Quantity field readonly (via signal):', isReadonly());
      expect(isReadonly()).toBe(false);

      // Change to lineTotal field (should be true)
      fieldInputSignal.set(item0LineTotalFieldTree as FieldTree<unknown>);
      console.log('LineTotal field readonly (via signal):', isReadonly());
      expect(isReadonly()).toBe(true);

      // Change back to quantity
      fieldInputSignal.set(item0QuantityFieldTree as FieldTree<unknown>);
      console.log('Quantity field readonly again (via signal):', isReadonly());
      expect(isReadonly()).toBe(false);

      // Test with item 1
      const item1 = (arrayFieldTree as Record<number, unknown>)[1];
      const item1QuantityFieldTree = (item1 as Record<string, unknown>)['quantity'];
      const item1LineTotalFieldTree = (item1 as Record<string, unknown>)['lineTotal'];

      fieldInputSignal.set(item1QuantityFieldTree as FieldTree<unknown>);
      console.log('Item 1 quantity readonly (via signal):', isReadonly());
      expect(isReadonly()).toBe(false);

      fieldInputSignal.set(item1LineTotalFieldTree as FieldTree<unknown>);
      console.log('Item 1 lineTotal readonly (via signal):', isReadonly());
      expect(isReadonly()).toBe(true);
    });
  });
});

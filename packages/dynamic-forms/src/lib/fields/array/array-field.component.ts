import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  linkedSignal,
  runInInjectionContext,
  Signal,
  signal,
  type Type,
  untracked,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, filter, forkJoin, from, map, Observable, of } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTree, form } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { AddArrayItemEvent } from '../../events/constants/add-array-item.event';
import { RemoveArrayItemEvent } from '../../events/constants/remove-array-item.event';
import { EventBus } from '../../events/event.bus';
import { ArrayContext, FieldSignalContext } from '../../mappers/types';
import { mapFieldToInputs } from '../../utils/field-mapper/field-mapper';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { createSchemaFromFields } from '../../core/schema-builder';
import { flattenFields } from '../../utils/flattener/field-flattener';
import { getChildrenMap } from '../../utils/form-internals/form-internals';

/**
 * Resolved array item ready for declarative rendering with ngComponentOutlet.
 * Each item has a unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 */
interface ResolvedArrayItem {
  /** Unique identifier for this item (stable across position changes) */
  id: number;
  /** The loaded component type */
  component: Type<unknown>;
  /** The injector used for this item (with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT) */
  injector: Injector;
  /** Inputs signal for ngComponentOutlet - evaluated in template for reactivity */
  inputs: Signal<Record<string, unknown>>;
  /** JSON snapshot of the value this item was created with (for differential comparison) */
  valueSnapshot: string;
}

/** Helper to create a value snapshot for comparison */
function createValueSnapshot(value: unknown): string {
  try {
    return JSON.stringify(value) ?? '';
  } catch {
    return '';
  }
}

/**
 * Array field component that manages dynamic arrays of field values.
 *
 * Key behaviors:
 * - Fields array defines the TEMPLATE (not instances)
 * - Collects values as flat array: [value1, value2, value3]
 * - Supports dynamic add/remove via event bus
 * - Template stored in computed signal for type enforcement
 *
 * Example:
 * ```typescript
 * {
 *   key: 'items',
 *   type: 'array',
 *   fields: [
 *     { key: 'item', type: 'input', value: '' }
 *   ]
 * }
 * // Creates: { items: ['value1', 'value2', 'value3'] }
 * ```
 */
@Component({
  selector: 'array-field',
  imports: [NgComponentOutlet],
  template: `
    <div class="array-container">
      <div class="array-items">
        @for (item of resolvedItems(); track item.id) {
          <ng-container *ngComponentOutlet="item.component; injector: item.injector; inputs: item.inputs()" />
        }
      </div>
    </div>
  `,
  styleUrl: './array-field.component.scss',
  host: {
    class: 'df-field df-array',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArrayFieldComponent<TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly parentInjector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  /** Field configuration input */
  field = input.required<ArrayField>();

  key = input.required<string>();

  // Memoized field registry raw access (similar to dynamic-form.component.ts:204)
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  /**
   * Get the field template from the array field definition.
   * This template is used when adding new items dynamically.
   */
  private readonly fieldTemplate = computed<FieldDef<unknown> | null>(() => {
    const arrayField = this.field();
    // Array fields should have exactly one field as the template
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

  /**
   * Get the array of FieldTree objects from the parent form.
   * Signal Forms automatically creates FieldTree for each array item.
   *
   * IMPORTANT: Returns (FieldTree | null)[] to handle both:
   * - Primitive array items: FieldTree is available
   * - Object array items: FieldTree is null (Angular Signal Forms doesn't create them for objects)
   *
   * For object items, we create local forms in the component creation methods.
   */
  private readonly arrayFieldTrees = computed<readonly (FieldTree<unknown> | null)[]>(() => {
    const arrayKey = this.field().key;

    // Get the parent form - this tracks when the form structure changes
    const parentForm = this.parentFieldSignalContext.form();

    // Get the current array value to determine length
    const arrayValue = this.getArrayValue(this.parentFieldSignalContext.value(), arrayKey);
    if (arrayValue.length === 0) return [];

    // Access the array FieldTree through the form's structure using utility
    const childrenMap = getChildrenMap(parentForm);

    // Get the array's inner childrenMap if available
    let innerChildrenMap: Map<string, FieldTree<unknown>> | null = null;
    if (childrenMap) {
      const arrayFieldTree = childrenMap.get(arrayKey);
      if (arrayFieldTree) {
        innerChildrenMap = getChildrenMap(arrayFieldTree);
      }
    }

    // Build array of FieldTree or null for each item
    // null indicates an object item that needs a local form
    const items: (FieldTree<unknown> | null)[] = [];
    for (let i = 0; i < arrayValue.length; i++) {
      const itemFieldTree = innerChildrenMap?.get(String(i)) ?? null;
      items.push(itemFieldTree);
    }

    return items;
  });

  /**
   * Source of truth: resolved array items with stable identity for declarative rendering.
   * All other signals (resolvedItems, itemOrderSignal) derive from this.
   */
  private readonly resolvedItemsSignal = signal<ResolvedArrayItem[]>([]);

  /** Counter for generating unique item IDs */
  private itemIdCounter = 0;

  /**
   * Derived signal containing the ordered item IDs.
   * Used by individual item's linkedSignal to compute their current index.
   */
  private readonly itemOrderSignal = linkedSignal(() => this.resolvedItemsSignal().map((item) => item.id));

  /**
   * Resolved items for declarative rendering in template.
   * Automatically updates when resolvedItemsSignal changes.
   */
  readonly resolvedItems = linkedSignal(() => this.resolvedItemsSignal());

  /** Track in-progress operations to prevent race conditions */
  private pendingUpdateId = 0;

  /**
   * Effect that performs differential updates when arrayFieldTrees changes.
   * Optimizes for the most common operations:
   * - Pure append (items added at end): Create only new items, no flicker
   * - Pure pop (items removed from end): Destroy only removed items, no flicker
   * - Middle operations: Full recreation (correctness over optimization)
   */
  private readonly _syncFieldsEffect = explicitEffect([this.arrayFieldTrees], ([fieldTrees]) => {
    const updateId = ++this.pendingUpdateId;
    this.performDifferentialUpdate(fieldTrees, updateId);
  });

  /**
   * Perform differential update of array items.
   * Uses value comparison to detect append/pop vs middle operations.
   */
  private performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    const resolvedItems = this.resolvedItemsSignal();
    const currentLength = resolvedItems.length;
    const newLength = fieldTrees.length;

    // Get current array values for comparison
    const arrayKey = this.field().key;
    const currentArrayValue = this.getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    // Handle empty arrays
    if (newLength === 0) {
      this.clearAllItems();
      return;
    }

    // Handle initial render (no existing items)
    if (currentLength === 0) {
      this.resolveAllItems(fieldTrees, updateId);
      return;
    }

    // Determine operation type by comparing values
    const minLength = Math.min(currentLength, newLength);

    if (newLength > currentLength) {
      // Items were added - check if it's a pure append
      const isPureAppend = this.checkValuesMatch(currentArrayValue, minLength);
      if (isPureAppend) {
        this.appendItems(fieldTrees, currentLength, newLength, updateId);
        return;
      }
    }
    if (newLength < currentLength) {
      // Items were removed - check if it's a pure pop (remove from end)
      const isPurePop = this.checkValuesMatch(currentArrayValue, newLength);
      if (isPurePop) {
        this.removeItemsFromEnd(newLength);
        return;
      }
    }

    // If lengths are equal and values match, no update needed
    if (newLength === currentLength) {
      const valuesMatch = this.checkValuesMatch(currentArrayValue, newLength);
      if (valuesMatch) {
        return;
      }
    }

    // Recreate all for any other operation (middle insert/remove, value change)
    this.recreateAllItems(fieldTrees, updateId);
  }

  /**
   * Check if the first N values match between resolved items' snapshots and new values.
   * Uses pre-computed JSON snapshots for comparison.
   */
  private checkValuesMatch(newValues: unknown[], count: number): boolean {
    const resolvedItems = this.resolvedItemsSignal();
    if (resolvedItems.length < count || newValues.length < count) {
      return false;
    }

    for (let i = 0; i < count; i++) {
      const oldSnapshot = resolvedItems[i].valueSnapshot;
      const newSnapshot = createValueSnapshot(newValues[i]);

      if (oldSnapshot !== newSnapshot) {
        return false;
      }
    }
    return true;
  }

  /**
   * Remove items from the end of the array (pure pop operation).
   * Remaining items' indices automatically update via linkedSignal derivation from itemOrderSignal.
   * With declarative rendering, we just update the signal - Angular handles DOM cleanup.
   */
  private removeItemsFromEnd(newLength: number): void {
    const resolvedItems = this.resolvedItemsSignal();
    // Update signal with truncated array - resolvedItems and itemOrderSignal derive automatically
    this.resolvedItemsSignal.set(resolvedItems.slice(0, newLength));
  }

  /**
   * Clear all resolved items.
   * With declarative rendering, we just update the signal - Angular handles DOM cleanup.
   */
  private clearAllItems(): void {
    // Update signal - resolvedItems and itemOrderSignal derive automatically
    this.resolvedItemsSignal.set([]);
  }

  /**
   * Resolve all items from scratch (initial render) using RxJS.
   */
  private resolveAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    if (fieldTrees.length === 0) {
      this.resolvedItemsSignal.set([]);
      return;
    }

    const itemObservables = fieldTrees.map((fieldTree, i) => this.resolveArrayItem(fieldTree, i));

    forkJoin(itemObservables)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined)),
      )
      .subscribe((newItems) => {
        if (updateId === this.pendingUpdateId) {
          // Update signal - resolvedItems and itemOrderSignal derive automatically
          this.resolvedItemsSignal.set(newItems);
          this.emitFieldsInitialized();
        }
      });
  }

  /**
   * Recreate all items (used for middle operations).
   */
  private recreateAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    // Clear existing items
    this.clearAllItems();

    // Resolve new items
    this.resolveAllItems(fieldTrees, updateId);
  }

  /**
   * Append new items to the end of the array using RxJS.
   */
  private appendItems(fieldTrees: readonly (FieldTree<unknown> | null)[], startIndex: number, endIndex: number, updateId: number): void {
    const itemsToResolve = fieldTrees.slice(startIndex, endIndex);

    if (itemsToResolve.length === 0) {
      return;
    }

    const itemObservables = itemsToResolve.map((fieldTree, i) => this.resolveArrayItem(fieldTree, startIndex + i));

    forkJoin(itemObservables)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined)),
      )
      .subscribe((newItems) => {
        if (updateId === this.pendingUpdateId) {
          // Update signal with appended items - resolvedItems and itemOrderSignal derive automatically
          this.resolvedItemsSignal.update((current) => [...current, ...newItems]);
        }
      });
  }

  /**
   * Resolve a single array item for declarative rendering using RxJS.
   * Uses linkedSignal for the index, which automatically updates when itemOrderSignal changes.
   */
  private resolveArrayItem(fieldTree: FieldTree<unknown> | null, index: number): Observable<ResolvedArrayItem | undefined> {
    const template = this.fieldTemplate();
    if (!template) {
      return of(undefined);
    }

    return from(this.fieldRegistry.loadTypeComponent(template.type)).pipe(
      map((component) => {
        if (this.destroyRef.destroyed) {
          return undefined;
        }

        // Generate unique ID for this item
        const itemId = this.itemIdCounter++;

        // Create a linkedSignal that derives its index from itemOrderSignal
        // When itemOrderSignal is updated (e.g., items removed), this automatically updates
        const indexSignal = linkedSignal(() => {
          const order = this.itemOrderSignal();
          const idx = order.indexOf(itemId);
          return idx >= 0 ? idx : index; // Fallback to initial index if not yet in order
        });

        // Create the injector and inputs for this array item
        const { injector, inputs } = this.createItemInjectorAndInputs(fieldTree, template, indexSignal);

        // Get current value for this item to create snapshot
        const arrayKey = this.field().key;
        const currentValue = this.parentFieldSignalContext.value() as Partial<TModel>;
        const arrayValue = this.getArrayValue(currentValue, arrayKey);
        const itemValue = arrayValue[index];

        return {
          id: itemId,
          component,
          injector,
          inputs,
          valueSnapshot: createValueSnapshot(itemValue),
        };
      }),
      catchError((error) => {
        if (!this.destroyRef.destroyed) {
          console.error(
            `[Dynamic Forms] Failed to load component for field type '${template.type}' at index ${index} ` +
              `within array '${this.field().key}'. Ensure the field type is registered in your field registry.`,
            error,
          );
        }
        return of(undefined);
      }),
    );
  }

  /**
   * Create an injector and inputs for an array item.
   * Returns both the injector (with ARRAY_CONTEXT and FIELD_SIGNAL_CONTEXT) and the inputs signal.
   */
  private createItemInjectorAndInputs(
    fieldTree: FieldTree<unknown> | null,
    template: FieldDef<unknown>,
    indexSignal: Signal<number>,
  ): { injector: Injector; inputs: Signal<Record<string, unknown>> } {
    const valueHandling = this.rawFieldRegistry().get(template.type)?.valueHandling || 'include';

    // Determine the form reference and create injector
    let formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>;

    if (valueHandling === 'flatten' && 'fields' in template && template.fields) {
      // Flatten types (row/page) or groups
      formRef = fieldTree ?? this.createObjectItemFormWithSignal(template, indexSignal);
    } else if (template.type === 'group' && valueHandling === 'include') {
      // Group types inside arrays
      formRef = fieldTree ?? this.createObjectItemFormWithSignal(template, indexSignal);
    } else if (fieldTree) {
      // Regular types with FieldTree
      formRef = fieldTree;
    } else {
      // Object items without FieldTree
      formRef = this.createObjectItemFormWithSignal(template, indexSignal);
    }

    const injector = this.createItemInjector(formRef, indexSignal);

    // Map field to inputs using the scoped injector
    const inputs = runInInjectionContext(injector, () => {
      return mapFieldToInputs(template, this.rawFieldRegistry());
    });

    return { injector, inputs };
  }

  /**
   * Create a local form for an object array item using a signal-based index.
   */
  private createObjectItemFormWithSignal(template: FieldDef<unknown>, indexSignal: Signal<number>): ReturnType<typeof form<unknown>> {
    const arrayKey = this.field().key;
    const registry = this.rawFieldRegistry();

    // Create entity signal that reads from the array at the signal's current index
    const itemEntity = linkedSignal(() => {
      const parentValue = this.parentFieldSignalContext.value();
      const arrayValue = this.getArrayValue(parentValue as Partial<TModel>, arrayKey);
      return arrayValue[indexSignal()] ?? {};
    });

    // Get nested fields for schema creation (if available)
    const nestedFields = 'fields' in template && Array.isArray(template.fields) ? template.fields : [];

    // Create form with schema if we have nested fields
    return runInInjectionContext(this.parentInjector, () => {
      if (nestedFields.length > 0) {
        const flattenedFields = flattenFields(nestedFields, registry);
        const schema = createSchemaFromFields(flattenedFields, registry);
        return untracked(() => form(itemEntity, schema));
      }
      return untracked(() => form(itemEntity));
    });
  }

  /**
   * Listen for AddArrayItemEvent and RemoveArrayItemEvent
   * Using takeUntilDestroyed() to prevent memory leaks
   */
  constructor() {
    // Store key signal reference for use in subscription
    const keySignal = this.key;

    this.eventBus
      .on<AddArrayItemEvent>('add-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === keySignal()),
      )
      .subscribe((event) => this.addItem(event.field ?? this.fieldTemplate(), event.index));

    this.eventBus
      .on<RemoveArrayItemEvent>('remove-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === keySignal()),
      )
      .subscribe((event) => this.removeItem(event.index));
  }

  /**
   * Add a new item to the array
   * @param fieldTemplate - The field template to use for the new item (provided by the event or from array's own template)
   * @param index - Optional index where to insert the item
   */
  private addItem(fieldTemplate: FieldDef<unknown> | null, index?: number): void {
    if (!fieldTemplate) {
      console.error(
        `[Dynamic Forms] Cannot add item to array '${this.field().key}': no field template provided. ` +
          'Ensure the array field has a fields property with at least one field definition.',
      );
      return;
    }

    const arrayKey = this.field().key;
    const formObject = this.parentFieldSignalContext.form();
    const currentValue = formObject.value() as TModel;
    const currentArray = this.getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    const value = getFieldDefaultValue(fieldTemplate, this.rawFieldRegistry());
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    // Update via form's value signal to ensure Angular Signal Forms creates proper FieldTree structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  /**
   * Remove an item from the array
   */
  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const formObject = this.parentFieldSignalContext.form();
    const currentValue = formObject.value() as TModel;
    const currentArray = this.getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    const removeIndex = index !== undefined ? Math.min(index, currentArray.length - 1) : currentArray.length - 1;
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update via form's value signal to ensure Angular Signal Forms updates FieldTree structures
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  /**
   * Safely get array value from parent model
   */
  private getArrayValue(value: Partial<TModel> | undefined, key: string): unknown[] {
    const arrayValue = (value as Record<string, unknown>)?.[key];
    return Array.isArray(arrayValue) ? arrayValue : [];
  }

  /**
   * Core helper to create an injector for an array item.
   * Provides both FIELD_SIGNAL_CONTEXT and ARRAY_CONTEXT to child components.
   *
   * @param formRef - The form reference (FieldTree or local form) for this item
   * @param indexSignal - Signal containing the index of the array item (automatically updates via linkedSignal)
   */
  private createItemInjector(formRef: FieldTree<unknown> | ReturnType<typeof form<unknown>>, indexSignal: Signal<number>): Injector {
    const arrayContext: ArrayContext = {
      arrayKey: this.field().key,
      index: indexSignal,
      formValue: this.parentFieldSignalContext.value(),
      field: this.field(),
    };

    // Create context with placeholder injector (will be set after Injector.create)
    // Wrap formRef in a function to make it callable (FieldSignalContext.form must be callable)
    const itemFieldSignalContext: FieldSignalContext<unknown> = {
      injector: undefined as unknown as Injector,
      value: this.parentFieldSignalContext.value,
      defaultValues: () => ({}),
      form: (() => formRef) as unknown as ReturnType<typeof form<unknown>>,
      defaultValidationMessages: this.parentFieldSignalContext.defaultValidationMessages,
    };

    const injector = Injector.create({
      parent: this.parentInjector,
      providers: [
        { provide: FIELD_SIGNAL_CONTEXT, useValue: itemFieldSignalContext },
        { provide: ARRAY_CONTEXT, useValue: arrayContext },
      ],
    });

    // Complete the circular reference
    itemFieldSignalContext.injector = injector;

    return injector;
  }

  /**
   * Emits the fieldsInitialized event after the next render cycle.
   */
  private emitFieldsInitialized(): void {
    emitComponentInitialized(this.eventBus, 'array', this.field().key, this.parentInjector);
  }
}

export { ArrayFieldComponent };

import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
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
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldRendererDirective } from '../../directives/dynamic-form.directive';
import { FieldTree, form, FormUiControl } from '@angular/forms/signals';
import { FieldDef } from '../../definitions';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { AddArrayItemEvent, EventBus, RemoveArrayItemEvent } from '../../events';
import { ComponentInitializedEvent } from '../../events/constants/component-initialized.event';
import { ArrayContext, FieldSignalContext } from '../../mappers';
import { mapFieldToBindings } from '../../utils/field-mapper/field-mapper';
import { ARRAY_CONTEXT, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { createSchemaFromFields } from '../../core';
import { flattenFields, getChildrenMap } from '../../utils';

/**
 * Tracked array item with stable identity for differential updates.
 * Each item has a unique ID and a linkedSignal-based index that
 * automatically updates when items are added/removed.
 */
interface TrackedArrayItem {
  /** Unique identifier for this item (stable across position changes) */
  id: number;
  /** The Angular component reference */
  componentRef: ComponentRef<FormUiControl>;
  /** The injector used for this item */
  injector: Injector;
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
  template: `
    <div class="array-container">
      <div class="array-items" [fieldRenderer]="fields()" (fieldsInitialized)="onFieldsInitialized()">
        <!-- Array items will be rendered here -->
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
  imports: [FieldRendererDirective],
})
export default class ArrayFieldComponent<TModel = Record<string, unknown>> {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly vcr = inject(ViewContainerRef);
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
   * Source of truth: tracked array items with stable identity.
   * All other signals (fields, itemOrderSignal) derive from this.
   */
  private readonly trackedItemsSignal = signal<TrackedArrayItem[]>([]);

  /** Counter for generating unique item IDs */
  private itemIdCounter = 0;

  /**
   * Derived signal containing the ordered item IDs.
   * Used by individual item's linkedSignal to compute their current index.
   */
  private readonly itemOrderSignal = linkedSignal(() => this.trackedItemsSignal().map((item) => item.id));

  /**
   * Derived signal containing the current component refs for the template.
   * Automatically updates when trackedItemsSignal changes.
   */
  readonly fields = linkedSignal(() => this.trackedItemsSignal().map((item) => item.componentRef));

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
  private async performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): Promise<void> {
    const trackedItems = this.trackedItemsSignal();
    const currentLength = trackedItems.length;
    const newLength = fieldTrees.length;

    // Get current array values for comparison
    const arrayKey = this.field().key;
    const currentArrayValue = this.getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    // Handle empty arrays
    if (newLength === 0) {
      return this.clearAllItems();
    }

    // Handle initial render (no existing items)
    if (currentLength === 0) {
      return this.createAllItems(fieldTrees, updateId);
    }

    // Determine operation type by comparing values
    const minLength = Math.min(currentLength, newLength);

    if (newLength > currentLength) {
      // Items were added - check if it's a pure append
      const isPureAppend = this.checkValuesMatch(currentArrayValue, minLength);
      if (isPureAppend) {
        return this.appendItems(fieldTrees, currentLength, newLength, updateId);
      }
    }
    if (newLength < currentLength) {
      // Items were removed - check if it's a pure pop (remove from end)
      const isPurePop = this.checkValuesMatch(currentArrayValue, newLength);
      if (isPurePop) {
        return this.removeItemsFromEnd(currentLength, newLength);
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
    return this.recreateAllItems(fieldTrees, updateId);
  }

  /**
   * Check if the first N values match between tracked items' snapshots and new values.
   * Uses pre-computed JSON snapshots for comparison.
   */
  private checkValuesMatch(newValues: unknown[], count: number): boolean {
    const trackedItems = this.trackedItemsSignal();
    if (trackedItems.length < count || newValues.length < count) {
      return false;
    }

    for (let i = 0; i < count; i++) {
      const oldSnapshot = trackedItems[i].valueSnapshot;
      const newSnapshot = createValueSnapshot(newValues[i]);

      if (oldSnapshot !== newSnapshot) {
        return false;
      }
    }
    return true;
  }

  /**
   * Remove items from the end of the array (pure pop operation).
   * Only destroys removed items. Remaining items' indices automatically update
   * via their linkedSignal derivation from itemOrderSignal.
   */
  private removeItemsFromEnd(currentLength: number, newLength: number): void {
    const trackedItems = this.trackedItemsSignal();

    // Remove and destroy items from the end
    for (let i = currentLength - 1; i >= newLength; i--) {
      const item = trackedItems[i];
      const viewIndex = this.vcr.indexOf(item.componentRef.hostView);
      if (viewIndex >= 0) {
        this.vcr.remove(viewIndex);
      }
      item.componentRef.destroy();
    }

    // Update signal with truncated array - fields and itemOrderSignal derive automatically
    this.trackedItemsSignal.set(trackedItems.slice(0, newLength));
  }

  /**
   * Clear all tracked items and their components.
   */
  private clearAllItems(): void {
    this.vcr.clear();
    // Update signal - fields and itemOrderSignal derive automatically
    this.trackedItemsSignal.set([]);
  }

  /**
   * Create all items from scratch (initial render).
   */
  private async createAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): Promise<void> {
    const newItems: TrackedArrayItem[] = [];

    for (let i = 0; i < fieldTrees.length; i++) {
      if (updateId !== this.pendingUpdateId) return;

      const item = await this.createTrackedItem(fieldTrees[i], i);
      if (item && updateId === this.pendingUpdateId) {
        newItems.push(item);
      }
    }

    if (updateId === this.pendingUpdateId) {
      // Update signal - fields and itemOrderSignal derive automatically
      this.trackedItemsSignal.set(newItems);
    }
  }

  /**
   * Recreate all items (used for middle operations).
   */
  private async recreateAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): Promise<void> {
    // Clear existing items
    this.clearAllItems();

    // Create new items
    await this.createAllItems(fieldTrees, updateId);
  }

  /**
   * Append new items to the end of the array.
   */
  private async appendItems(
    fieldTrees: readonly (FieldTree<unknown> | null)[],
    startIndex: number,
    endIndex: number,
    updateId: number,
  ): Promise<void> {
    const newItems: TrackedArrayItem[] = [];

    for (let i = startIndex; i < endIndex; i++) {
      if (updateId !== this.pendingUpdateId) return;

      const item = await this.createTrackedItem(fieldTrees[i], i);
      if (item && updateId === this.pendingUpdateId) {
        newItems.push(item);
      }
    }

    if (updateId === this.pendingUpdateId) {
      // Update signal with appended items - fields and itemOrderSignal derive automatically
      this.trackedItemsSignal.update((current) => [...current, ...newItems]);
    }
  }

  /**
   * Create a tracked item for a single array element.
   * Uses linkedSignal for the index, which automatically updates when itemOrderSignal changes.
   */
  private async createTrackedItem(fieldTree: FieldTree<unknown> | null, index: number): Promise<TrackedArrayItem | undefined> {
    const template = this.fieldTemplate();
    if (!template) {
      return undefined;
    }

    try {
      const componentType = await this.fieldRegistry.loadTypeComponent(template.type);
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

      // Create the component and get the injector
      const { componentRef, injector } = this.createComponentWithInjector(
        componentType as Type<FormUiControl>,
        fieldTree,
        template,
        indexSignal,
      );

      // Get current value for this item to create snapshot
      const arrayKey = this.field().key;
      const currentValue = this.parentFieldSignalContext.value() as Partial<TModel>;
      const arrayValue = this.getArrayValue(currentValue, arrayKey);
      const itemValue = arrayValue[index];

      return {
        id: itemId,
        componentRef,
        injector,
        valueSnapshot: createValueSnapshot(itemValue),
      };
    } catch (error) {
      if (!this.destroyRef.destroyed) {
        console.error(
          `[Dynamic Forms] Failed to load component for field type '${template.type}' at index ${index} ` +
            `within array '${this.field().key}'. Ensure the field type is registered in your field registry.`,
          error,
        );
      }
      return undefined;
    }
  }

  /**
   * Create a component and its injector for an array item.
   * Returns both the componentRef and the injector for tracking.
   */
  private createComponentWithInjector(
    componentType: Type<FormUiControl>,
    fieldTree: FieldTree<unknown> | null,
    template: FieldDef<unknown>,
    indexSignal: Signal<number>,
  ): { componentRef: ComponentRef<FormUiControl>; injector: Injector } {
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

    // Map field to bindings using the scoped injector
    const bindings = runInInjectionContext(injector, () => {
      return mapFieldToBindings(template, this.rawFieldRegistry());
    });

    const componentRef = this.vcr.createComponent(componentType, { bindings, injector });

    return { componentRef, injector };
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

  onFieldsInitialized(): void {
    this.eventBus.dispatch(ComponentInitializedEvent, 'array', this.field().key);
  }
}

export { ArrayFieldComponent };

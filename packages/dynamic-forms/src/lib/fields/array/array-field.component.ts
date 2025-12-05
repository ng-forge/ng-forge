import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input, linkedSignal, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, forkJoin, map, Observable, of } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { AddArrayItemEvent } from '../../events/constants/add-array-item.event';
import { RemoveArrayItemEvent } from '../../events/constants/remove-array-item.event';
import { EventBus } from '../../events/event.bus';
import { FieldSignalContext } from '../../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { getChildrenMap } from '../../utils/form-internals/form-internals';
import {
  checkValuesMatch,
  determineDifferentialOperation,
  getArrayValue,
  ResolvedArrayItem,
} from '../../utils/array-field/array-field.types';
import { resolveArrayItem } from '../../utils/array-field/resolve-array-item';

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

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  /** Field configuration input */
  field = input.required<ArrayField>();
  key = input.required<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /** Memoized field registry raw access */
  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  /**
   * Get the field template from the array field definition.
   * This template is used when adding new items dynamically.
   */
  private readonly fieldTemplate = computed<FieldDef<unknown> | null>(() => {
    const arrayField = this.field();
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

  /**
   * Get the array of FieldTree objects from the parent form.
   * Signal Forms automatically creates FieldTree for each array item.
   */
  private readonly arrayFieldTrees = computed<readonly (FieldTree<unknown> | null)[]>(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form();
    const arrayValue = getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    if (arrayValue.length === 0) return [];

    const childrenMap = getChildrenMap(parentForm);
    let innerChildrenMap: Map<string, FieldTree<unknown>> | null = null;

    if (childrenMap) {
      const arrayFieldTree = childrenMap.get(arrayKey);
      if (arrayFieldTree) {
        innerChildrenMap = getChildrenMap(arrayFieldTree);
      }
    }

    const items: (FieldTree<unknown> | null)[] = [];
    for (let i = 0; i < arrayValue.length; i++) {
      items.push(innerChildrenMap?.get(String(i)) ?? null);
    }

    return items;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  /** Source of truth: resolved array items with stable identity for declarative rendering */
  private readonly resolvedItemsSignal = signal<ResolvedArrayItem[]>([]);

  /**
   * Update version signal for tracking async operation currency.
   * When a new update starts, this is incremented. Completed operations
   * check against current value to determine if results should be applied.
   */
  private readonly updateVersion = signal(0);

  /** Derived signal containing the ordered item IDs (string UUIDs) */
  private readonly itemOrderSignal = linkedSignal(() => this.resolvedItemsSignal().map((item) => item.id));

  /** Resolved items for declarative rendering in template */
  readonly resolvedItems = linkedSignal(() => this.resolvedItemsSignal());

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects - Declarative side effects as class fields
  // ─────────────────────────────────────────────────────────────────────────────

  /** Effect that performs differential updates when arrayFieldTrees changes */
  private readonly syncFieldsOnArrayChange = explicitEffect([this.arrayFieldTrees], ([fieldTrees]) => {
    // Increment version to invalidate any in-flight operations
    this.updateVersion.update((v) => v + 1);
    const currentVersion = this.updateVersion();
    this.performDifferentialUpdate(fieldTrees, currentVersion);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Subscriptions - Event handlers as class fields
  // ─────────────────────────────────────────────────────────────────────────────

  /** Handles add array item events */
  private readonly handleAddItem = this.eventBus
    .on<AddArrayItemEvent>('add-array-item')
    .pipe(
      takeUntilDestroyed(),
      filter((event) => event.arrayKey === this.key()),
    )
    .subscribe((event) => this.addItem(event.field ?? this.fieldTemplate(), event.index));

  /** Handles remove array item events */
  private readonly handleRemoveItem = this.eventBus
    .on<RemoveArrayItemEvent>('remove-array-item')
    .pipe(
      takeUntilDestroyed(),
      filter((event) => event.arrayKey === this.key()),
    )
    .subscribe((event) => this.removeItem(event.index));

  // ─────────────────────────────────────────────────────────────────────────────
  // Differential Update Operations
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Perform differential update of array items.
   * Uses value comparison to detect append/pop vs middle operations.
   */
  private performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    const resolvedItems = this.resolvedItemsSignal();
    const arrayKey = this.field().key;
    const currentArrayValue = getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    const operation = determineDifferentialOperation(resolvedItems, fieldTrees.length, currentArrayValue, (newValues, count) =>
      checkValuesMatch(resolvedItems, newValues, count),
    );

    switch (operation.type) {
      case 'clear':
        this.resolvedItemsSignal.set([]);
        break;
      case 'initial':
        this.resolveAllItems(fieldTrees, updateId);
        break;
      case 'append':
        this.appendItems(fieldTrees, operation.startIndex, operation.endIndex, updateId);
        break;
      case 'pop':
        this.resolvedItemsSignal.set(resolvedItems.slice(0, operation.newLength));
        break;
      case 'recreate':
        this.resolvedItemsSignal.set([]);
        this.resolveAllItems(fieldTrees, updateId);
        break;
      case 'none':
        // No update needed
        break;
    }
  }

  /** Resolve all items from scratch (initial render) */
  private resolveAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    if (fieldTrees.length === 0) {
      this.resolvedItemsSignal.set([]);
      return;
    }

    const itemObservables = fieldTrees.map((fieldTree, i) => this.createResolveItemObservable(fieldTree, i));

    forkJoin(itemObservables)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined)),
      )
      .subscribe((newItems) => {
        if (updateId === this.updateVersion()) {
          this.resolvedItemsSignal.set(newItems);
          emitComponentInitialized(this.eventBus, 'array', this.field().key, this.parentInjector);
        }
      });
  }

  /** Append new items to the end of the array */
  private appendItems(fieldTrees: readonly (FieldTree<unknown> | null)[], startIndex: number, endIndex: number, updateId: number): void {
    const itemsToResolve = fieldTrees.slice(startIndex, endIndex);
    if (itemsToResolve.length === 0) return;

    const itemObservables = itemsToResolve.map((fieldTree, i) => this.createResolveItemObservable(fieldTree, startIndex + i));

    forkJoin(itemObservables)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined)),
      )
      .subscribe((newItems) => {
        if (updateId === this.updateVersion()) {
          this.resolvedItemsSignal.update((current) => [...current, ...newItems]);
        }
      });
  }

  /** Creates an observable for resolving a single array item */
  private createResolveItemObservable(fieldTree: FieldTree<unknown> | null, index: number): Observable<ResolvedArrayItem | undefined> {
    const template = this.fieldTemplate();
    if (!template) return of(undefined);

    return resolveArrayItem({
      fieldTree,
      index,
      template,
      arrayField: this.field(),
      itemOrderSignal: this.itemOrderSignal,
      parentFieldSignalContext: this.parentFieldSignalContext,
      parentInjector: this.parentInjector,
      registry: this.rawFieldRegistry(),
      destroyRef: this.destroyRef,
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Array Manipulation Methods
  // ─────────────────────────────────────────────────────────────────────────────

  /** Add a new item to the array */
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
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    const value = getFieldDefaultValue(fieldTemplate, this.rawFieldRegistry());
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  /** Remove an item from the array */
  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const formObject = this.parentFieldSignalContext.form();
    const currentValue = formObject.value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    const removeIndex = index !== undefined ? Math.min(index, currentArray.length - 1) : currentArray.length - 1;
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    formObject.value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }
}

export { ArrayFieldComponent };

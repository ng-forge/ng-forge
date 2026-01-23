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
import { getFieldValueHandling } from '../../models/field-type';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { AddArrayItemEvent } from '../../events/constants/add-array-item.event';
import { RemoveArrayItemEvent } from '../../events/constants/remove-array-item.event';
import { EventBus } from '../../events/event.bus';
import { FieldSignalContext } from '../../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { determineDifferentialOperation, getArrayValue, ResolvedArrayItem } from '../../utils/array-field/array-field.types';
import { resolveArrayItem } from '../../utils/array-field/resolve-array-item';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ArrayFieldTree } from '../../core/field-tree-utils';
import { isEqual } from '../../utils/object-utils';

/**
 * Container component for rendering dynamic arrays of fields.
 *
 * Supports add/remove operations via AddArrayItemEvent and RemoveArrayItemEvent.
 * Uses differential updates to optimize rendering - only recreates items when necessary.
 * Each item gets a scoped injector with ARRAY_CONTEXT for position-aware operations.
 */
@Component({
  selector: 'array-field',
  imports: [NgComponentOutlet],
  template: `
    @for (item of resolvedItems(); track item.id) {
      <ng-container *ngComponentOutlet="item.component; injector: item.injector; inputs: item.inputs()" />
    }
  `,
  styleUrl: './array-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ArrayFieldComponent<TModel extends Record<string, unknown> = Record<string, unknown>> {
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly parentInjector = inject(Injector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<ArrayField>();
  key = input.required<string>();
  className = input<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  readonly hostClasses = computed(() => {
    const base = 'df-field df-array';
    const custom = this.className();
    return custom ? `${base} ${custom}` : base;
  });

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  private readonly fieldTemplate = computed<FieldDef<unknown> | null>(() => {
    const arrayField = this.field();
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

  private readonly arrayFieldTrees = computed<readonly (FieldTree<unknown> | null)[]>(() => {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const arrayValue = getArrayValue(this.parentFieldSignalContext.value(), arrayKey);

    if (arrayValue.length === 0) return [];

    const arrayFieldTree = (parentForm as Record<string, ArrayFieldTree<unknown>>)[arrayKey];
    if (!arrayFieldTree) return arrayValue.map(() => null);

    // Access array items via bracket notation - Angular Signal Forms arrays support this
    const items: (FieldTree<unknown> | null)[] = [];
    for (let i = 0; i < arrayValue.length; i++) {
      // Access item FieldTree directly via numeric indexing (ArrayFieldTree supports this)
      const itemFieldTree = arrayFieldTree[i];
      items.push(itemFieldTree ?? null);
    }

    return items;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // State Signals
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly resolvedItemsSignal = signal<ResolvedArrayItem[]>([]);
  private readonly updateVersion = signal(0);
  private readonly itemOrderSignal = linkedSignal(() => this.resolvedItemsSignal().map((item) => item.id), {
    debugName: 'ArrayFieldComponent.itemOrderSignal',
    equal: isEqual,
  });

  readonly resolvedItems = linkedSignal(() => this.resolvedItemsSignal());

  // ─────────────────────────────────────────────────────────────────────────────
  // Constructor
  // ─────────────────────────────────────────────────────────────────────────────

  constructor() {
    this.setupEffects();
    this.setupEventHandlers();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private setupEffects(): void {
    // Sync field components when array data changes
    explicitEffect([this.arrayFieldTrees], ([fieldTrees]) => {
      this.updateVersion.update((v) => v + 1);
      const currentVersion = this.updateVersion();
      this.performDifferentialUpdate(fieldTrees, currentVersion);
    });
  }

  private setupEventHandlers(): void {
    // Handle add item events
    this.eventBus
      .on<AddArrayItemEvent>('add-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === this.key()),
      )
      .subscribe((event) => this.addItem(event.field ?? this.fieldTemplate(), event.index));

    // Handle remove item events
    this.eventBus
      .on<RemoveArrayItemEvent>('remove-array-item')
      .pipe(
        takeUntilDestroyed(),
        filter((event) => event.arrayKey === this.key()),
      )
      .subscribe((event) => this.removeItem(event.index));
  }

  private performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    const resolvedItems = this.resolvedItemsSignal();
    const operation = determineDifferentialOperation(resolvedItems, fieldTrees.length);

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
        break;
    }
  }

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

  private addItem(fieldTemplate: FieldDef<unknown> | null, index?: number): void {
    if (!fieldTemplate) {
      this.logger.error(
        `Cannot add item to array '${this.field().key}': no field template provided. ` +
          'Ensure the array field has a fields property with at least one field definition.',
      );
      return;
    }

    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    const rawValue = getFieldDefaultValue(fieldTemplate, this.rawFieldRegistry());
    const valueHandling = getFieldValueHandling(fieldTemplate.type, this.rawFieldRegistry());

    // For fields with 'include' value handling (bare fields like input, checkbox, etc.),
    // wrap the value in an object using the field's key since arrays contain objects
    const value = valueHandling === 'include' && fieldTemplate.key ? { [fieldTemplate.key]: rawValue } : rawValue;

    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);

    // Update the parent form with the new array value
    // The `as any` is required due to Angular Signal Forms' complex conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    const removeIndex = index !== undefined ? Math.min(index, currentArray.length - 1) : currentArray.length - 1;
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update the parent form with the new array value
    // The `as any` is required due to Angular Signal Forms' complex conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }
}

export { ArrayFieldComponent };

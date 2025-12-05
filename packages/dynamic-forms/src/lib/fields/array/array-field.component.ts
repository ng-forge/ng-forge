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
  // ─────────────────────────────────────────────────────────────────────────────
  // Dependencies
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly destroyRef = inject(DestroyRef);
  private readonly fieldRegistry = injectFieldRegistry();
  private readonly parentFieldSignalContext = inject(FIELD_SIGNAL_CONTEXT) as FieldSignalContext<TModel>;
  private readonly parentInjector = inject(Injector);
  private readonly eventBus = inject(EventBus);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<ArrayField>();
  key = input.required<string>();

  // ─────────────────────────────────────────────────────────────────────────────
  // Computed Signals
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly rawFieldRegistry = computed(() => this.fieldRegistry.raw);

  private readonly fieldTemplate = computed<FieldDef<unknown> | null>(() => {
    const arrayField = this.field();
    return arrayField.fields && arrayField.fields.length > 0 ? arrayField.fields[0] : null;
  });

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

  private readonly resolvedItemsSignal = signal<ResolvedArrayItem[]>([]);
  private readonly updateVersion = signal(0);
  private readonly itemOrderSignal = linkedSignal(() => this.resolvedItemsSignal().map((item) => item.id));

  readonly resolvedItems = linkedSignal(() => this.resolvedItemsSignal());

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly syncFieldsOnArrayChange = explicitEffect([this.arrayFieldTrees], ([fieldTrees]) => {
    this.updateVersion.update((v) => v + 1);
    const currentVersion = this.updateVersion();
    this.performDifferentialUpdate(fieldTrees, currentVersion);
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  private readonly handleAddItem = this.eventBus
    .on<AddArrayItemEvent>('add-array-item')
    .pipe(
      takeUntilDestroyed(),
      filter((event) => event.arrayKey === this.key()),
    )
    .subscribe((event) => this.addItem(event.field ?? this.fieldTemplate(), event.index));

  private readonly handleRemoveItem = this.eventBus
    .on<RemoveArrayItemEvent>('remove-array-item')
    .pipe(
      takeUntilDestroyed(),
      filter((event) => event.arrayKey === this.key()),
    )
    .subscribe((event) => this.removeItem(event.index));

  // ─────────────────────────────────────────────────────────────────────────────
  // Private Methods
  // ─────────────────────────────────────────────────────────────────────────────

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

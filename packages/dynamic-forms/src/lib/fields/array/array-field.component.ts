import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input, linkedSignal, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField } from '../../definitions/default/array-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { getFieldValueHandling } from '../../models/field-type';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { EventBus } from '../../events/event.bus';
import { FieldSignalContext } from '../../mappers/types';
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { determineDifferentialOperation, getArrayValue, ResolvedArrayItem } from '../../utils/array-field/array-field.types';
import { resolveArrayItem } from '../../utils/array-field/resolve-array-item';
import { observeArrayActions } from '../../utils/array-field/array-event-handler';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ArrayFieldTree } from '../../core/field-tree-utils';

/**
 * Container component for rendering dynamic arrays of fields.
 *
 * Supports add/remove operations via the arrayEvent() builder API.
 * Uses differential updates to optimize rendering - only recreates items when necessary.
 * Each item gets a scoped injector with ARRAY_CONTEXT for position-aware operations.
 * Supports multiple sibling fields per array item (e.g., name + email without a wrapper).
 */
@Component({
  selector: 'array-field',
  imports: [NgComponentOutlet],
  template: `
    @for (item of resolvedItems(); track item.id) {
      @for (field of item.fields; track $index) {
        <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
      }
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

  /** All field templates for array items (supports multiple sibling fields). */
  private readonly fieldTemplates = computed<FieldDef<unknown>[]>(() => {
    const arrayField = this.field();
    return (arrayField.fields as FieldDef<unknown>[]) || [];
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
  private readonly itemOrderSignal = linkedSignal(() => this.resolvedItemsSignal().map((item) => item.id));

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
    observeArrayActions(this.eventBus, () => this.key())
      .pipe(takeUntilDestroyed())
      .subscribe((action) => {
        if (action.action === 'add') {
          if (!action.template || action.template.length === 0) {
            this.logger.error(
              `Cannot add item to array '${this.key()}': template is required. ` +
                'Provide a template in the event or addArrayItem button configuration.',
            );
            return;
          }
          void this.handleAddFromEvent(action.template, action.index);
        } else {
          this.removeItem(action.index);
        }
      });
  }

  /**
   * Handles add operations from events (append, prepend, insert).
   * Creates resolved items FIRST, then updates form value.
   * This ensures prepend/insert work correctly - differential update sees "none"
   * because resolved items count already matches the new array length.
   */
  private async handleAddFromEvent(templates: FieldDef<unknown>[], index?: number): Promise<void> {
    if (templates.length === 0) {
      this.logger.error(
        `Cannot add item to array '${this.field().key}': no field templates provided. ` +
          'Ensure the array field has a fields property or the event has a template.',
      );
      return;
    }

    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const insertIndex = index !== undefined ? Math.min(index, currentArray.length) : currentArray.length;

    // Compute default value by merging all template defaults
    let value: unknown = {};
    for (const template of templates) {
      const rawValue = getFieldDefaultValue(template, this.rawFieldRegistry());
      const valueHandling = getFieldValueHandling(template.type, this.rawFieldRegistry());
      const isContainer = template.type === 'group' || template.type === 'row';

      if (isContainer) {
        value = { ...(value as Record<string, unknown>), ...(rawValue as Record<string, unknown>) };
      } else if (valueHandling === 'include' && template.key) {
        value = { ...(value as Record<string, unknown>), [template.key]: rawValue };
      }
    }

    // Increment version and create resolved item BEFORE updating value
    this.updateVersion.update((v) => v + 1);
    const currentVersion = this.updateVersion();

    // Resolve the new item
    const resolvedItem = await firstValueFrom(
      resolveArrayItem({
        fieldTree: null,
        index: insertIndex,
        templates,
        arrayField: this.field(),
        itemOrderSignal: this.itemOrderSignal,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
        explicitDefaultValue: value,
      }).pipe(
        catchError((error) => {
          this.logger.error(`Failed to resolve array item at index ${insertIndex}:`, error);
          return of(undefined);
        }),
      ),
    );

    if (currentVersion !== this.updateVersion() || !resolvedItem) {
      return;
    }

    // Insert resolved item at correct position
    this.resolvedItemsSignal.update((current) => {
      const newItems = [...current];
      newItems.splice(insertIndex, 0, resolvedItem);
      return newItems;
    });

    // Update form value - differential update sees "none" (lengths match)
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  private performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): void {
    const resolvedItems = this.resolvedItemsSignal();
    const operation = determineDifferentialOperation(resolvedItems, fieldTrees.length);

    switch (operation.type) {
      case 'clear':
        this.resolvedItemsSignal.set([]);
        break;
      case 'initial':
        void this.resolveAllItems(fieldTrees, updateId);
        break;
      case 'append':
        void this.appendItems(fieldTrees, operation.startIndex, operation.endIndex, updateId);
        break;
      case 'pop':
        this.resolvedItemsSignal.set(resolvedItems.slice(0, operation.newLength));
        break;
      case 'recreate':
        this.resolvedItemsSignal.set([]);
        void this.resolveAllItems(fieldTrees, updateId);
        break;
      case 'none':
        break;
    }
  }

  private async resolveAllItems(fieldTrees: readonly (FieldTree<unknown> | null)[], updateId: number): Promise<void> {
    if (fieldTrees.length === 0) {
      this.resolvedItemsSignal.set([]);
      return;
    }

    // Wrap each item observable to catch individual errors
    const safeItemObservables = fieldTrees.map((fieldTree, i) =>
      this.createResolveItemObservable(fieldTree, i).pipe(
        catchError((error) => {
          this.logger.error(`Failed to resolve array item at index ${i}:`, error);
          return of(undefined);
        }),
      ),
    );

    try {
      const items = await firstValueFrom(
        forkJoin(safeItemObservables).pipe(map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined))),
      );

      if (updateId === this.updateVersion()) {
        this.resolvedItemsSignal.set(items);
        emitComponentInitialized(this.eventBus, 'array', this.field().key, this.parentInjector);
      }
    } catch (err) {
      this.logger.error('Failed to resolve array items:', err);
      this.resolvedItemsSignal.set([]);
    }
  }

  private async appendItems(
    fieldTrees: readonly (FieldTree<unknown> | null)[],
    startIndex: number,
    endIndex: number,
    updateId: number,
  ): Promise<void> {
    const itemsToResolve = fieldTrees.slice(startIndex, endIndex);
    if (itemsToResolve.length === 0) return;

    // Wrap each item observable to catch individual errors
    const safeItemObservables = itemsToResolve.map((fieldTree, i) => {
      const index = startIndex + i;
      return this.createResolveItemObservable(fieldTree, index).pipe(
        catchError((error) => {
          this.logger.error(`Failed to resolve array item at index ${index}:`, error);
          return of(undefined);
        }),
      );
    });

    try {
      const newItems = await firstValueFrom(
        forkJoin(safeItemObservables).pipe(map((items) => items.filter((item): item is ResolvedArrayItem => item !== undefined))),
      );

      if (updateId === this.updateVersion()) {
        this.resolvedItemsSignal.update((current) => [...current, ...newItems]);
      }
    } catch (err) {
      this.logger.error('Failed to append array items:', err);
    }
  }

  private createResolveItemObservable(fieldTree: FieldTree<unknown> | null, index: number): Observable<ResolvedArrayItem | undefined> {
    const templates = this.fieldTemplates();
    if (templates.length === 0) return of(undefined);

    return resolveArrayItem({
      fieldTree,
      index,
      templates,
      arrayField: this.field(),
      itemOrderSignal: this.itemOrderSignal,
      parentFieldSignalContext: this.parentFieldSignalContext,
      parentInjector: this.parentInjector,
      registry: this.rawFieldRegistry(),
      destroyRef: this.destroyRef,
      loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
    });
  }

  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    // When index is provided, validate it's within bounds. Out-of-bounds is a no-op.
    // When index is undefined, remove the last item (pop behavior).
    const removeIndex = index !== undefined ? index : currentArray.length - 1;

    // Ignore out-of-bounds indices - they should be a no-op, not remove the last item
    if (removeIndex < 0 || removeIndex >= currentArray.length) return;

    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // Update the parent form with the new array value
    // The `as any` is required due to Angular Signal Forms' complex conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }
}

export { ArrayFieldComponent };

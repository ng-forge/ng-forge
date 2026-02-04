import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Injector, input, linkedSignal, signal } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField, ArrayItemTemplate } from '../../definitions/default/array-field';
import { isGroupField } from '../../definitions/default/group-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { getFieldValueHandling } from '../../models/field-type';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { EventBus } from '../../events/event.bus';
import { FieldSignalContext } from '../../mappers/types';
import { ARRAY_TEMPLATE_REGISTRY, FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
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
  providers: [
    // Each array gets its own template registry to track templates used for dynamically added items
    { provide: ARRAY_TEMPLATE_REGISTRY, useFactory: () => new Map<string, FieldDef<unknown>[]>() },
  ],
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
  private readonly templateRegistry = inject(ARRAY_TEMPLATE_REGISTRY);

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

  /**
   * Gets the item templates (field definitions) for the array.
   * Each element is an array of fields that define one array item's structure.
   */
  private readonly itemTemplates = computed<ArrayItemTemplate[]>(() => {
    const arrayField = this.field();
    return (arrayField.fields as ArrayItemTemplate[]) || [];
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
      this.performDifferentialUpdate(fieldTrees);
    });
  }

  private setupEventHandlers(): void {
    observeArrayActions(this.eventBus, () => this.key())
      .pipe(takeUntilDestroyed())
      .subscribe((action) => {
        if (action.action === 'add') {
          if (!action.template || action.template.length === 0) {
            this.logger.error(
              `Cannot add item to array '${this.key()}': template is REQUIRED. ` +
                'Buttons must specify an explicit template property. ' +
                'There is no default template - each add operation must provide its own.',
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
          'Buttons must specify an explicit template property when adding array items.',
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
        if (isGroupField(template)) {
          // Groups wrap their fields under the group key
          value = { ...(value as Record<string, unknown>), [template.key]: rawValue };
        } else {
          // Rows flatten their fields directly
          value = { ...(value as Record<string, unknown>), ...(rawValue as Record<string, unknown>) };
        }
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

    // Store the template used for this item so it can be re-used during recreate operations
    this.templateRegistry.set(resolvedItem.id, templates);

    // Insert resolved item at correct position
    this.resolvedItemsSignal.update((current) => {
      const newItems = [...current];
      newItems.splice(insertIndex, 0, resolvedItem);
      return newItems;
    });

    // Update form value - differential update sees "none" (lengths match)
    const newArray = [...currentArray];
    newArray.splice(insertIndex, 0, value);
    // The `as any` is required because Angular Signal Forms uses complex conditional types
    // that cannot infer the correct type when setting a dynamically-keyed property
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }

  private performDifferentialUpdate(fieldTrees: readonly (FieldTree<unknown> | null)[]): void {
    const resolvedItems = this.resolvedItemsSignal();
    const operation = determineDifferentialOperation(resolvedItems, fieldTrees.length);

    // Only increment version for operations that do actual work.
    // "none" operations (value-only changes) should not interfere with async add operations.
    if (operation.type === 'none') {
      return;
    }

    this.updateVersion.update((v) => v + 1);
    const currentVersion = this.updateVersion();

    switch (operation.type) {
      case 'clear':
        // Clean up template registry when all items are removed
        this.templateRegistry.clear();
        this.resolvedItemsSignal.set([]);
        break;
      case 'initial':
        void this.resolveAllItems(fieldTrees, currentVersion);
        break;
      case 'append':
        void this.appendItems(fieldTrees, operation.startIndex, operation.endIndex, currentVersion);
        break;
      case 'recreate': {
        // Before clearing, capture templates by position for items beyond defined templates.
        // This allows dynamically added items to be recreated with their original templates.
        const itemTemplates = this.itemTemplates();
        const positionalTemplates: (FieldDef<unknown>[] | undefined)[] = resolvedItems.map((item, idx) => {
          // For items within the defined templates range, use the config directly
          if (idx < itemTemplates.length) {
            return undefined; // Will use itemTemplates[idx] during resolve
          }
          // For dynamically added items, look up their stored template
          return this.templateRegistry.get(item.id);
        });

        this.resolvedItemsSignal.set([]);
        void this.resolveAllItems(fieldTrees, currentVersion, positionalTemplates);
        break;
      }
    }
  }

  private async resolveAllItems(
    fieldTrees: readonly (FieldTree<unknown> | null)[],
    updateId: number,
    positionalTemplates?: (FieldDef<unknown>[] | undefined)[],
  ): Promise<void> {
    if (fieldTrees.length === 0) {
      this.resolvedItemsSignal.set([]);
      return;
    }

    // Wrap each item observable to catch individual errors
    const safeItemObservables = fieldTrees.map((fieldTree, i) =>
      this.createResolveItemObservable(fieldTree, i, positionalTemplates?.[i]).pipe(
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
        // Update template registry with new item IDs for dynamically added items
        if (positionalTemplates) {
          // Clean up old entries and add new ones
          const newItemIds = new Set(items.map((item) => item.id));
          for (const existingId of this.templateRegistry.keys()) {
            if (!newItemIds.has(existingId)) {
              this.templateRegistry.delete(existingId);
            }
          }
          items.forEach((item, idx) => {
            const template = positionalTemplates[idx];
            if (template) {
              this.templateRegistry.set(item.id, template);
            }
          });
        }
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

  /**
   * Creates an observable that resolves a single array item.
   *
   * Template resolution order:
   * 1. Use overrideTemplate if provided (from recreate with stored templates)
   * 2. Use itemTemplates[index] if within defined templates range
   * 3. Return undefined (item cannot be resolved without a template)
   */
  private createResolveItemObservable(
    fieldTree: FieldTree<unknown> | null,
    index: number,
    overrideTemplate?: FieldDef<unknown>[],
  ): Observable<ResolvedArrayItem | undefined> {
    const itemTemplates = this.itemTemplates();

    // Priority 1: Use override template (from recreate with stored templates)
    if (overrideTemplate && overrideTemplate.length > 0) {
      return resolveArrayItem({
        fieldTree,
        index,
        templates: overrideTemplate,
        arrayField: this.field(),
        itemOrderSignal: this.itemOrderSignal,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      });
    }

    // Priority 2: Use defined template at this index
    const templates = itemTemplates[index];
    if (templates && templates.length > 0) {
      return resolveArrayItem({
        fieldTree,
        index,
        templates: templates as FieldDef<unknown>[],
        arrayField: this.field(),
        itemOrderSignal: this.itemOrderSignal,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
      });
    }

    // No template available - this shouldn't happen in normal operation.
    // Dynamically added items should always have their template stored in the registry.
    this.logger.warn(
      `No template found for array item at index ${index}. ` +
        'This may indicate a bug - dynamically added items should have their templates stored.',
    );
    return of(undefined);
  }

  /**
   * Handles remove operations from events (pop, shift, removeAt).
   * Updates resolvedItems FIRST, then form value - this ensures differential
   * update sees "none" (lengths match) and avoids unnecessary recreates.
   * Remaining items' linkedSignal indices auto-update via itemOrderSignal.
   */
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

    // Update resolvedItems FIRST - remove the item at the specified index.
    // This ensures differential update sees "none" (lengths already match).
    // Remaining items' linkedSignal indices auto-update via itemOrderSignal.
    const removedItem = this.resolvedItemsSignal()[removeIndex];
    if (removedItem) {
      this.templateRegistry.delete(removedItem.id);
    }
    this.resolvedItemsSignal.update((current) => {
      const newItems = [...current];
      newItems.splice(removeIndex, 1);
      return newItems;
    });

    // Update the parent form with the new array value
    const newArray = [...currentArray];
    newArray.splice(removeIndex, 1);

    // The `as any` is required due to Angular Signal Forms' complex conditional types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
  }
}

export { ArrayFieldComponent };

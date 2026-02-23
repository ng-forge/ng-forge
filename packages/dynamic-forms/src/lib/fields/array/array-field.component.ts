import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  Injector,
  input,
  linkedSignal,
  Signal,
  signal,
} from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { explicitEffect } from 'ngxtension/explicit-effect';
import { ArrayField, ArrayItemDefinition, ArrayItemTemplate } from '../../definitions/default/array-field';
import { isGroupField } from '../../definitions/default/group-field';
import { injectFieldRegistry } from '../../utils/inject-field-registry/inject-field-registry';
import { FieldTree } from '@angular/forms/signals';
import { FieldDef } from '../../definitions/base/field-def';
import { getFieldDefaultValue } from '../../utils/default-value/default-value';
import { getFieldValueHandling } from '../../models/field-type';
import { emitComponentInitialized } from '../../utils/emit-initialization/emit-initialization';
import { EventBus } from '../../events/event.bus';
import { FieldSignalContext } from '../../mappers/types';
import {
  ARRAY_ITEM_ID_GENERATOR,
  ARRAY_TEMPLATE_REGISTRY,
  createArrayItemIdGenerator,
  FIELD_SIGNAL_CONTEXT,
} from '../../models/field-signal-context.token';
import { determineDifferentialOperation, getArrayValue, ResolvedArrayItem } from '../../utils/array-field/array-field.types';
import { resolveArrayItem } from '../../utils/array-field/resolve-array-item';
import { observeArrayActions } from '../../utils/array-field/array-event-handler';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ArrayFieldTree } from '../../core/field-tree-utils';
import { getNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';

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
    @for (item of resolvedItems(); track item.id; let i = $index) {
      <div
        class="df-array-item"
        role="group"
        [attr.aria-label]="'Item ' + (i + 1)"
        [attr.data-array-item-id]="item.id"
        [attr.data-array-item-index]="i"
      >
        @for (field of item.fields; track $index) {
          <ng-container *ngComponentOutlet="field.component; injector: field.injector; inputs: field.inputs()" />
        }
      </div>
    }
  `,
  styleUrl: './array-field.component.scss',
  host: {
    '[class]': 'hostClasses()',
    '[class.df-container-hidden]': 'hidden()',
    '[attr.aria-hidden]': 'hidden() || null',
    '[id]': '`${key()}`',
    '[attr.data-testid]': 'key()',
  },
  providers: [
    // Each array gets its own template registry to track templates used for dynamically added items
    { provide: ARRAY_TEMPLATE_REGISTRY, useFactory: () => new Map<string, FieldDef<unknown>[]>() },
    // Each array gets its own ID generator for SSR hydration compatibility
    { provide: ARRAY_ITEM_ID_GENERATOR, useFactory: createArrayItemIdGenerator },
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
  private readonly generateItemId = inject(ARRAY_ITEM_ID_GENERATOR);

  // ─────────────────────────────────────────────────────────────────────────────
  // Inputs
  // ─────────────────────────────────────────────────────────────────────────────

  field = input.required<ArrayField>();
  key = input.required<string>();
  className = input<string>();
  hidden = input(false);

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
   * Gets the auto-remove button FieldDef from normalization metadata.
   * Set by simplified array normalization for primitive arrays with remove buttons.
   * The button is rendered alongside each item without wrapping in a row,
   * preserving flat primitive form values.
   */
  private readonly autoRemoveButton = computed<FieldDef<unknown> | undefined>(() => {
    const metadata = getNormalizedArrayMetadata(this.field());
    return metadata?.autoRemoveButton;
  });

  /**
   * For primitive array items, the key of the value field template (e.g., 'value').
   * Used to wrap the FormControl in the item context so getFieldTree(key) works.
   * Returns undefined for object arrays (FormGroup items have natural child navigation).
   *
   * Detection order:
   * 1. Normalization metadata (for simplified arrays — always available at normalization time)
   * 2. Existing item definitions (non-empty full-API arrays)
   * 3. Dynamically discovered key from handleAddFromEvent (empty full-API arrays)
   *
   * Uses linkedSignal: recomputes when field() changes, supports manual set()
   * for the dynamic discovery case.
   */
  private readonly primitiveFieldKey = linkedSignal<string | undefined>(() => {
    // Priority 1: Normalization metadata (simplified arrays always have this)
    const metadata = getNormalizedArrayMetadata(this.field());
    if (metadata?.primitiveFieldKey) {
      return metadata.primitiveFieldKey;
    }

    // Priority 2: Existing item definitions (full-API arrays with initial items)
    const definitions = (this.field().fields as ArrayItemDefinition[]) || [];
    if (definitions.length > 0 && !Array.isArray(definitions[0])) {
      return (definitions[0] as FieldDef<unknown>).key;
    }

    return undefined;
  });

  /**
   * Gets the item templates (field definitions) for the array.
   * Each element can be either:
   * - A single FieldDef (primitive item) - normalized to [FieldDef]
   * - An array of FieldDefs (object item) - used as-is
   *
   * When auto-remove is configured, the remove button is appended to each item's
   * template list for rendering. This is purely visual — the form schema uses the
   * original primitive item definition (single FieldDef → FormControl → flat value).
   *
   * Returns normalized templates where all items are arrays for consistent handling.
   */
  private readonly itemTemplates = computed<ArrayItemTemplate[]>(() => {
    const arrayField = this.field();
    const definitions = (arrayField.fields as ArrayItemDefinition[]) || [];
    const removeButton = this.autoRemoveButton();

    // Normalize: single FieldDef → [FieldDef], array stays as-is
    // Append auto-remove button if configured (for primitive simplified arrays)
    return definitions.map((def) => {
      const normalized = (Array.isArray(def) ? def : [def]) as ArrayItemTemplate;
      if (removeButton) {
        return [...normalized, removeButton] as unknown as ArrayItemTemplate;
      }
      return normalized;
    });
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

  /**
   * Map of item IDs to their current positions. O(1) lookup vs O(n) indexOf().
   * Used by child linkedSignals to reactively track their position in the array.
   */
  private readonly itemPositionMap = computed(() => {
    const items = this.resolvedItemsSignal();
    return new Map(items.map((item, idx) => [item.id, idx]));
  });

  /** Read-only view of resolved items for template consumption. */
  readonly resolvedItems = computed(() => this.resolvedItemsSignal());

  /**
   * Whether the array has reached its configured maxLength.
   * Exposed as a public signal so add-button components can bind [disabled]="atMaxLength()".
   */
  readonly atMaxLength: Signal<boolean> = computed(() => {
    const maxLength = this.field().maxLength;
    if (maxLength === undefined) return false;
    const arrayKey = this.field().key;
    const currentArray = getArrayValue(this.parentFieldSignalContext.value(), arrayKey);
    return currentArray.length >= maxLength;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Auto-remove Cache
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Caches the result of appending the auto-remove button to template arrays.
   * Keyed by template array reference — cache hits occur during recreate/resolution
   * operations where stored template references are reused. Add operations via
   * handleAddFromEvent always create a fresh `[...template]` copy (line ~277),
   * so each add is a cache miss by design (the spread is needed for mutability).
   */
  private readonly autoRemoveCache = new WeakMap<readonly FieldDef<unknown>[], FieldDef<unknown>[]>();

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
          // Template can be single FieldDef (primitive) or FieldDef[] (object)
          const templates = Array.isArray(action.template) ? action.template : action.template ? [action.template] : [];
          if (templates.length === 0) {
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
   *
   * Supports both primitive (single FieldDef) and object (FieldDef[]) templates.
   */
  private async handleAddFromEvent(template: FieldDef<unknown> | readonly FieldDef<unknown>[], index?: number): Promise<void> {
    // Normalize template to mutable array for consistent handling
    const templates: FieldDef<unknown>[] = Array.isArray(template) ? [...template] : [template];
    const isPrimitiveItem = !Array.isArray(template);

    // Track primitive field key for full-API arrays that start empty.
    // Simplified arrays already have this info from normalization metadata.
    if (isPrimitiveItem && templates[0].key && !this.primitiveFieldKey()) {
      this.primitiveFieldKey.set(templates[0].key);
    }

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

    // Compute default value
    let value: unknown;

    if (isPrimitiveItem) {
      // Primitive item: single field's value is extracted directly
      value = getFieldDefaultValue(templates[0], this.rawFieldRegistry());
    } else {
      // Object item: merge all template defaults into an object
      value = {};
      for (const templateField of templates) {
        const rawValue = getFieldDefaultValue(templateField, this.rawFieldRegistry());
        const valueHandling = getFieldValueHandling(templateField.type, this.rawFieldRegistry());
        const isContainer = templateField.type === 'group' || templateField.type === 'row';

        if (isContainer) {
          if (isGroupField(templateField)) {
            // Groups wrap their fields under the group key
            value = { ...(value as Record<string, unknown>), [templateField.key]: rawValue };
          } else {
            // Rows flatten their fields directly
            value = { ...(value as Record<string, unknown>), ...(rawValue as Record<string, unknown>) };
          }
        } else if (valueHandling === 'include' && templateField.key) {
          value = { ...(value as Record<string, unknown>), [templateField.key]: rawValue };
        }
      }
    }

    // Increment version and create resolved item BEFORE updating value
    this.updateVersion.update((v) => v + 1);
    const currentVersion = this.updateVersion();

    // Append auto-remove button to resolution templates (for rendering only)
    const resolveTemplates = this.withAutoRemove(templates);

    // Resolve the new item
    const resolvedItem = await firstValueFrom(
      resolveArrayItem({
        index: insertIndex,
        templates: resolveTemplates,
        arrayField: this.field(),
        itemPositionMap: this.itemPositionMap,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
        generateItemId: this.generateItemId,
        primitiveFieldKey: isPrimitiveItem ? templates[0].key : undefined,
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
    const safeItemObservables = fieldTrees.map((_, i) =>
      this.createResolveItemObservable(i, positionalTemplates?.[i]).pipe(
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
    const safeItemObservables = itemsToResolve.map((_, i) => {
      const index = startIndex + i;
      return this.createResolveItemObservable(index).pipe(
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
  private createResolveItemObservable(index: number, overrideTemplate?: FieldDef<unknown>[]): Observable<ResolvedArrayItem | undefined> {
    const itemTemplates = this.itemTemplates();
    const primitiveKey = this.primitiveFieldKey();

    // Priority 1: Use override template (from recreate with stored templates)
    if (overrideTemplate && overrideTemplate.length > 0) {
      return resolveArrayItem({
        index,
        templates: this.withAutoRemove(overrideTemplate),
        arrayField: this.field(),
        itemPositionMap: this.itemPositionMap,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
        generateItemId: this.generateItemId,
        primitiveFieldKey: primitiveKey,
      });
    }

    // Priority 2: Use defined template at this index
    const templates = itemTemplates[index];
    if (templates && templates.length > 0) {
      return resolveArrayItem({
        index,
        templates: templates as FieldDef<unknown>[],
        arrayField: this.field(),
        itemPositionMap: this.itemPositionMap,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
        generateItemId: this.generateItemId,
        primitiveFieldKey: primitiveKey,
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
   * Appends the auto-remove button to a templates array for rendering.
   * The button is added for visual rendering only — it doesn't affect the form schema.
   * Original templates are stored in templateRegistry WITHOUT the remove button,
   * so this method is called during resolution to add it dynamically.
   *
   * Uses a WeakMap cache keyed by template array reference. Cache hits occur
   * during recreate/resolution paths where stored templates are reused.
   * Add operations always pass a fresh `[...template]` copy, so they miss
   * the cache intentionally (the copy is needed for mutable item construction).
   */
  private withAutoRemove(templates: FieldDef<unknown>[]): FieldDef<unknown>[] {
    const removeButton = this.autoRemoveButton();
    if (!removeButton) return templates;

    let cached = this.autoRemoveCache.get(templates);
    if (cached) return cached;

    cached = [...templates, removeButton];
    this.autoRemoveCache.set(templates, cached);
    return cached;
  }

  /**
   * Handles remove operations from events (pop, shift, removeAt).
   * Updates resolvedItems FIRST, then form value - this ensures differential
   * update sees "none" (lengths match) and avoids unnecessary recreates.
   * Remaining items' linkedSignal indices auto-update via itemPositionMap.
   */
  private removeItem(index?: number): void {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);

    if (currentArray.length === 0) return;

    // When index is undefined, remove the last item (pop behavior).
    // When index is -1, treat as "last item" (convention matching Array.at(-1)).
    let removeIndex: number;
    if (index === undefined || index === -1) {
      removeIndex = currentArray.length - 1;
    } else if (index < -1 || index >= currentArray.length) {
      this.logger.warn(
        `[Dynamic Forms] removeArrayItem index ${index} is out of bounds for array '${arrayKey}' with length ${currentArray.length}. Operation skipped.`,
      );
      return;
    } else {
      removeIndex = index;
    }

    // Update resolvedItems FIRST - remove the item at the specified index.
    // This ensures differential update sees "none" (lengths already match).
    // Remaining items' linkedSignal indices auto-update via itemPositionMap.
    //
    // When the item is removed from resolvedItemsSignal, the @for loop removes the DOM element
    // and NgComponentOutlet destroys the component view, triggering DestroyRef callbacks.
    // Async validators use Angular's resource API tied to the form-level schema path — when the
    // array value is updated below, the resource's params re-evaluate. If the removed item's path
    // no longer exists, params returns undefined, cancelling the pending validation automatically.
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

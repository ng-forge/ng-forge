import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  EnvironmentInjector,
  inject,
  Injector,
  input,
  linkedSignal,
  Signal,
  signal,
} from '@angular/core';
import { DfFieldOutlet } from '../../directives/df-field-outlet.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, forkJoin, map, Observable, of, tap } from 'rxjs';
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
import { FIELD_SIGNAL_CONTEXT } from '../../models/field-signal-context.token';
import { ArrayItemRegistryService } from '../../core/registry/array-item-registry.service';
import { ArrayFieldStateMachine, RunHandle } from './array-field-state-machine';
import { determineDifferentialOperation, getArrayValue, ResolvedArrayItem } from '../../utils/array-field/array-field.types';
import { resolveArrayItem } from '../../utils/array-field/resolve-array-item';
import { observeArrayActions } from '../../utils/array-field/array-event-handler';
import { DynamicFormLogger } from '../../providers/features/logger/logger.token';
import { ArrayFieldTree } from '../../core/field-tree-utils';
import { getNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';

/**
 * Container component for rendering dynamic arrays of fields.
 *
 * Supports add/remove/move operations via the arrayEvent() builder API.
 * Uses differential updates to optimize rendering - only recreates items when necessary.
 * Each item gets a scoped injector with ARRAY_CONTEXT for position-aware operations.
 * Supports multiple sibling fields per array item (e.g., name + email without a wrapper).
 */
@Component({
  selector: 'array-field',
  imports: [DfFieldOutlet],
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
          @if (!field.hidden()) {
            <ng-container *dfFieldOutlet="field; environmentInjector: environmentInjector" />
          }
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
  protected readonly environmentInjector = inject(EnvironmentInjector);
  private readonly eventBus = inject(EventBus);
  private readonly logger = inject(DynamicFormLogger);
  private readonly arrayItemRegistry = inject(ArrayItemRegistryService);
  // Form-scoped slot keyed by the array's path. Survives this component's lifecycle so that
  // `@if`-gated arrays can be destroyed and recreated without losing dynamically-added items.
  // NOTE: keyed by `field().key` for now — nested arrays with the same key in different scopes
  // would currently collide. Today's per-component-provider model has the same constraint
  // (no nested-array hide/show tests exist). Path-aware keying is a follow-up.
  // `field()` is `input.required`, so the slot reference is resolved lazily.
  private readonly slot = computed(() => this.arrayItemRegistry.slotFor(this.field().key));
  /** @deprecated Use `slot().templates` directly. Kept as a shim while the rest of the file migrates. */
  private get templateRegistry(): Map<string, FieldDef<unknown>[]> {
    return this.slot().templates;
  }
  private generateItemId = (): string => this.slot().nextId();

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
   * Normalized item templates WITHOUT auto-remove button appended.
   * Each element is normalized to an array: single FieldDef → [FieldDef], array stays as-is.
   *
   * Used by moveItem() to stash raw templates into the templateRegistry, preserving
   * the invariant that registry entries are pre-synthesis (withAutoRemove() adds the
   * button during resolution).
   */
  private readonly rawItemTemplates = computed<ArrayItemTemplate[]>(() => {
    const arrayField = this.field();
    const definitions = (arrayField.fields as ArrayItemDefinition[]) || [];

    return definitions.map((def) => {
      return (Array.isArray(def) ? def : [def]) as ArrayItemTemplate;
    });
  });

  /**
   * Resolves the effective fallback template for this array — used when the form
   * value contains an item with no registered template (i.e., items that were
   * neither added via event handlers nor covered by a positional entry in `fields`).
   *
   * Populated from `SimplifiedArrayField.template` via normalization metadata, so every
   * simplified array gets an automatic default. Returns undefined for full-API arrays;
   * `createResolveItemObservable` then falls back to warn-and-drop.
   *
   * Homogeneous arrays only — all fallback items receive the same template.
   */
  private readonly fallbackTemplate = computed<FieldDef<unknown>[] | undefined>(() => {
    const raw = getNormalizedArrayMetadata(this.field())?.template;
    if (!raw) return undefined;
    return (Array.isArray(raw) ? [...raw] : [raw]) as FieldDef<unknown>[];
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
    const raw = this.rawItemTemplates();
    const removeButton = this.autoRemoveButton();

    if (!removeButton) return raw;

    return raw.map((normalized) => {
      return [...normalized, removeButton] as unknown as ArrayItemTemplate;
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
  // Explicit state machine for async resolution + componentInitialized emission.
  // Replaces the prior updateVersion + pendingInitializationCycle + settledInitializationCycle trio.
  private readonly fsm = new ArrayFieldStateMachine();

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

  private readonly allResolvedFieldsRenderReady = computed(() =>
    this.resolvedItems().every((item) => item.fields.every((field) => field.renderReady())),
  );

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

    explicitEffect([this.fsm.state, this.allResolvedFieldsRenderReady], ([, allReady]) => {
      if (this.fsm.shouldEmit(allReady)) {
        emitComponentInitialized(this.eventBus, 'array', this.field().key, this.parentInjector);
      }
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
        } else if (action.action === 'move') {
          this.moveItem(action.fromIndex, action.toIndex);
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
    // Normalize template to mutable array for consistent handling.
    // A single FieldDef with valueHandling: 'flatten' (container, row) is an object item
    // whose children should be flattened — NOT a primitive item. Only true leaf fields
    // (input, checkbox, etc.) are primitive when passed as a single FieldDef.
    const templates: FieldDef<unknown>[] = Array.isArray(template) ? [...template] : [template];
    const isSingleField = !Array.isArray(template);
    const isPrimitiveItem = isSingleField && getFieldValueHandling(templates[0].type, this.rawFieldRegistry()) !== 'flatten';

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
        const isContainer = templateField.type === 'group' || templateField.type === 'row' || templateField.type === 'container';

        if (isContainer) {
          if (isGroupField(templateField)) {
            // Groups wrap their fields under the group key
            value = { ...(value as Record<string, unknown>), [templateField.key]: rawValue };
          } else {
            // Rows and containers flatten their fields directly
            value = { ...(value as Record<string, unknown>), ...(rawValue as Record<string, unknown>) };
          }
        } else if (valueHandling === 'include' && templateField.key) {
          value = { ...(value as Record<string, unknown>), [templateField.key]: rawValue };
        }
      }
    }

    // Dispatch an append run — bumps runId so any in-flight differential update
    // becomes stale, but state stays in its current phase.
    const run = this.fsm.dispatch({ kind: 'append' });

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

    if (run.isStale() || !resolvedItem) {
      return;
    }

    // Store the template used for this item so it can be re-used during recreate operations
    this.templateRegistry.set(resolvedItem.id, templates);
    // Mirror the insert into slot.itemOrder so survival across hide/show stays consistent.
    this.slot().itemOrder.splice(insertIndex, 0, resolvedItem.id);

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

    // "none" operations (value-only changes) don't kick the state machine — they shouldn't
    // interfere with in-flight async resolutions.
    if (operation.type === 'none') {
      return;
    }

    switch (operation.type) {
      case 'clear': {
        // Clean up template registry when all items are removed
        this.templateRegistry.clear();
        this.resolvedItemsSignal.set([]);
        const run = this.fsm.dispatch({ kind: 'clear' });
        // First-ever clear with no items: synthesize a resolve so the emit-effect fires
        // the init pulse (matches the form-starts-empty case from the prior implementation).
        if (resolvedItems.length === 0 && !this.fsm.hasEverEmitted) {
          run.resolve();
        }
        break;
      }
      case 'initial': {
        // If the slot has surviving state from a prior ArrayFieldComponent instance (same
        // form, same array path, just a different render cycle — e.g. an `@if`-gated array
        // that was hidden then re-shown), reuse the stored templates AND ids so dynamically-
        // added items rebuild correctly. When the slot is empty this collapses to a normal
        // initial resolve via Priority 2/3.
        const slot = this.slot();
        const useSurvival = slot.itemOrder.length === fieldTrees.length && fieldTrees.length > 0;
        const positionalTemplates = useSurvival ? slot.itemOrder.map((id) => slot.templates.get(id)) : undefined;
        const existingItemIds = useSurvival ? slot.itemOrder.slice() : undefined;
        const run = this.fsm.dispatch({ kind: 'initial' });
        void this.resolveAllItems(fieldTrees, run, positionalTemplates, existingItemIds);
        break;
      }
      case 'append': {
        const run = this.fsm.dispatch({ kind: 'append' });
        void this.appendItems(fieldTrees, operation.startIndex, operation.endIndex, run);
        break;
      }
      case 'recreate': {
        // Capture templates by item ID so each item is recreated with its original template,
        // even after move operations that change positions. Registry entries (from dynamic adds
        // or moves) take priority over positional itemTemplates lookup.
        const positionalTemplates: (FieldDef<unknown>[] | undefined)[] = resolvedItems.map((item) => {
          // Registry entries (from dynamic adds or moves) take priority;
          // unmoved initial items return undefined → falls through to itemTemplates[idx] during resolve.
          return this.templateRegistry.get(item.id);
        });

        this.resolvedItemsSignal.set([]);
        const run = this.fsm.dispatch({ kind: 'recreate' });
        void this.resolveAllItems(fieldTrees, run, positionalTemplates);
        break;
      }
    }
  }

  private async resolveAllItems(
    fieldTrees: readonly (FieldTree<unknown> | null)[],
    run: RunHandle,
    positionalTemplates?: (FieldDef<unknown>[] | undefined)[],
    existingItemIds?: readonly (string | undefined)[],
  ): Promise<void> {
    if (fieldTrees.length === 0) {
      this.resolvedItemsSignal.set([]);
      return;
    }

    // Wrap each item observable to catch individual errors
    const safeItemObservables = fieldTrees.map((_, i) =>
      this.createResolveItemObservable(i, positionalTemplates?.[i], existingItemIds?.[i]).pipe(
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

      if (!run.isStale()) {
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
        // Mirror the resolved item ids into the slot's itemOrder so a future component
        // recreate (e.g. after an @if hide cycle) can rehydrate via the survival path.
        const slot = this.slot();
        slot.itemOrder.length = 0;
        for (const item of items) slot.itemOrder.push(item.id);
        this.resolvedItemsSignal.set(items);
        // Mark this run settled so the emit-effect can fire componentInitialized once allReady is true.
        run.resolve();
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
    run: RunHandle,
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

      if (!run.isStale()) {
        const slot = this.slot();
        for (const item of newItems) slot.itemOrder.push(item.id);
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
   * 3. Use the simplified-array fallback template (from normalization metadata) for
   *    untracked items present in the form value (e.g., external `value.set`, parent
   *    two-way binding, initial values beyond what was declared via simplified `value`).
   *    Registers the resolved item in templateRegistry so subsequent recreates use
   *    Priority 1.
   * 4. Return undefined (item cannot be resolved without a template)
   */
  private createResolveItemObservable(
    index: number,
    overrideTemplate?: FieldDef<unknown>[],
    existingItemId?: string,
  ): Observable<ResolvedArrayItem | undefined> {
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
        existingItemId,
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
        existingItemId,
        primitiveFieldKey: primitiveKey,
      });
    }

    // Priority 3: Use the metadata fallback template for untracked items in the form value.
    // Homogeneous only — every fallback item receives the same template regardless of value shape.
    const fallback = this.fallbackTemplate();
    if (fallback && fallback.length > 0) {
      return resolveArrayItem({
        index,
        templates: this.withAutoRemove(fallback),
        arrayField: this.field(),
        itemPositionMap: this.itemPositionMap,
        parentFieldSignalContext: this.parentFieldSignalContext,
        parentInjector: this.parentInjector,
        registry: this.rawFieldRegistry(),
        destroyRef: this.destroyRef,
        loadTypeComponent: (type: string) => this.fieldRegistry.loadTypeComponent(type),
        generateItemId: this.generateItemId,
        existingItemId,
        primitiveFieldKey: primitiveKey,
      }).pipe(
        tap((item) => {
          // Register the fallback template against the generated item id so subsequent
          // recreates hit Priority 1 instead of re-resolving via this branch.
          if (item) this.templateRegistry.set(item.id, fallback);
        }),
      );
    }

    // Priority 4: no template available. Full-API arrays are positional by design —
    // `fields` declares one template per item, so values extending past `fields.length`
    // (e.g., from external `value.set`, parent two-way binding, or initial values on a
    // `fields: []` array) have no template to render. Use the simplified array API
    // (`template` + `value`) when you need homogeneous arrays with value-driven items.
    this.logger.warn(
      `No template found for array item at index ${index}. This likely occured for a Full-API array element that was created from the DynamicForm's value being set directly, which is currently not supported. Consider using the simplified array API.`,
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
   * Handles move operations — reorders an existing item without destroying it.
   * Updates resolvedItems and form value atomically. Since the array length
   * doesn't change, `determineDifferentialOperation` returns 'none' and no
   * recreate is triggered. The `@for` loop tracks by `item.id`, so Angular
   * moves the DOM node instead of destroying/recreating. The `itemPositionMap`
   * computed auto-recomputes, propagating new indices to child linkedSignals.
   */
  private moveItem(fromIndex: number, toIndex: number): void {
    const arrayKey = this.field().key;
    const parentForm = this.parentFieldSignalContext.form;
    const currentValue = parentForm().value() as TModel;
    const currentArray = getArrayValue(currentValue as Partial<TModel>, arrayKey);
    const length = currentArray.length;

    if (fromIndex < 0 || fromIndex >= length) {
      this.logger.warn(
        `moveArrayItem fromIndex ${fromIndex} is out of bounds for array '${arrayKey}' with length ${length}. Operation skipped.`,
      );
      return;
    }

    if (toIndex < 0 || toIndex >= length) {
      this.logger.warn(
        `moveArrayItem toIndex ${toIndex} is out of bounds for array '${arrayKey}' with length ${length}. Operation skipped.`,
      );
      return;
    }

    if (fromIndex === toIndex) return;

    // Register raw (pre-auto-remove) templates for all items whose position will change.
    // Initial items use itemTemplates[currentIndex] during recreate, but after
    // a move their position no longer matches their original template. Stashing
    // the template by item ID lets the recreate path resolve the correct one.
    // We use rawItemTemplates (without auto-remove button) because the recreate path
    // calls withAutoRemove() during resolution — storing the synthesized version would
    // cause duplicate remove buttons.
    const rawTemplates = this.rawItemTemplates();
    const currentItems = this.resolvedItemsSignal();
    const lo = Math.min(fromIndex, toIndex);
    const hi = Math.max(fromIndex, toIndex);
    for (let i = lo; i <= hi; i++) {
      const item = currentItems[i];
      if (item && !this.templateRegistry.has(item.id) && i < rawTemplates.length) {
        this.templateRegistry.set(item.id, rawTemplates[i] as FieldDef<unknown>[]);
      }
    }

    // Reorder resolvedItems — splice preserves object identity (no destroy/recreate)
    this.resolvedItemsSignal.update((current) => {
      const newItems = [...current];
      const [moved] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, moved);
      return newItems;
    });
    // Keep slot.itemOrder in sync so the post-recreate survival path sees the moved order.
    this.slot().moveItem(fromIndex, toIndex);

    // Reorder form value array the same way
    const newArray = [...currentArray];
    const [movedValue] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedValue);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parentForm().value.set({ ...currentValue, [arrayKey]: newArray } as any);
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

    // When index is undefined or -1, remove the last item.
    let removeIndex: number;
    if (index === undefined || index === -1) {
      removeIndex = currentArray.length - 1;
    } else if (index < -1 || index >= currentArray.length) {
      this.logger.warn(
        `removeArrayItem index ${index} is out of bounds for array '${arrayKey}' with length ${currentArray.length}. Operation skipped.`,
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
    // Keep slot.itemOrder in sync so the post-recreate survival path doesn't try to
    // restore an id that's no longer in the form value.
    this.slot().removeAt(removeIndex);
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

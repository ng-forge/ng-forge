import { Injectable, signal, WritableSignal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';

/**
 * Per-array durable state. Survives `ArrayFieldComponent` destroy/recreate
 * cycles so a hidden array that's gated with `@if` doesn't lose its dynamically
 * added items when it becomes visible again.
 */
export interface ArraySlot {
  /** Templates keyed by item id. Set on resolution, deleted on item removal. */
  readonly templates: Map<string, FieldDef<unknown>[]>;

  /**
   * Item ids in form-value order. The new `ArrayFieldComponent` reads this on
   * mount to know "the form has N items, with these ids in this order, here
   * are their templates" — without needing the prior component instance.
   */
  readonly itemOrder: string[];

  /**
   * Key of the value field for primitive array items (e.g. 'value'). Discovered
   * lazily — from normalization metadata first, then from existing item
   * definitions, then from the first dynamic-add event. Survives recreate so
   * the discovered key isn't lost when the component dies.
   */
  readonly primitiveFieldKey: WritableSignal<string | undefined>;

  /**
   * Generates a unique item id scoped to this slot's lifetime. Counter is
   * monotonic — never resets except on `clear()` — so new ids never collide
   * with previously-stored templates even across hide↔show.
   */
  nextId(): string;

  /** Sets a template for an item id (used on initial resolve + dynamic add). */
  setTemplate(itemId: string, templates: FieldDef<unknown>[]): void;
  /** Returns the stored template for an item id, or undefined. */
  getTemplate(itemId: string): FieldDef<unknown>[] | undefined;
  /** Whether a template is stored for this id. */
  hasTemplate(itemId: string): boolean;

  /** Records the id at a position in `itemOrder` (append/insert/recreate). */
  setIdAt(index: number, itemId: string): void;
  /** Removes an id from `itemOrder` and deletes its template. */
  removeAt(index: number): void;
  /** Moves an id within `itemOrder` (preserves the same id at the new index). */
  moveItem(fromIndex: number, toIndex: number): void;
  /** Truncates `itemOrder` to the given length, deleting templates beyond it. */
  truncate(length: number): void;
  /** Empties the slot — templates cleared, itemOrder emptied, counter reset, primitiveFieldKey nulled. */
  clear(): void;
}

function createSlot(): ArraySlot {
  let counter = 0;
  const templates = new Map<string, FieldDef<unknown>[]>();
  const itemOrder: string[] = [];
  const primitiveFieldKey = signal<string | undefined>(undefined);

  return {
    templates,
    itemOrder,
    primitiveFieldKey,
    nextId: () => `item-${counter++}`,
    setTemplate(itemId, t) {
      templates.set(itemId, t);
    },
    getTemplate(itemId) {
      return templates.get(itemId);
    },
    hasTemplate(itemId) {
      return templates.has(itemId);
    },
    setIdAt(index, itemId) {
      itemOrder[index] = itemId;
    },
    removeAt(index) {
      const [removed] = itemOrder.splice(index, 1);
      if (removed !== undefined) templates.delete(removed);
    },
    moveItem(fromIndex, toIndex) {
      const [id] = itemOrder.splice(fromIndex, 1);
      if (id !== undefined) itemOrder.splice(toIndex, 0, id);
    },
    truncate(length) {
      const removed = itemOrder.splice(length);
      for (const id of removed) templates.delete(id);
    },
    clear() {
      templates.clear();
      itemOrder.length = 0;
      counter = 0;
      primitiveFieldKey.set(undefined);
    },
  };
}

/**
 * Form-scoped registry of per-array durable state. One slot per array path
 * (e.g. 'members', 'team.members', 'orders.lineItems'). Survives
 * `ArrayFieldComponent` lifecycle, dies with the `DynamicForm`. Cleared on
 * schema swap by the `formSetup` effect in `FormStateManager`.
 */
@Injectable()
export class ArrayItemRegistryService {
  private readonly slots = new Map<string, ArraySlot>();

  /** Get-or-create a slot for the array at the given path. */
  slotFor(arrayPath: string): ArraySlot {
    let slot = this.slots.get(arrayPath);
    if (!slot) {
      slot = createSlot();
      this.slots.set(arrayPath, slot);
    }
    return slot;
  }

  /** Drop all slots — called from the `formSetup` effect on schema change. */
  clearAll(): void {
    for (const slot of this.slots.values()) slot.clear();
    this.slots.clear();
  }
}

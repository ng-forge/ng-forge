import { FormEvent } from '@ng-forge/dynamic-forms/internal';
import { ArrayItemDefinition, ArrayItemTemplate } from '@ng-forge/dynamic-forms/internal';

/**
 * Template type for array items used in events.
 * Canonical definition lives in {@link ArrayItemDefinition} — this alias
 * preserves the events-specific naming convention.
 */
export type ArrayItemDefinitionTemplate = ArrayItemDefinition;

// Re-export the canonical ArrayItemTemplate for backwards-compatible event API surface
export type { ArrayItemTemplate };

/**
 * Event dispatched to append a new item at the END of an array field.
 *
 * @typeParam TTemplate - The type of the template (single field or array of fields)
 */
export class AppendArrayItemEvent<TTemplate extends ArrayItemDefinitionTemplate = ArrayItemDefinitionTemplate> implements FormEvent {
  readonly type = 'append-array-item' as const;

  constructor(
    /** The key of the array field to append an item to */
    public readonly arrayKey: string,
    /**
     * Template for the new array item. REQUIRED.
     * - Single field (FieldDef): Creates a primitive item (field's value is extracted directly)
     * - Array of fields (FieldDef[]): Creates an object item (fields merged into object)
     */
    public readonly template: TTemplate,
  ) {}
}

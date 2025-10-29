import { FieldDef } from '../models/field-config';
import { RowChildField, RowField } from '../definitions/default/row-field';
import { GroupField } from '../definitions/default/group-field';

/**
 * Flattened field definition with layout information
 */
export interface FlattenedField extends FieldDef {
  /** Original field key before flattening */
  readonly originalKey: string;
  /** Layout context for rendering */
  readonly layoutContext?: {
    /** Type of layout container this field belongs to */
    readonly type: 'row' | 'group';
    /** Container identifier for grouping related definitions */
    readonly containerId: string;
    /** Row-specific layout properties */
    readonly row?: {
      readonly gap?: RowField['gap'];
      readonly breakpoints?: RowField['breakpoints'];
      readonly col?: RowChildField['col'];
    };
    /** Group-specific layout properties */
    readonly group?: {
      readonly gap?: GroupField['gap'];
    };
  };
}

/**
 * Flattens field definitions by expanding row and group definitions into individual definitions
 * with appropriate key prefixing and layout context
 */
export function flattenFields(
  fields: readonly FieldDef[],
  keyPrefix = '',
  containerStack: Array<{ type: 'row' | 'group'; id: string; config: RowField | GroupField }> = []
): FlattenedField[] {
  const result: FlattenedField[] = [];

  fields.forEach((field, index) => {
    if (field.type === 'row') {
      const rowField = field as RowField;
      const containerId = `${keyPrefix}row_${index}`;

      // Add row container to stack
      const newStack = [
        ...containerStack,
        {
          type: 'row' as const,
          id: containerId,
          config: rowField,
        },
      ];

      // Flatten child definitions with row context
      const childFields = flattenFields(rowField.fields, keyPrefix, newStack);

      result.push(...childFields);
    } else if (field.type === 'group') {
      const groupField = field as GroupField;
      const containerId = `${keyPrefix}group_${field.key}`;
      const groupKeyPrefix = keyPrefix ? `${keyPrefix}.${field.key}` : field.key;

      // Add group container to stack
      const newStack = [
        ...containerStack,
        {
          type: 'group' as const,
          id: containerId,
          config: groupField,
        },
      ];

      // Flatten child definitions with group key prefix and context
      const childFields = flattenFields(groupField.fields, `${groupKeyPrefix}.`, newStack);

      result.push(...childFields);
    } else {
      // Regular field - create flattened version with layout context
      const fullKey = keyPrefix ? `${keyPrefix}${field.key}` : field.key;
      const rowChildField = field as RowChildField;

      // Find the nearest row and group containers
      const nearestRow = containerStack
        .slice()
        .reverse()
        .find((c) => c.type === 'row');
      const nearestGroup = containerStack
        .slice()
        .reverse()
        .find((c) => c.type === 'group');

      let layoutContext: FlattenedField['layoutContext'] = undefined;

      if (nearestRow || nearestGroup) {
        if (nearestRow) {
          layoutContext = {
            type: 'row',
            containerId: nearestRow.id,
            row: {
              gap: nearestRow.config.type === 'row' ? nearestRow.config.gap : undefined,
              breakpoints: nearestRow.config.type === 'row' ? nearestRow.config.breakpoints : undefined,
              col: rowChildField.col,
            },
          };
        } else if (nearestGroup) {
          layoutContext = {
            type: 'group',
            containerId: nearestGroup.id,
            group: {
              gap: nearestGroup.config.type === 'group' ? nearestGroup.config.gap : undefined,
            },
          };
        }
      }

      const flattenedField: FlattenedField = {
        ...field,
        key: fullKey,
        originalKey: field.key,
        layoutContext,
      };

      result.push(flattenedField);
    }
  });

  return result;
}

/**
 * Groups flattened definitions by their layout containers
 */
export function groupFieldsByContainer(fields: FlattenedField[]): Map<string, FlattenedField[]> {
  const groups = new Map<string, FlattenedField[]>();

  fields.forEach((field) => {
    const containerId = field.layoutContext?.containerId || 'root';

    if (!groups.has(containerId)) {
      groups.set(containerId, []);
    }

    groups.get(containerId)!.push(field);
  });

  return groups;
}

/**
 * Helper to extract layout CSS classes for a field
 */
export function getFieldLayoutClasses(field: FlattenedField): string[] {
  const classes: string[] = [];

  if (field.layoutContext?.type === 'row') {
    classes.push('lib-row-field__item');

    const col = field.layoutContext.row?.col;
    if (col?.span) {
      classes.push(`lib-row-field__col-${col.span}`);
    }
  }

  if (field.layoutContext?.type === 'group') {
    classes.push('lib-group-field__item');
  }

  return classes;
}

/**
 * Helper to extract layout CSS styles for a field
 */
export function getFieldLayoutStyles(field: FlattenedField): Record<string, string> {
  const styles: Record<string, string> = {};

  if (field.layoutContext?.type === 'row') {
    const col = field.layoutContext.row?.col;
    if (col?.span) {
      styles['flex'] = `0 0 calc(${(col.span / 12) * 100}% - var(--row-gap-width, 1rem))`;
    }
  }

  return styles;
}

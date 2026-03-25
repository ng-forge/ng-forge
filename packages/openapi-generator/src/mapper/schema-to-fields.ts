import type { SchemaObject, WalkedProperty } from '../parser/schema-walker.js';
import { walkSchema } from '../parser/schema-walker.js';
import { mapSchemaToFieldType } from './type-mapping.js';
import type { ValidatorConfig } from './validator-mapping.js';
import { mapSchemaToValidators } from './validator-mapping.js';
import { mapDiscriminator } from './discriminator-mapping.js';
import { toLabel, toEnumLabel } from '../utils/naming.js';

function singularize(label: string): string {
  // Only strip trailing 's' if word is 4+ chars and doesn't end in 'ss'
  if (label.length >= 4 && label.endsWith('s') && !label.endsWith('ss')) {
    return label.slice(0, -1);
  }
  return label;
}

export interface LogicConfig {
  type: string;
  condition: Record<string, unknown>;
}

export interface FieldConfig {
  key: string;
  type: string;
  label: string;
  value?: unknown;
  placeholder?: string;
  props?: Record<string, unknown>;
  options?: Array<{ label: string; value: string }>;
  validators?: ValidatorConfig[];
  disabled?: boolean;
  fields?: FieldConfig[];
  template?: FieldConfig | FieldConfig[];
  addButton?: { label: string; props?: Record<string, unknown> } | false;
  removeButton?: { label: string; props?: Record<string, unknown> } | false;
  logic?: LogicConfig[];
}

export interface MappingResult {
  fields: FieldConfig[];
  ambiguousFields: AmbiguousField[];
  warnings: string[];
}

export interface AmbiguousField {
  key: string;
  fieldPath: string;
  currentType: string;
  scope: string;
  alternative: string;
}

export interface MappingOptions {
  editable?: boolean;
  decisions?: Record<string, string>;
  schemaName?: string;
}

export function mapSchemaToFields(schema: SchemaObject, requiredFields: string[], options: MappingOptions = {}): MappingResult {
  const walked = walkSchema(schema, requiredFields);
  const ambiguousFields: AmbiguousField[] = [];
  const warnings = [...walked.warnings];

  // Handle discriminator case
  if (walked.discriminator) {
    const discConfig = mapDiscriminator(walked.discriminator);
    const fields: FieldConfig[] = [discConfig.discriminatorField];

    for (const group of discConfig.conditionalGroups) {
      const variantSchema = walked.discriminator.mapping[group.discriminatorValue];
      if (variantSchema) {
        const variantResult = mapSchemaToFields(variantSchema, variantSchema.required ?? [], {
          ...options,
          schemaName: options.schemaName ? `${options.schemaName}.${group.discriminatorValue}` : group.discriminatorValue,
        });
        const variantFields = variantResult.fields.filter((f) => (f as FieldConfig).key !== walked.discriminator!.propertyName);
        ambiguousFields.push(...variantResult.ambiguousFields);
        warnings.push(...variantResult.warnings);

        // Wrap variant fields in a group with logic for conditional visibility
        if (variantFields.length > 0) {
          fields.push({
            key: `${group.discriminatorValue}Variant`,
            type: 'group',
            label: toEnumLabel(group.discriminatorValue),
            fields: variantFields,
            logic: [
              {
                type: 'hidden',
                condition: {
                  type: 'fieldValue',
                  fieldPath: walked.discriminator.propertyName,
                  operator: 'notEquals',
                  value: group.discriminatorValue,
                },
              },
            ],
          });
        }
      }
    }

    return { fields, ambiguousFields, warnings };
  }

  // Standard properties mapping
  const fields: FieldConfig[] = [];

  for (const prop of walked.properties) {
    const field = mapPropertyToField(prop, options, ambiguousFields, warnings);
    if (field) {
      fields.push(field);
    }
  }

  return { fields, ambiguousFields, warnings };
}

function mapPropertyToField(
  prop: WalkedProperty,
  options: MappingOptions,
  ambiguousFields: AmbiguousField[],
  warnings: string[],
): FieldConfig | undefined {
  // Skip deprecated properties
  if ((prop.schema as Record<string, unknown>)['deprecated']) {
    warnings.push(`Property '${prop.name}' is deprecated and was skipped`);
    return undefined;
  }

  // x-ng-forge-type: bypass type mapping entirely
  const ngForgeType = (prop.schema as Record<string, unknown>)['x-ng-forge-type'] as string | undefined;

  const typeResult = mapSchemaToFieldType(prop.schema);
  const schemaPrefix = options.schemaName ?? '';
  const fieldPath = schemaPrefix ? `${schemaPrefix}.${prop.name}` : prop.name;

  let finalType: string;

  if (ngForgeType) {
    finalType = ngForgeType;
  } else {
    // Check if there's a pre-made decision for this field
    const decision = options.decisions?.[fieldPath];
    finalType = decision ?? typeResult.fieldType;

    // Track ambiguous fields (only if no decision made)
    if (typeResult.isAmbiguous && !decision) {
      ambiguousFields.push({
        key: prop.name,
        fieldPath,
        currentType: typeResult.fieldType,
        scope: typeResult.ambiguousScope!,
        alternative: typeResult.defaultAlternative!,
      });
    }
  }

  const validators = mapSchemaToValidators(prop.schema, prop.required);

  // Array-level validators: minItems/maxItems → minLength/maxLength
  const arraySchema = prop.schema as Record<string, unknown>;
  if (typeResult.fieldType === 'array') {
    if (arraySchema['minItems'] !== undefined) {
      validators.push({ type: 'minLength', value: arraySchema['minItems'] as number });
    }
    if (arraySchema['maxItems'] !== undefined) {
      validators.push({ type: 'maxLength', value: arraySchema['maxItems'] as number });
    }
  }

  const field: FieldConfig = {
    key: prop.name,
    type: finalType,
    label: ((prop.schema as Record<string, unknown>)['title'] as string) ?? toLabel(prop.name),
  };

  // readOnly → disabled
  if ((prop.schema as Record<string, unknown>)['readOnly']) {
    field.disabled = true;
  }

  // default → value
  if (prop.schema.default !== undefined) {
    field.value = prop.schema.default;
  }

  // Add props if present (only when not using x-ng-forge-type and type wasn't overridden by a decision)
  if (!ngForgeType && finalType === typeResult.fieldType && typeResult.props && Object.keys(typeResult.props).length > 0) {
    field.props = typeResult.props;
  }

  // description → hint (descriptions can be paragraphs, not suitable as placeholders)
  if (prop.schema.description) {
    field.props = { ...field.props, hint: prop.schema.description };
  }

  // Add enum options for select/radio/multi-checkbox
  if (prop.schema.enum) {
    // Support x-enum-labels extension for human-readable enum labels
    const enumLabels = (prop.schema as Record<string, unknown>)['x-enum-labels'] as Record<string, string> | string[] | undefined;
    field.options = prop.schema.enum.map((v: unknown, i: number) => {
      const strVal = String(v);
      let label: string;
      if (Array.isArray(enumLabels) && enumLabels[i]) {
        label = enumLabels[i];
      } else if (enumLabels && !Array.isArray(enumLabels) && enumLabels[strVal]) {
        label = enumLabels[strVal];
      } else {
        label = toEnumLabel(strVal);
      }
      return { label, value: strVal };
    });
  }

  // Add validators
  if (validators.length > 0) {
    field.validators = validators;
  }

  // Disable for non-editable GET responses
  if (options.editable === false) {
    field.disabled = true;
  }

  // Name-based textarea heuristic: resolve ambiguous text-input by property name
  if (!ngForgeType && typeResult.isAmbiguous && typeResult.ambiguousScope === 'text-input' && finalType === typeResult.fieldType) {
    if (/(?:description|notes|comment|bio|body|content|summary|message|text)$/i.test(prop.name)) {
      field.type = 'textarea';
      // Remove the input type prop but preserve hint and other props
      if (field.props) {
        const { type: _type, ...restProps } = field.props as Record<string, unknown> & { type?: string }; // eslint-disable-line @typescript-eslint/no-unused-vars
        field.props = Object.keys(restProps).length > 0 ? restProps : undefined;
      }
      // Remove from ambiguous list since we resolved it
      const idx = ambiguousFields.findIndex((f) => f.fieldPath === fieldPath);
      if (idx !== -1) {
        ambiguousFields.splice(idx, 1);
      }
    }
  }

  // Name-based phone heuristic: resolve to input type=tel for phone/tel field names
  if (!ngForgeType && finalType === 'input' && field.props?.['type'] === 'text') {
    if (/(?:phone|tel|telephone|mobile|fax|cell)$/i.test(prop.name)) {
      field.props = { ...field.props, type: 'tel' };
    }
  }

  // Handle container types recursively
  if (typeResult.isContainer) {
    const nestedSchemaName = schemaPrefix ? `${schemaPrefix}.${prop.name}` : prop.name;
    const nestedOptions: MappingOptions = { ...options, schemaName: nestedSchemaName };
    if (typeResult.fieldType === 'group' && prop.schema.properties) {
      const innerResult = mapSchemaToFields(prop.schema, prop.schema.required ?? [], nestedOptions);
      field.fields = innerResult.fields;
      ambiguousFields.push(...innerResult.ambiguousFields);
      // SchemaObject is a union; use bracket access for `items` on array schemas
    } else if (typeResult.fieldType === 'array' && (prop.schema as Record<string, unknown>)['items']) {
      const items = (prop.schema as Record<string, unknown>)['items'] as SchemaObject;
      const fieldLabel = singularize(toLabel(prop.name));

      if (items.type === 'object' || items.properties) {
        // Object array → template is an array of fields
        const innerResult = mapSchemaToFields(items, items.required ?? [], nestedOptions);
        field.template = innerResult.fields;
        ambiguousFields.push(...innerResult.ambiguousFields);
        warnings.push(...innerResult.warnings);
      } else {
        // Primitive array → template is a single field
        const itemTypeResult = mapSchemaToFieldType(items);
        const templateField: FieldConfig = {
          key: 'value',
          type: itemTypeResult.fieldType,
          label: fieldLabel,
        };
        if (itemTypeResult.props && Object.keys(itemTypeResult.props).length > 0) {
          templateField.props = itemTypeResult.props;
        }
        // Apply item-level validators
        const itemValidators = mapSchemaToValidators(items, false);
        if (itemValidators.length > 0) {
          templateField.validators = itemValidators;
        }
        // Enum items on the template
        if (items.enum) {
          templateField.type = 'select';
          templateField.options = items.enum.map((v: unknown) => ({
            label: toEnumLabel(String(v)),
            value: String(v),
          }));
        }
        field.template = templateField;
      }

      // Add buttons only when the array is editable
      if (!field.disabled) {
        field.addButton = { label: `Add ${fieldLabel}` };
        field.removeButton = { label: 'Remove' };
      }
    }
  }

  return field;
}

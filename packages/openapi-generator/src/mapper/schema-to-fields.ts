import type { SchemaObject, WalkedProperty } from '../parser/schema-walker.js';
import { walkSchema } from '../parser/schema-walker.js';
import { mapSchemaToFieldType } from './type-mapping.js';
import type { ValidatorConfig } from './validator-mapping.js';
import { mapSchemaToValidators } from './validator-mapping.js';
import { mapDiscriminator } from './discriminator-mapping.js';
import { toLabel } from '../utils/naming.js';

export interface FieldConfig {
  key: string;
  type: string;
  label: string;
  value?: unknown;
  placeholder?: string;
  props?: Record<string, unknown>;
  options?: Array<{ label: string; value: string }>;
  validation?: ValidatorConfig[];
  disabled?: boolean;
  fields?: FieldConfig[];
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
        group.fields = variantResult.fields.filter((f) => (f as FieldConfig).key !== walked.discriminator!.propertyName);
        ambiguousFields.push(...variantResult.ambiguousFields);
        warnings.push(...variantResult.warnings);
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

  // description → placeholder
  if (prop.schema.description) {
    field.placeholder = prop.schema.description;
  }

  // Add props if present (only when not using x-ng-forge-type and type wasn't overridden by a decision)
  if (!ngForgeType && finalType === typeResult.fieldType && typeResult.props && Object.keys(typeResult.props).length > 0) {
    field.props = typeResult.props;
  }

  // Add enum options for select/radio/multi-checkbox
  if (prop.schema.enum) {
    field.options = prop.schema.enum.map((v: unknown) => ({
      label: String(v).charAt(0).toUpperCase() + String(v).slice(1),
      value: String(v),
    }));
  }

  // Add validators
  if (validators.length > 0) {
    field.validation = validators;
  }

  // Disable for non-editable GET responses
  if (options.editable === false) {
    field.disabled = true;
  }

  // Name-based textarea heuristic: resolve ambiguous text-input by property name
  if (!ngForgeType && typeResult.isAmbiguous && typeResult.ambiguousScope === 'text-input' && finalType === typeResult.fieldType) {
    if (/(?:description|notes|comment|bio|body|content|summary|message|text)$/i.test(prop.name)) {
      field.type = 'textarea';
      // Remove the props that were for input type=text
      delete field.props;
      // Remove from ambiguous list since we resolved it
      const idx = ambiguousFields.findIndex((f) => f.fieldPath === fieldPath);
      if (idx !== -1) {
        ambiguousFields.splice(idx, 1);
      }
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
      if (items.type === 'object' || items.properties) {
        const innerResult = mapSchemaToFields(items, items.required ?? [], nestedOptions);
        field.fields = innerResult.fields;
        ambiguousFields.push(...innerResult.ambiguousFields);
      }
    }
  }

  return field;
}

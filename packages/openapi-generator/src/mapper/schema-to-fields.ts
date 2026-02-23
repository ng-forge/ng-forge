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
    const field = mapPropertyToField(prop, options, ambiguousFields);
    if (field) {
      fields.push(field);
    }
  }

  return { fields, ambiguousFields, warnings };
}

function mapPropertyToField(prop: WalkedProperty, options: MappingOptions, ambiguousFields: AmbiguousField[]): FieldConfig | undefined {
  const typeResult = mapSchemaToFieldType(prop.schema);
  const schemaPrefix = options.schemaName ?? '';
  const fieldPath = schemaPrefix ? `${schemaPrefix}.${prop.name}` : prop.name;

  // Check if there's a pre-made decision for this field
  const decision = options.decisions?.[fieldPath];
  const finalType = decision ?? typeResult.fieldType;

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

  const validators = mapSchemaToValidators(prop.schema, prop.required);

  const field: FieldConfig = {
    key: prop.name,
    type: finalType,
    label: toLabel(prop.name),
  };

  // Add props if present
  if (typeResult.props && Object.keys(typeResult.props).length > 0) {
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

  // Handle container types recursively
  if (typeResult.isContainer) {
    if (typeResult.fieldType === 'group' && prop.schema.properties) {
      const innerResult = mapSchemaToFields(prop.schema, prop.schema.required ?? [], options);
      field.fields = innerResult.fields;
      ambiguousFields.push(...innerResult.ambiguousFields);
      // SchemaObject is a union; use bracket access for `items` on array schemas
    } else if (typeResult.fieldType === 'array' && (prop.schema as Record<string, unknown>)['items']) {
      const items = (prop.schema as Record<string, unknown>)['items'] as SchemaObject;
      if (items.type === 'object' || items.properties) {
        const innerResult = mapSchemaToFields(items, items.required ?? [], options);
        field.fields = innerResult.fields;
        ambiguousFields.push(...innerResult.ambiguousFields);
      }
    }
  }

  return field;
}

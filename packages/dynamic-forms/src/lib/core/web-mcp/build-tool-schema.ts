import { FieldDef, FieldOption, FieldScope, FieldTypeDefinition, getFieldValueHandling } from '@ng-forge/dynamic-forms/internal';
import type { JsonSchema, JsonSchemaObject, JsonSchemaScalarType } from './json-schema';

/** Reports a field the builder had to drop. Kept injectable so the builder stays pure. */
export type SchemaWarn = (message: string) => void;

/** A field that may carry validators (declared on value-bearing fields only). */
interface FieldWithValidators {
  validators?: readonly ValidatorLike[];
}

/** The subset of `BuiltInValidatorConfig` the schema builder reads. */
interface ValidatorLike {
  type: string;
  value?: unknown;
  expression?: string;
  when?: unknown;
}

/** Fields the builder reads off a value-bearing definition, none of them type-level guarantees. */
interface ValueFieldLike {
  key?: string;
  type: string;
  label?: unknown;
  value?: unknown;
  nullable?: boolean;
  props?: { type?: string; placeholder?: unknown; hint?: unknown };
  options?: readonly FieldOption<unknown>[];
  fields?: unknown;
  minLength?: number;
  maxLength?: number;
}

/**
 * Builds a WebMCP tool input schema from a form's field definitions.
 *
 * Deliberately config-driven rather than value-driven. Angular's own
 * `inferSchemaFromFieldNode` walks runtime values and bails (throwing) on
 * `null`, `undefined` and empty arrays — all of which ng-forge produces by
 * default for `nullable` fields and empty array fields. Reading the config
 * instead sidesteps that entirely and carries far more for the agent: labels,
 * option enums, and static validator constraints.
 *
 * Only *structural* facts land here. Conditional (`when`) and expression-driven
 * validators are dynamic, so they are reported by the `inspect` tool at call
 * time rather than frozen into a schema the agent may have cached.
 *
 * @param fields - Top-level field definitions of the form.
 * @param registry - Field type registry, read for `valueHandling` and `scope`.
 * @param warn - Optional sink for dropped-field diagnostics.
 * @returns A JSON Schema object describing the form's value.
 *
 * @internal
 */
export function buildToolSchema(
  fields: readonly FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  warn?: SchemaWarn,
): JsonSchemaObject {
  return buildObjectSchema(fields, registry, warn);
}

/** Builds one object level, flattening `flatten`-handled containers into it. */
function buildObjectSchema(
  fields: readonly FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  warn?: SchemaWarn,
): JsonSchemaObject {
  const properties: Record<string, JsonSchema> = {};
  const required: string[] = [];

  collectInto(properties, required, fields, registry, warn);

  return { type: 'object', properties, required, additionalProperties: false };
}

/** Walks a sibling list, merging flattened containers' properties into the same level. */
function collectInto(
  properties: Record<string, JsonSchema>,
  required: string[],
  fields: readonly FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  warn?: SchemaWarn,
): void {
  for (const field of fields) {
    const valueHandling = getFieldValueHandling(field.type, registry);
    if (valueHandling === 'exclude') continue;

    const candidate = field as unknown as ValueFieldLike;

    // Rows, pages and containers are presentational: their children live at the
    // parent's level. This is why a paged form is a single flat schema.
    if (valueHandling === 'flatten') {
      const children = asFieldArray(candidate.fields);
      if (children) collectInto(properties, required, children, registry, warn);
      continue;
    }

    if (!candidate.key) continue;

    const schema = buildFieldSchema(candidate, registry, warn);
    if (!schema) continue;

    properties[candidate.key] = schema;
    if (hasStaticRequired(candidate)) required.push(candidate.key);
  }
}

/** Builds the schema for one keyed, value-bearing field. Returns undefined to drop it. */
function buildFieldSchema(field: ValueFieldLike, registry: Map<string, FieldTypeDefinition>, warn?: SchemaWarn): JsonSchema | undefined {
  if (field.type === 'group') {
    const children = asFieldArray(field.fields);
    return buildObjectSchema(children ?? [], registry, warn);
  }

  if (field.type === 'array') {
    return buildArraySchema(field, registry, warn);
  }

  return withAnnotations(field, buildScalarSchema(field, registry));
}

/**
 * Builds an array schema, but only for homogeneous items.
 *
 * `JsonSchemaArray.items` is a single schema and the inference layer Angular
 * vendors explicitly ignores `prefixItems`, so a positionally heterogeneous
 * array (which `ArrayField.fields` permits) is not expressible. Dropping it is
 * more honest than emitting a schema that silently describes only the first item.
 */
function buildArraySchema(field: ValueFieldLike, registry: Map<string, FieldTypeDefinition>, warn?: SchemaWarn): JsonSchema | undefined {
  const itemDefs = Array.isArray(field.fields) ? (field.fields as unknown[]) : undefined;
  if (!itemDefs?.length) return undefined;

  const itemSchemas = itemDefs.map((itemDef) => buildArrayItemSchema(itemDef, registry, warn));
  if (itemSchemas.some((schema) => schema === undefined)) return undefined;

  const [first, ...rest] = itemSchemas as JsonSchema[];
  const homogeneous = rest.every((schema) => deepEqual(schema, first));

  if (!homogeneous) {
    warn?.(
      `[Dynamic Forms] WebMCP: array field "${field.key}" has heterogeneous item definitions, which JSON Schema cannot express. ` +
        `The field is omitted from the tool schema.`,
    );
    return undefined;
  }

  const schema: JsonSchema = { type: 'array', items: first };
  if (typeof field.minLength === 'number') schema.minItems = field.minLength;
  if (typeof field.maxLength === 'number') schema.maxItems = field.maxLength;
  return schema;
}

/** One array item: a bare field (primitive item) or a field list (object item). */
function buildArrayItemSchema(itemDef: unknown, registry: Map<string, FieldTypeDefinition>, warn?: SchemaWarn): JsonSchema | undefined {
  if (Array.isArray(itemDef)) {
    return buildObjectSchema(itemDef as readonly FieldDef<unknown>[], registry, warn);
  }

  const field = itemDef as ValueFieldLike;
  if (!field?.type) return undefined;

  // Primitive items contribute their value directly, so the item schema is the
  // field's own schema minus its key.
  return buildFieldSchema(field, registry, warn);
}

/** Resolves the scalar JSON Schema for a leaf field, including enum and nullability. */
function buildScalarSchema(field: ValueFieldLike, registry: Map<string, FieldTypeDefinition>): JsonSchema {
  const scope = resolveScope(field, registry);
  const options = field.options;

  if (options?.length && (scope === 'single-select' || scope === 'multi-select')) {
    const values = options.map((option) => option.value);
    const itemType = inferTypeFromValues(values);

    if (scope === 'multi-select') {
      return { type: 'array', items: { type: itemType, enum: values as never } };
    }

    const enumValues = field.nullable ? [...values, null] : values;
    return applyNullable({ type: itemType, enum: enumValues as never }, field.nullable);
  }

  if (scope === 'date') {
    return applyNullable({ type: 'string', format: 'date' }, field.nullable);
  }

  return applyNullable({ type: scalarTypeFor(scope, field) }, field.nullable);
}

/** Maps a resolved scope to a JSON Schema scalar type. */
function scalarTypeFor(scope: FieldScope | undefined, field: ValueFieldLike): JsonSchemaScalarType {
  switch (scope) {
    case 'boolean':
      return 'boolean';
    case 'numeric':
      return 'number';
    case 'text-input':
      return 'string';
    default:
      // Unregistered or scope-less field type: fall back to the declared default
      // value's runtime type, then to string.
      return inferTypeFromValues([field.value]);
  }
}

/**
 * Resolves a field's scope, disambiguating the `['text-input', 'numeric']` pair
 * that text inputs declare (see `material-field-config.ts`) via `props.type`,
 * matching how `getFieldDefaultValue` decides between `''` and `NaN`.
 */
function resolveScope(field: ValueFieldLike, registry: Map<string, FieldTypeDefinition>): FieldScope | undefined {
  const declared = registry.get(field.type)?.scope;
  if (!declared) return undefined;

  if (!Array.isArray(declared)) return declared;

  if (declared.includes('numeric') && declared.includes('text-input')) {
    return field.props?.type === 'number' ? 'numeric' : 'text-input';
  }

  return declared[0];
}

/** Infers a scalar type from runtime values, defaulting to string. */
function inferTypeFromValues(values: readonly unknown[]): JsonSchemaScalarType {
  const known = values.filter((value) => value !== null && value !== undefined);
  if (!known.length) return 'string';
  if (known.every((value) => typeof value === 'number')) return 'number';
  if (known.every((value) => typeof value === 'boolean')) return 'boolean';
  return 'string';
}

/** Widens a schema to a multi-type including null when the field is nullable. */
function applyNullable(schema: JsonSchema, nullable: boolean | undefined): JsonSchema {
  if (!nullable || Array.isArray(schema.type)) return schema;
  return { ...schema, type: [schema.type as JsonSchemaScalarType, 'null'] };
}

/** Attaches title/description/default and static validator constraints. */
function withAnnotations(field: ValueFieldLike, schema: JsonSchema): JsonSchema {
  const annotated: JsonSchema = { ...schema };

  const title = staticText(field.label);
  if (title) annotated.title = title;

  const description = staticText(field.props?.placeholder) ?? staticText(field.props?.hint);
  if (description) annotated.description = description;

  if (field.value !== undefined && isJsonPrimitive(field.value)) {
    annotated.default = field.value as never;
  }

  return applyConstraints(field, annotated);
}

/**
 * Applies static built-in validators as JSON Schema constraints.
 *
 * Conditional (`when`) and expression-driven validators are skipped: they depend
 * on live form state, and baking them into a cached schema would misreport what
 * the form currently accepts. The `inspect` tool reports those instead.
 */
function applyConstraints(field: ValueFieldLike, schema: JsonSchema): JsonSchema {
  const validators = (field as FieldWithValidators).validators;
  if (!validators?.length) return schema;

  const constrained: JsonSchema = { ...schema };

  for (const validator of validators) {
    if (!isStaticValidator(validator)) continue;

    const value = validator.value;

    switch (validator.type) {
      case 'minLength':
        if (typeof value === 'number') constrained.minLength = value;
        break;
      case 'maxLength':
        if (typeof value === 'number') constrained.maxLength = value;
        break;
      case 'min':
        if (typeof value === 'number') constrained.minimum = value;
        break;
      case 'max':
        if (typeof value === 'number') constrained.maximum = value;
        break;
      case 'pattern':
        if (value instanceof RegExp) constrained.pattern = value.source;
        else if (typeof value === 'string') constrained.pattern = value;
        break;
      case 'email':
        constrained.format = 'email';
        break;
    }
  }

  return constrained;
}

/** True when the field declares an unconditional, non-expression `required`. */
function hasStaticRequired(field: ValueFieldLike): boolean {
  const validators = (field as FieldWithValidators).validators;
  return !!validators?.some((validator) => validator.type === 'required' && isStaticValidator(validator));
}

/** A validator contributes to the structural schema only when it always applies. */
function isStaticValidator(validator: ValidatorLike): boolean {
  return validator.when === undefined && validator.expression === undefined;
}

/**
 * `DynamicText` may be an Observable or Signal. Only a literal string is a
 * structural fact, so anything else is dropped rather than stringified.
 */
function staticText(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isJsonPrimitive(value: unknown): boolean {
  return typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}

/** Narrows an unknown `fields` property to a field array. */
function asFieldArray(value: unknown): readonly FieldDef<unknown>[] | undefined {
  return Array.isArray(value) ? (value as readonly FieldDef<unknown>[]) : undefined;
}

/** Structural comparison, used to decide whether array items are homogeneous. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, index) => deepEqual(item, b[index]));
  }

  const aKeys = Object.keys(a as Record<string, unknown>);
  const bKeys = Object.keys(b as Record<string, unknown>);
  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
}

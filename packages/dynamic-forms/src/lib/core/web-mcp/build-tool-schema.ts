import type { ItemPlan, PlanNode, ScalarPlan } from './field-plan';
import type { JsonSchema, JsonSchemaLiteral, JsonSchemaObject, JsonSchemaScalarType } from './json-schema';

/**
 * Builds a WebMCP tool input schema from a form's {@link PlanNode | field plan}.
 *
 * Deliberately config-driven rather than value-driven. Angular's own
 * `inferSchemaFromFieldNode` walks runtime values and bails (throwing) on
 * `null`, `undefined` and empty arrays — all of which ng-forge produces by
 * default for `nullable` fields and empty array fields. Reading the config
 * instead sidesteps that entirely and carries far more for the agent: labels,
 * option enums with their human titles, and static validator constraints.
 *
 * The schema describes a **patch**, so it emits no `required` at any level and
 * fields an agent may not write are left out entirely. What is required right
 * now, and which fields currently apply, come back from `fill` instead — those
 * depend on live state and would be wrong the moment an agent cached them.
 *
 * @internal
 */
export function buildToolSchema(plan: readonly PlanNode[]): JsonSchemaObject {
  return { type: 'object', properties: buildProperties(plan), additionalProperties: false };
}

function buildProperties(nodes: readonly PlanNode[]): Record<string, JsonSchema> {
  const properties: Record<string, JsonSchema> = {};

  for (const node of nodes) {
    // A field the agent cannot write has no place in an input schema. Offering
    // it would only invite a call the parser then rejects.
    if (!node.policy.writable) continue;

    const schema = buildNodeSchema(node);
    if (schema) properties[node.key] = schema;
  }

  return properties;
}

function buildNodeSchema(node: PlanNode): JsonSchema | undefined {
  switch (node.kind) {
    case 'group': {
      const properties = buildProperties(node.children);
      return annotate(node, { type: 'object', properties, additionalProperties: false });
    }
    case 'array': {
      // No derivable item shape means the parser will reject any write to it,
      // so the property is left out rather than advertised as settable.
      if (!node.item) return undefined;

      const schema: JsonSchema = { type: 'array', items: buildItemSchema(node.item) };
      if (node.minItems !== undefined) schema.minItems = node.minItems;
      if (node.maxItems !== undefined) schema.maxItems = node.maxItems;
      return annotate(node, schema);
    }
    case 'scalar':
      return annotate(node, buildScalarSchema(node));
  }
}

function buildItemSchema(item: ItemPlan): JsonSchema {
  if (item.kind === 'object') {
    return { type: 'object', properties: buildProperties(item.children), additionalProperties: false };
  }
  return buildScalarSchema(item.value);
}

function buildScalarSchema(plan: ScalarPlan): JsonSchema {
  const base: JsonSchema = plan.options ? optionSchema(plan) : { type: singleOrUnion(plan.types) };

  if (plan.multiple) {
    return { type: 'array', items: base };
  }

  const withConstraints: JsonSchema = { ...base };
  const { minLength, maxLength, minimum, maximum, pattern, format } = plan.constraints;
  if (minLength !== undefined) withConstraints.minLength = minLength;
  if (maxLength !== undefined) withConstraints.maxLength = maxLength;
  if (minimum !== undefined) withConstraints.minimum = minimum;
  if (maximum !== undefined) withConstraints.maximum = maximum;
  if (pattern !== undefined) withConstraints.pattern = pattern;
  if (format !== undefined) withConstraints.format = format;

  return withConstraints;
}

/**
 * Describes an option-bearing field as both `enum` and `anyOf` of titled
 * `const`s, the way WebMCP's declarative API describes a `<select>`.
 *
 * `enum` alone gives the agent the machine values and nothing else, which is
 * unusable when those values are country codes, SKUs or opaque ids. The `anyOf`
 * branches carry the label the human sees, so the agent can tell what it is
 * choosing between.
 */
function optionSchema(plan: ScalarPlan): JsonSchema {
  const options = plan.options ?? [];
  const values = options.map((option) => option.value as JsonSchemaLiteral);
  const nullable = !plan.multiple && plan.types.includes('null');

  const schema: JsonSchema = {
    type: singleOrUnion(plan.types),
    enum: nullable ? [...values, null] : values,
  };

  const branches: JsonSchema[] = options.map((option) =>
    option.title ? { const: option.value as JsonSchemaLiteral, title: option.title } : { const: option.value as JsonSchemaLiteral },
  );
  if (nullable) branches.push({ const: null });

  // Only worth the extra bytes when at least one option carries a real label.
  if (options.some((option) => option.title)) schema.anyOf = branches;

  return schema;
}

function singleOrUnion(types: readonly JsonSchemaScalarType[]): JsonSchemaScalarType | readonly JsonSchemaScalarType[] {
  return types.length === 1 ? types[0] : types;
}

/** Attaches the field's human-facing title, description and declared default. */
function annotate(node: PlanNode, schema: JsonSchema): JsonSchema {
  const annotated: JsonSchema = { ...schema };

  if (node.label) annotated.title = node.label;
  if (node.description) annotated.description = node.description;
  if (node.kind === 'scalar' && node.default !== undefined) annotated.default = node.default;

  return annotated;
}

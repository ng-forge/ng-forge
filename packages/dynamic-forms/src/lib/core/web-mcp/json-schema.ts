/**
 * Local mirror of the JSON Schema subset WebMCP's inference layer supports.
 *
 * Angular vendors the authoritative types at
 * `@angular/core/third_party/@mcp-b/webmcp-types`, but that path is not part of
 * its public API, so this declares the same shape rather than importing across
 * a private boundary. Types only — no runtime cost.
 *
 * Kept intentionally narrow: `prefixItems` and the other keywords the inference
 * layer accepts but ignores are omitted, because emitting them would imply
 * support that agents do not actually get.
 *
 * @internal
 */

/** Scalar `type` values usable on a leaf schema. */
export type JsonSchemaScalarType = 'string' | 'number' | 'integer' | 'boolean' | 'null';

/** All `type` values, including the structural ones. */
export type JsonSchemaType = JsonSchemaScalarType | 'object' | 'array';

/** Literal values permitted in `enum` / `const` / `default`. */
export type JsonSchemaLiteral = string | number | boolean | null;

/**
 * A JSON Schema node.
 *
 * Modelled as one open shape rather than a discriminated union: the builder
 * assembles nodes incrementally (type first, then annotations, then
 * constraints), which a union would make needlessly awkward for no safety gain
 * at this size.
 */
export interface JsonSchema {
  type: JsonSchemaType | readonly JsonSchemaType[];

  /** Human-readable name, sourced from the field's `label`. */
  title?: string;
  /** Usage hint, sourced from the field's `placeholder` or `hint`. */
  description?: string;
  /** The field's declared default value. */
  default?: JsonSchemaLiteral;
  /** Allowed values, sourced from a select/radio field's `options`. */
  enum?: readonly JsonSchemaLiteral[];
  /** Semantic hint such as `date` or `email`. */
  format?: string;

  // String constraints
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // Number constraints
  minimum?: number;
  maximum?: number;

  // Array constraints
  items?: JsonSchema;
  minItems?: number;
  maxItems?: number;

  // Object constraints
  properties?: Record<string, JsonSchema>;
  required?: string[];
  additionalProperties?: boolean;
}

/** A JSON Schema node known to describe an object, as tool input schemas must. */
export interface JsonSchemaObject extends JsonSchema {
  type: 'object';
  properties: Record<string, JsonSchema>;
  required: string[];
  additionalProperties: boolean;
}

import {
  FieldDef,
  FieldOption,
  FieldScope,
  FieldTypeDefinition,
  FieldWebMcpOptions,
  getFieldValueHandling,
  ValidationMessages,
} from '@ng-forge/dynamic-forms/internal';
import { getNormalizedArrayMetadata } from '../../utils/array-field/normalized-array-metadata';
import type { JsonSchemaScalarType } from './json-schema';

/**
 * A config-derived description of everything the WebMCP layer needs to know
 * about a form's shape.
 *
 * Built once per registration epoch and consumed by four things that must agree
 * with each other: the tool schema handed to the agent, the runtime parser that
 * validates the agent's arguments, the patch merge that writes them, and the
 * redaction that decides what comes back. Deriving all four from one walk is
 * what keeps the schema an agent reads and the rules the form enforces from
 * drifting apart.
 *
 * @internal
 */
export type PlanNode = ScalarPlan | GroupPlan | ArrayPlan;

/** What an agent may do with one field. */
export interface PlanPolicy {
  /** The agent may see this field's value in a tool response. */
  readable: boolean;
  /** The agent may write this field. */
  writable: boolean;
}

interface PlanBase {
  key: string;
  /** Dotted path from the form root, for messages and reports. */
  path: string;
  label?: string;
  description?: string;
  policy: PlanPolicy;
  /**
   * The field's declared `validationMessages`.
   *
   * ng-forge resolves messages per field at render time, so a raw
   * `ValidationError` carries no message. Carrying them on the plan lets an
   * error row use the message the author already wrote for humans.
   */
  messages?: ValidationMessages;
}

/** One allowed value of an option-bearing field, with the human label that explains it. */
export interface OptionPlan {
  value: unknown;
  title?: string;
}

/** Static constraints lifted from the field's validators. */
export interface PlanConstraints {
  minLength?: number;
  maxLength?: number;
  minimum?: number;
  maximum?: number;
  pattern?: string;
  format?: string;
}

/** A leaf field holding a single value (or, for a multi-select, an array of them). */
export interface ScalarPlan extends PlanBase {
  kind: 'scalar';
  /** Accepted JSON types, including `'null'` when the field is nullable. */
  types: readonly JsonSchemaScalarType[];
  /** Allowed values, for fields declaring `options`. Disabled options are excluded. */
  options?: readonly OptionPlan[];
  /** True when the value is an array of option values rather than one of them. */
  multiple: boolean;
  /** Declared default, when it is a JSON primitive. */
  default?: string | number | boolean | null;
  constraints: PlanConstraints;
}

/** A nested object level. */
export interface GroupPlan extends PlanBase {
  kind: 'group';
  children: readonly PlanNode[];
}

/** A list. Items are homogeneous — see {@link ItemPlan}. */
export interface ArrayPlan extends PlanBase {
  kind: 'array';
  /** Shape of one item, from the array's template. Undefined when it could not be derived. */
  item: ItemPlan | undefined;
  minItems?: number;
  maxItems?: number;
}

/** One array item: either an object of fields, or a bare value. */
export type ItemPlan = { kind: 'object'; children: readonly PlanNode[] } | { kind: 'value'; value: ScalarPlan };

/** Reports a field the plan builder had to drop. Kept injectable so the builder stays pure. */
export type PlanWarn = (message: string) => void;

/** A field that may carry validators (declared on value-bearing fields only). */
interface FieldWithValidators {
  validators?: readonly ValidatorLike[];
}

/** The subset of `BuiltInValidatorConfig` the plan reads. */
interface ValidatorLike {
  type: string;
  value?: unknown;
  expression?: string;
  when?: unknown;
}

/** Fields the builder reads off a definition, none of them type-level guarantees. */
interface FieldLike {
  key?: string;
  type: string;
  label?: unknown;
  value?: unknown;
  nullable?: boolean;
  readonly?: boolean;
  derivation?: string;
  logic?: readonly { type?: string }[];
  placeholder?: unknown;
  props?: { type?: string; placeholder?: unknown; hint?: unknown };
  options?: readonly FieldOption<unknown>[];
  fields?: unknown;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | RegExp;
  email?: boolean;
  required?: boolean;
  validationMessages?: ValidationMessages;
  webMcp?: FieldWebMcpOptions | false;
}

/**
 * Walks a form's field definitions and produces the plan.
 *
 * @param fields - Top-level field definitions of the form.
 * @param registry - Field type registry, read for `valueHandling` and `scope`.
 * @param warn - Sink for dropped-field diagnostics.
 *
 * @internal
 */
export function buildFieldPlan(
  fields: readonly FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  warn?: PlanWarn,
): readonly PlanNode[] {
  const nodes: PlanNode[] = [];
  collectInto(nodes, fields, registry, '', warn);
  return nodes;
}

/** Walks a sibling list, merging flattened containers' children into the same level. */
function collectInto(
  out: PlanNode[],
  fields: readonly FieldDef<unknown>[],
  registry: Map<string, FieldTypeDefinition>,
  prefix: string,
  warn?: PlanWarn,
): void {
  for (const field of fields) {
    const valueHandling = getFieldValueHandling(field.type, registry);
    if (valueHandling === 'exclude') continue;

    const candidate = field as unknown as FieldLike;

    // Rows, pages and containers are presentational: their children live at the
    // parent's level. This is why a paged form is a single flat plan.
    if (valueHandling === 'flatten') {
      const children = asFieldArray(candidate.fields);
      if (children) collectInto(out, children, registry, prefix, warn);
      continue;
    }

    if (!candidate.key) continue;

    const node = buildNode(candidate, registry, prefix, warn);
    if (node) out.push(node);
  }
}

/** Builds the plan node for one keyed, value-bearing field. */
function buildNode(field: FieldLike, registry: Map<string, FieldTypeDefinition>, prefix: string, warn?: PlanWarn): PlanNode | undefined {
  const key = field.key as string;
  const path = prefix ? `${prefix}.${key}` : key;
  const base: PlanBase = {
    key,
    path,
    label: staticText(field.label),
    description: staticText(field.placeholder) ?? staticText(field.props?.placeholder) ?? staticText(field.props?.hint),
    policy: resolvePolicy(field),
    messages: field.validationMessages,
  };

  if (field.type === 'group') {
    const children: PlanNode[] = [];
    collectInto(children, asFieldArray(field.fields) ?? [], registry, path, warn);
    return { ...base, kind: 'group', children };
  }

  if (field.type === 'array') {
    return buildArrayNode(field, base, registry, warn);
  }

  return buildScalar(field, base, registry);
}

/**
 * Builds the plan for an array field from its *template* rather than from the
 * items that happen to exist right now.
 *
 * A simplified array stores its template as normalization metadata, so an array
 * declared with `value: []` has a perfectly well-known item shape even though
 * `fields` is empty. Reading the instances instead is what made empty arrays
 * disappear from the schema, and it also made two structurally identical items
 * with different defaults look heterogeneous.
 */
function buildArrayNode(field: FieldLike, base: PlanBase, registry: Map<string, FieldTypeDefinition>, warn?: PlanWarn): ArrayPlan {
  const plan: ArrayPlan = { ...base, kind: 'array', item: buildItemPlan(field, base.path, registry, warn) };
  if (typeof field.minLength === 'number') plan.minItems = field.minLength;
  if (typeof field.maxLength === 'number') plan.maxItems = field.maxLength;
  return plan;
}

function buildItemPlan(field: FieldLike, path: string, registry: Map<string, FieldTypeDefinition>, warn?: PlanWarn): ItemPlan | undefined {
  const template = getNormalizedArrayMetadata(field as object)?.template;
  const source = template ?? firstDeclaredItem(field);
  if (source === undefined) return undefined;

  const itemPlan = itemPlanFrom(source, path, registry, warn);
  if (!itemPlan) return undefined;

  // A full-API array declares each item separately, so its items can differ by
  // position. `items` is a single schema and the inference layer WebMCP vendors
  // ignores `prefixItems`, so ng-forge supports homogeneous arrays only: warn
  // and drop the item shape rather than describing only the first item.
  if (!template && !itemsAreHomogeneous(field, path, registry, itemPlan, warn)) {
    warn?.(
      `[Dynamic Forms] WebMCP: array field "${field.key}" declares items with different shapes. ` +
        `Only homogeneous arrays can be described to an agent, so its items are left unspecified.`,
    );
    return undefined;
  }

  return itemPlan;
}

/** Turns one item definition — a field list (object item) or a bare field (value item) — into a plan. */
function itemPlanFrom(source: unknown, path: string, registry: Map<string, FieldTypeDefinition>, warn?: PlanWarn): ItemPlan | undefined {
  if (Array.isArray(source)) {
    const children: PlanNode[] = [];
    collectInto(children, source as readonly FieldDef<unknown>[], registry, `${path}[]`, warn);
    return { kind: 'object', children };
  }

  const itemField = source as FieldLike;
  if (!itemField?.type) return undefined;

  const node = buildNode(itemField, registry, `${path}[]`, warn);
  if (!node || node.kind !== 'scalar') return undefined;
  return { kind: 'value', value: node };
}

function firstDeclaredItem(field: FieldLike): unknown {
  const items = Array.isArray(field.fields) ? (field.fields as unknown[]) : undefined;
  return items?.length ? items[0] : undefined;
}

/** Compares every declared item against the first one's plan. */
function itemsAreHomogeneous(
  field: FieldLike,
  path: string,
  registry: Map<string, FieldTypeDefinition>,
  first: ItemPlan,
  warn?: PlanWarn,
): boolean {
  const items = Array.isArray(field.fields) ? (field.fields as unknown[]) : [];
  return items.every((item) => {
    const candidate = itemPlanFrom(item, path, registry, warn);
    return candidate !== undefined && sameShape(candidate, first);
  });
}

/**
 * Structural comparison of two item plans.
 *
 * Deliberately ignores defaults, labels and descriptions: two items differing
 * only in their prefilled value describe the same shape to an agent, and
 * comparing whole objects (which is what the previous `deepEqual` over built
 * schemas did) reported those as heterogeneous.
 */
function sameShape(a: ItemPlan, b: ItemPlan): boolean {
  if (a.kind !== b.kind) return false;

  if (a.kind === 'value' && b.kind === 'value') {
    return scalarShape(a.value) === scalarShape(b.value);
  }

  const aChildren = (a as { children: readonly PlanNode[] }).children;
  const bChildren = (b as { children: readonly PlanNode[] }).children;
  if (aChildren.length !== bChildren.length) return false;

  return aChildren.every((child, index) => nodeShape(child) === nodeShape(bChildren[index]));
}

function nodeShape(node: PlanNode): string {
  switch (node.kind) {
    case 'scalar':
      return `${node.key}:${scalarShape(node)}`;
    case 'group':
      return `${node.key}:group(${node.children.map(nodeShape).join(',')})`;
    case 'array':
      return `${node.key}:array(${node.item ? itemShape(node.item) : '?'})`;
  }
}

function itemShape(item: ItemPlan): string {
  return item.kind === 'value' ? scalarShape(item.value) : item.children.map(nodeShape).join(',');
}

function scalarShape(plan: ScalarPlan): string {
  const options = plan.options ? plan.options.map((option) => JSON.stringify(option.value)).join('|') : '';
  return `${plan.types.join('/')}${plan.multiple ? '[]' : ''}${options ? `{${options}}` : ''}`;
}

/** Resolves the value shape and constraints of a leaf field. */
function buildScalar(field: FieldLike, base: PlanBase, registry: Map<string, FieldTypeDefinition>): ScalarPlan {
  const scope = resolveScope(field, registry);
  const options = usableOptions(field);
  const constraints = collectConstraints(field);

  if (options && (scope === 'single-select' || scope === 'multi-select')) {
    const types = [inferTypeFromValues(options.map((option) => option.value))] as JsonSchemaScalarType[];
    const multiple = scope === 'multi-select';
    return {
      ...base,
      kind: 'scalar',
      types: multiple || !field.nullable ? types : [...types, 'null'],
      options,
      multiple,
      default: jsonPrimitive(field.value),
      constraints,
    };
  }

  if (scope === 'date') {
    return {
      ...base,
      kind: 'scalar',
      types: withNull(['string'], field.nullable),
      multiple: false,
      default: jsonPrimitive(field.value),
      constraints: { ...constraints, format: constraints.format ?? 'date' },
    };
  }

  return {
    ...base,
    kind: 'scalar',
    types: withNull([scalarTypeFor(scope, field)], field.nullable),
    multiple: false,
    default: jsonPrimitive(field.value),
    constraints,
  };
}

/**
 * Selectable option values, with the label that explains what each one means.
 *
 * Disabled options are dropped: they are not selectable, so offering them to an
 * agent only invites a rejected write. A label that is an Observable or Signal
 * resolves at render time and is left off rather than stringified.
 */
function usableOptions(field: FieldLike): readonly OptionPlan[] | undefined {
  if (!field.options?.length) return undefined;

  const usable = field.options
    .filter((option) => option.disabled !== true)
    .map((option) => {
      const title = staticText(option.label);
      return title ? { value: option.value, title } : { value: option.value };
    });

  return usable.length ? usable : undefined;
}

/** Maps a resolved scope to a JSON Schema scalar type. */
function scalarTypeFor(scope: FieldScope | undefined, field: FieldLike): JsonSchemaScalarType {
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
function resolveScope(field: FieldLike, registry: Map<string, FieldTypeDefinition>): FieldScope | undefined {
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

function withNull(types: readonly JsonSchemaScalarType[], nullable: boolean | undefined): readonly JsonSchemaScalarType[] {
  return nullable ? [...types, 'null'] : types;
}

/**
 * Collects static constraints from both validation APIs.
 *
 * ng-forge's normal field API is the shorthand — `required`, `email`, `min`,
 * `max`, `minLength`, `maxLength`, `pattern` declared directly on the field —
 * with `validators[]` as the advanced escape hatch. Both are read here; the
 * shorthand is applied first so an explicit `validators` entry wins.
 *
 * Conditional (`when`) and expression-driven validators are skipped: they depend
 * on live form state, and baking them into a schema the agent may have cached
 * would misreport what the form currently accepts. `fill` reports those live.
 */
function collectConstraints(field: FieldLike): PlanConstraints {
  const constraints: PlanConstraints = {};

  if (typeof field.minLength === 'number' && field.type !== 'array') constraints.minLength = field.minLength;
  if (typeof field.maxLength === 'number' && field.type !== 'array') constraints.maxLength = field.maxLength;
  if (typeof field.min === 'number') constraints.minimum = field.min;
  if (typeof field.max === 'number') constraints.maximum = field.max;
  if (field.pattern instanceof RegExp) constraints.pattern = field.pattern.source;
  else if (typeof field.pattern === 'string') constraints.pattern = field.pattern;
  if (field.email) constraints.format = 'email';

  for (const validator of (field as FieldWithValidators).validators ?? []) {
    if (!isStaticValidator(validator)) continue;
    const value = validator.value;

    switch (validator.type) {
      case 'minLength':
        if (typeof value === 'number') constraints.minLength = value;
        break;
      case 'maxLength':
        if (typeof value === 'number') constraints.maxLength = value;
        break;
      case 'min':
        if (typeof value === 'number') constraints.minimum = value;
        break;
      case 'max':
        if (typeof value === 'number') constraints.maximum = value;
        break;
      case 'pattern':
        if (value instanceof RegExp) constraints.pattern = value.source;
        else if (typeof value === 'string') constraints.pattern = value;
        break;
      case 'email':
        constraints.format = 'email';
        break;
    }
  }

  return constraints;
}

/** A validator contributes to the structural schema only when it always applies. */
function isStaticValidator(validator: ValidatorLike): boolean {
  return validator.when === undefined && validator.expression === undefined;
}

/**
 * Resolves what an agent may do with a field.
 *
 * The defaults are the conservative reading of the field itself, so a form that
 * says nothing about agents still does not hand a password back or let one
 * overwrite a derived value. `webMcp` on the field overrides either axis.
 */
function resolvePolicy(field: FieldLike): PlanPolicy {
  const declared = field.webMcp;
  if (declared === false) return { readable: false, writable: false };

  // A `hidden` field type carries a value the user never sees — usually an id or
  // a correlation token. Neither half of it is an agent's business by default.
  const isHiddenType = field.type === 'hidden';
  const isSecret = field.props?.type === 'password';
  const isDerived = field.derivation !== undefined || (field.logic ?? []).some((rule) => rule?.type === 'derivation');
  const isReadonly = field.readonly === true || (field.logic ?? []).some((rule) => rule?.type === 'readonly');

  return {
    readable: declared?.readable ?? (!isHiddenType && !isSecret),
    writable: declared?.writable ?? (!isHiddenType && !isDerived && !isReadonly),
  };
}

/**
 * `DynamicText` may be an Observable or Signal. Only a literal string is a
 * structural fact, so anything else is dropped rather than stringified.
 */
function staticText(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function jsonPrimitive(value: unknown): string | number | boolean | null | undefined {
  if (value === null) return null;
  if (typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  return undefined;
}

/** Narrows an unknown `fields` property to a field array. */
function asFieldArray(value: unknown): readonly FieldDef<unknown>[] | undefined {
  return Array.isArray(value) ? (value as readonly FieldDef<unknown>[]) : undefined;
}

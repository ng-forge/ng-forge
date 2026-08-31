import type { ItemPlan, PlanNode, ScalarPlan } from './field-plan';
import type { JsonSchemaScalarType } from './json-schema';

/** The outcome of checking an agent's arguments against the field plan. */
export type ParseResult = { ok: true; patch: Record<string, unknown>; paths: readonly string[] } | { ok: false; errors: readonly string[] };

/**
 * Reports why a field cannot be written *right now*, or `undefined` when it can.
 * Live state the config cannot know about — a field the form has disabled or
 * made readonly through a logic rule.
 */
export type LiveWriteBlock = (path: string) => string | undefined;

/** Sentinel for "this key failed to parse", distinct from a legitimate `undefined`. */
const SKIP = Symbol('skip');

/**
 * Validates an agent's arguments against the field plan before anything is written.
 *
 * `inputSchema` is not a gate. Angular's own WebMCP documentation warns that
 * agent input may not be validated against the schema at all, and Chrome's
 * guidance is to validate strictly in code and treat the schema as the looser,
 * advisory half. So this is the actual boundary: nothing reaches the form model
 * until the whole patch parses.
 *
 * Rejection is atomic on purpose. A patch that half-applies leaves the form in a
 * state neither the user nor the agent asked for, and the agent has no way to
 * find out which half landed. Every problem in the call is collected and
 * returned together so one round trip is enough to fix them all.
 *
 * What it enforces: known properties only, runtime types (including `null` only
 * where the field is nullable), enum membership, object and array structure, and
 * the writable half of each field's exposure policy. What it deliberately leaves
 * to the form: value constraints such as `minLength` or `pattern`, which the
 * form's own validators check and report with the message the author wrote.
 *
 * @internal
 */
export function parseAgentInput(plan: readonly PlanNode[], input: unknown, liveBlock?: LiveWriteBlock): ParseResult {
  if (input === undefined || input === null) {
    return { ok: true, patch: {}, paths: [] };
  }

  if (!isPlainObject(input)) {
    return { ok: false, errors: ['Arguments must be an object of field names to values.'] };
  }

  const errors: string[] = [];
  const paths: string[] = [];
  const patch = parseLevel(plan, input, '', errors, paths, liveBlock);

  return errors.length ? { ok: false, errors } : { ok: true, patch, paths };
}

function parseLevel(
  nodes: readonly PlanNode[],
  input: Record<string, unknown>,
  prefix: string,
  errors: string[],
  paths: string[],
  liveBlock: LiveWriteBlock | undefined,
): Record<string, unknown> {
  const byKey = new Map(nodes.map((node) => [node.key, node]));
  const patch: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    const label = prefix ? `${prefix}.${key}` : key;
    const node = byKey.get(key);

    if (!node) {
      const writable = nodes.filter((candidate) => candidate.policy.writable).map((candidate) => candidate.key);
      errors.push(`Unknown field "${label}". This form accepts: ${writable.join(', ') || '(no writable fields)'}.`);
      continue;
    }

    if (!node.policy.writable) {
      errors.push(`Field "${label}" cannot be set by an agent.`);
      continue;
    }

    const blocked = liveBlock?.(node.path);
    if (blocked) {
      errors.push(`Field "${label}" cannot be set right now: ${blocked}.`);
      continue;
    }

    const parsed = parseNode(node, value, label, errors, paths, liveBlock);
    if (parsed !== SKIP) {
      patch[key] = parsed;
      // A group contributes its leaves, not itself: reporting the group as
      // "changed" would scope the readback to the whole object, handing back
      // sibling values the call never touched. An array is one path, because it
      // is replaced whole.
      if (node.kind !== 'group') paths.push(node.path);
    }
  }

  return patch;
}

function parseNode(
  node: PlanNode,
  value: unknown,
  label: string,
  errors: string[],
  paths: string[],
  liveBlock: LiveWriteBlock | undefined,
): unknown {
  switch (node.kind) {
    case 'scalar':
      return parseScalar(node, value, label, errors);

    case 'group': {
      if (!isPlainObject(value)) {
        errors.push(`Field "${label}" is a group and expects an object.`);
        return SKIP;
      }
      const before = errors.length;
      const nested = parseLevel(node.children, value, label, errors, paths, liveBlock);
      return errors.length === before ? nested : SKIP;
    }

    case 'array': {
      if (!Array.isArray(value)) {
        errors.push(`Field "${label}" is a list and expects an array.`);
        return SKIP;
      }
      if (!node.item) {
        errors.push(`Field "${label}" has an item shape that cannot be described to an agent, so it cannot be set.`);
        return SKIP;
      }
      const before = errors.length;
      // Item paths are template paths (`lines[].sku`), not something an agent
      // could send back, so they are collected and discarded.
      const itemPaths: string[] = [];
      const items = value.map((item, index) => parseItem(node.item as ItemPlan, item, `${label}[${index}]`, errors, itemPaths, liveBlock));
      return errors.length === before ? items : SKIP;
    }
  }
}

function parseItem(
  item: ItemPlan,
  value: unknown,
  label: string,
  errors: string[],
  paths: string[],
  liveBlock: LiveWriteBlock | undefined,
): unknown {
  if (item.kind === 'value') {
    return parseScalar(item.value, value, label, errors);
  }

  if (!isPlainObject(value)) {
    errors.push(`Item "${label}" expects an object.`);
    return SKIP;
  }

  // Items are replaced whole, so an item is parsed against its full template
  // rather than merged into whatever sat at that index before.
  return parseLevel(item.children, value, label, errors, paths, liveBlock);
}

function parseScalar(plan: ScalarPlan, value: unknown, label: string, errors: string[]): unknown {
  if (plan.multiple) {
    if (!Array.isArray(value)) {
      errors.push(`Field "${label}" accepts multiple values and expects an array.`);
      return SKIP;
    }
    const invalid = value.filter((entry) => !isAllowedOption(plan, entry));
    if (invalid.length) {
      errors.push(`Field "${label}" got ${describe(invalid[0])}, which is not one of: ${optionList(plan)}.`);
      return SKIP;
    }
    return value;
  }

  if (plan.options) {
    if (!isAllowedOption(plan, value) && !(value === null && plan.types.includes('null'))) {
      errors.push(`Field "${label}" got ${describe(value)}, which is not one of: ${optionList(plan)}.`);
      return SKIP;
    }
    return value;
  }

  if (!plan.types.some((type) => matchesType(type, value))) {
    errors.push(`Field "${label}" expects ${plan.types.join(' or ')} but got ${describe(value)}.`);
    return SKIP;
  }

  return value;
}

function isAllowedOption(plan: ScalarPlan, value: unknown): boolean {
  return (plan.options ?? []).some((option) => Object.is(option.value, value));
}

function optionList(plan: ScalarPlan): string {
  return (plan.options ?? []).map((option) => JSON.stringify(option.value)).join(', ');
}

function matchesType(type: JsonSchemaScalarType, value: unknown): boolean {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && Number.isFinite(value);
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
  }
}

/** Describes a rejected value without echoing a long payload back to the agent. */
function describe(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'an array';
  if (typeof value === 'object') return 'an object';
  if (typeof value === 'string') return value.length > 40 ? 'a long string' : JSON.stringify(value);
  return JSON.stringify(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

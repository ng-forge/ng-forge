import type { PlanNode } from './field-plan';

/**
 * Merges a validated patch into the form model, following the field plan.
 *
 * A top-level spread is not a partial update. `{ person: { first: 'Grace' } }`
 * spread over `{ person: { first: 'Ada', last: 'Lovelace' } }` replaces the
 * whole `person` object and silently deletes `last`, which is data loss rather
 * than an incomplete report. Groups are therefore merged key by key, all the way
 * down.
 *
 * Arrays are replaced whole. There is no positional patch an agent could express
 * unambiguously — index 1 of a five-item list means nothing once the list is
 * reordered — so sending a list means sending the list it should become.
 *
 * @internal
 */
export function mergePatch(
  current: Record<string, unknown>,
  patch: Record<string, unknown>,
  plan: readonly PlanNode[],
): Record<string, unknown> {
  const byKey = new Map(plan.map((node) => [node.key, node]));
  const next: Record<string, unknown> = { ...current };

  for (const [key, value] of Object.entries(patch)) {
    const node = byKey.get(key);

    if (node?.kind === 'group' && isPlainObject(value)) {
      const existing = isPlainObject(current[key]) ? (current[key] as Record<string, unknown>) : {};
      next[key] = mergePatch(existing, value, node.children);
      continue;
    }

    next[key] = value;
  }

  return next;
}

/**
 * Strips values the agent is not allowed to read, keeping the structure intact.
 *
 * A redacted field is not deleted: the agent still needs to know the field
 * exists and, from the field report, whether it currently holds a value. Only
 * the value itself is withheld, replaced by a marker that says why.
 *
 * @internal
 */
export const REDACTED = '[not readable by agents]';

/** @internal */
export function redactValues(value: unknown, plan: readonly PlanNode[]): unknown {
  if (!isPlainObject(value)) return value;

  const out: Record<string, unknown> = {};

  for (const node of plan) {
    if (!(node.key in value)) continue;

    if (!node.policy.readable) {
      out[node.key] = REDACTED;
      continue;
    }

    out[node.key] = redactNode(node, value[node.key]);
  }

  return out;
}

function redactNode(node: PlanNode, value: unknown): unknown {
  switch (node.kind) {
    case 'group':
      return redactValues(value, node.children);
    case 'array':
      if (!Array.isArray(value) || node.item?.kind !== 'object') return value;
      return value.map((item) => redactValues(item, (node.item as { children: readonly PlanNode[] }).children));
    case 'scalar':
      return value;
  }
}

/**
 * Narrows a form value down to the paths a call actually wrote.
 *
 * The default readback for `fill` and `submit`. Returning the whole model on
 * every call — including a call with no arguments — hands an agent every
 * prefilled value on the page: identifiers, personal data entered by the user
 * before the agent arrived, anything the form happens to hold. Chrome's own
 * guidance is that even a read-only tool can reveal user information, so the
 * default is to echo back what the call changed and nothing more. A form that
 * wants the full picture opts in with `webMcp.readback: 'all'`.
 *
 * @internal
 */
export function pickPaths(value: unknown, paths: readonly string[]): unknown {
  if (!isPlainObject(value)) return {};

  const out: Record<string, unknown> = {};

  for (const path of paths) {
    const [head, ...rest] = path.split('.');
    if (!(head in value)) continue;

    if (!rest.length) {
      out[head] = value[head];
      continue;
    }

    const nested = pickPaths(value[head], [rest.join('.')]);
    out[head] = isPlainObject(out[head]) ? { ...(out[head] as Record<string, unknown>), ...(nested as object) } : nested;
  }

  return out;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

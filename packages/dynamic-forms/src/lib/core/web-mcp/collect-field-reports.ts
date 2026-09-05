import { ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import type { FieldTree } from '@angular/forms/signals';
import type { ArrayPlan, OptionPlan, PlanNode } from './field-plan';

/** One field's current state, as reported to an agent. */
export interface FieldReport {
  /** Dotted path into the form value. */
  path: string;
  /** The field's label, when it has a static one. */
  label?: string;
  /** Currently applicable — not hidden and not disabled. */
  applicable: boolean;
  /** Required right now, including by conditional validators. */
  required: boolean;
  /** Whether an agent may write this field. */
  writable: boolean;
  /** Whether an agent may see this field's value. */
  readable: boolean;
  /**
   * Whether the field currently holds a value.
   *
   * This is what lets an agent orient itself — see what is still blank and what
   * is already answered — without the response handing back every value on the
   * page.
   */
  filled: boolean;
  /** Allowed values, for fields that declare options. */
  options?: readonly OptionPlan[];
}

/** Live per-field state the runtime write policy consults. */
export interface LiveFieldState {
  disabled: boolean;
  readonly: boolean;
  hidden: boolean;
}

/** A field walk's output: per-field rows plus subtree- and path-keyed indexes. */
export interface FieldWalk {
  reports: FieldReport[];
  /**
   * Maps each field subtree to its dotted path.
   *
   * Signal Forms' public `ReadonlyFieldState` exposes `name` (a display
   * identifier) but not a structural path, so error rows are resolved back to
   * config paths through this index rather than by reaching into internals.
   */
  paths: Map<unknown, string>;
  /** Maps each field subtree to its declared `validationMessages`. */
  messages: Map<unknown, ValidationMessages>;
  /** Maps a dotted path to what the form currently allows on it. */
  state: Map<string, LiveFieldState>;
}

/**
 * Walks the field plan alongside a live field tree, producing one row per keyed
 * field with its *current* applicability and requiredness.
 *
 * This is the half of the agent's picture the static schema deliberately does
 * not carry: `hidden`, `disabled` and conditionally-`required` all depend on
 * live form state, so they are reported at call time rather than frozen into a
 * schema the agent may have cached.
 *
 * Array descendants are walked too. Leaving them out meant an error inside an
 * array item resolved to no path and no message, which is precisely the case an
 * agent most needs spelled out.
 *
 * @internal
 */
export function collectFieldReports(plan: readonly PlanNode[], tree: FieldTree<unknown>): FieldWalk {
  const walkResult: FieldWalk = { reports: [], paths: new Map(), messages: new Map(), state: new Map() };
  walk(plan, tree, walkResult);
  return walkResult;
}

function walk(nodes: readonly PlanNode[], tree: FieldTree<unknown>, out: FieldWalk): void {
  const record = tree as unknown as Record<string, FieldTree<unknown> | undefined>;

  for (const node of nodes) {
    const subtree = record[node.key];
    if (typeof subtree !== 'function') continue;

    const state = subtree();

    out.paths.set(subtree, node.path);
    if (node.messages) out.messages.set(subtree, node.messages);
    out.state.set(node.path, { disabled: state.disabled(), readonly: state.readonly(), hidden: state.hidden() });
    out.reports.push({
      path: node.path,
      label: node.label,
      applicable: !state.hidden() && !state.disabled(),
      required: state.required(),
      writable: node.policy.writable,
      readable: node.policy.readable,
      filled: hasValue(state.value()),
      options: node.kind === 'scalar' ? node.options : undefined,
    });

    if (node.kind === 'group') {
      walk(node.children, subtree, out);
      continue;
    }

    if (node.kind === 'array') {
      walkArray(node, subtree, out);
    }
  }
}

/** Walks each live item of an array against the array's item plan. */
function walkArray(node: ArrayPlan, subtree: FieldTree<unknown>, out: FieldWalk): void {
  if (node.item?.kind !== 'object') return;

  const items = subtree() as unknown as { value: () => unknown };
  const value = items.value();
  if (!Array.isArray(value)) return;

  const indexed = subtree as unknown as Record<number, FieldTree<unknown> | undefined>;

  for (let index = 0; index < value.length; index += 1) {
    const itemTree = indexed[index];
    if (typeof itemTree !== 'function') continue;

    // Item plans are built from the template, so their paths read `items[]`.
    // Re-anchor them onto the real index the agent would have to send back.
    walk(rebase(node.item.children, `${node.path}[${index}]`), itemTree, out);
  }
}

/** Re-roots a template's plan nodes onto a concrete array index. */
function rebase(nodes: readonly PlanNode[], prefix: string): readonly PlanNode[] {
  return nodes.map((node) => {
    const path = `${prefix}.${node.key}`;
    if (node.kind === 'group') return { ...node, path, children: rebase(node.children, path) };
    if (node.kind === 'array' && node.item?.kind === 'object') {
      return { ...node, path, item: { kind: 'object' as const, children: rebase(node.item.children, `${path}[]`) } };
    }
    return { ...node, path };
  });
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  return true;
}

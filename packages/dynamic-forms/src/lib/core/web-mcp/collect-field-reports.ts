import { FieldDef, FieldOption, isGroupField, ValidationMessages } from '@ng-forge/dynamic-forms/internal';
import type { FieldTree } from '@angular/forms/signals';
import type { FieldReport } from './format-report';

/** A field definition's agent-relevant metadata, read structurally. */
interface ReportableField {
  key?: string;
  label?: unknown;
  options?: readonly FieldOption<unknown>[];
  validationMessages?: ValidationMessages;
  fields?: unknown;
}

/** A field walk's output: per-field rows plus subtree-keyed indexes. */
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
  /**
   * Maps each field subtree to its declared `validationMessages`.
   *
   * ng-forge resolves messages per field at render time, so a raw
   * `ValidationError` carries no `message`. Collecting them during the same walk
   * lets an error row use the message the author already wrote for humans.
   */
  messages: Map<unknown, ValidationMessages>;
}

/**
 * Walks the config alongside a live field tree, producing one row per keyed
 * field with its *current* applicability and requiredness.
 *
 * This is the half of the agent's picture the static schema deliberately does
 * not carry: `hidden`, `disabled` and conditionally-`required` all depend on
 * live form state, so they are reported at call time rather than frozen into a
 * schema the agent may have cached.
 *
 * @internal
 */
export function collectFieldReports(fields: readonly FieldDef<unknown>[], tree: FieldTree<unknown>): FieldWalk {
  const walkResult: FieldWalk = { reports: [], paths: new Map(), messages: new Map() };
  walk(fields, tree, [], walkResult);
  return walkResult;
}

function walk(fields: readonly FieldDef<unknown>[], tree: FieldTree<unknown>, prefix: readonly string[], out: FieldWalk): void {
  const record = tree as unknown as Record<string, FieldTree<unknown>>;

  for (const field of fields) {
    const candidate = field as unknown as ReportableField;

    // Containers that add no nesting still hold children whose state matters.
    if (!candidate.key) {
      const children = asFieldArray(candidate.fields);
      if (children) walk(children, tree, prefix, out);
      continue;
    }

    const subtree = record[candidate.key];
    if (typeof subtree !== 'function') continue;

    const state = subtree();
    const path = [...prefix, candidate.key];
    const dotted = path.join('.');

    out.paths.set(subtree, dotted);
    if (candidate.validationMessages) out.messages.set(subtree, candidate.validationMessages);
    out.reports.push({
      path: dotted,
      label: typeof candidate.label === 'string' ? candidate.label : undefined,
      applicable: !state.hidden() && !state.disabled(),
      required: state.required(),
      options: candidate.options?.map((option) => option.value),
    });

    if (isGroupField(field) && field.fields) {
      walk(field.fields as readonly FieldDef<unknown>[], subtree, path, out);
    }
  }
}

function asFieldArray(value: unknown): readonly FieldDef<unknown>[] | undefined {
  return Array.isArray(value) ? (value as readonly FieldDef<unknown>[]) : undefined;
}

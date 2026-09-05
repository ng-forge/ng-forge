/**
 * The rule catalogue: the semantic checks the validator layers on top of the
 * schemas, each with a stable public identifier.
 *
 * ## What is a rule, and what is not
 *
 * Only checks that are NOT derivable from the type system live here. That line
 * matters because rules are opt-out-able and type-derived constraints are not:
 * disabling "a container has no label" would ask the validator to accept
 * something the compiler rejects, so the config still would not build and the
 * opt-out would be a lie.
 *
 * So `label?: never` on a container, `template` required on an array-add button,
 * and `options` living at field level are all facts of the types, expressed in
 * the descriptor and enforced by the schema. They have no identifier and cannot
 * be turned off. What is here is convention layered on top: things that are
 * legal TypeScript and still wrong.
 *
 * The test for membership is whether the config would compile with the check
 * switched off. A select with no `options`, a hidden field with no `value`, a
 * group with no `fields`, an array with both `fields` and `template`, a
 * container carrying `disabled` logic and an option written as a bare string
 * are all rejected by the schema because they are rejected by the compiler, so
 * an id for any of them would name a switch that cannot change the outcome.
 * The validator still reports every one of them, by the same message as before;
 * it just does not offer to turn them off.
 *
 * ## Identifiers are API
 *
 * An id appears in a consumer's config file, so renaming one breaks their
 * project silently. Reading an unknown id is an error rather than a no-op,
 * precisely so a rename cannot pass unnoticed: a rule the user believes is off
 * but is not is worse than either state chosen deliberately.
 *
 * Namespaced so an adapter or a consumer's own plugin can add rules without
 * colliding, and so the namespace says who owns the rule.
 */

export type RuleSeverity = 'error' | 'warning';

export interface Rule {
  /** Stable, namespaced, public. Never renamed without a major. */
  readonly id: string;
  /** One line, in the imperative. */
  readonly summary: string;
  /** Why it exists, for a reader deciding whether to switch it off. */
  readonly why: string;
}

function rule(id: string, summary: string, why: string): Rule {
  return { id, summary, why };
}

/**
 * Every semantic rule, keyed by id.
 *
 * Granularity is one entry per distinct mistake an agent could act on, not one
 * per code path. Two checks that produce the same advice share an id.
 */
export const RULES: Readonly<Record<string, Rule>> = Object.freeze(
  Object.fromEntries(
    [
      rule(
        'core/hidden-minimal',
        'Keep hidden fields to `key`, `type`, `value` and `className`',
        'Hidden fields render nothing, so labels, validation and layout properties on them have no effect and mislead the next reader.',
      ),
      rule(
        'core/nesting',
        'Respect which field types may nest inside which',
        'A page inside a row, or an array inside an array, has no rendering path and fails at runtime rather than at build time.',
      ),
      rule(
        'core/validation-messages-location',
        'Put error text in `validationMessages`, not on the validator',
        'A message on the validator object is dropped and the field falls back to the default text.',
      ),
      rule(
        'core/slider-range-properties',
        'Use `minValue`, `maxValue` and `step` for a slider range',
        '`min` and `max` are validation shorthands. They typecheck and validate clean, and the slider still renders its default range, so nothing catches the mistake.',
      ),
    ].map((entry) => [entry.id, entry]),
  ),
);

/** Ids in a stable order, for rendering and for tests. */
export const RULE_IDS: readonly string[] = Object.freeze(Object.keys(RULES).sort());

/** Thrown when a consumer disables a rule that does not exist. */
export class UnknownRuleError extends Error {
  constructor(unknown: readonly string[]) {
    super(
      `[Dynamic Forms] unknown rule id(s): ${unknown.join(', ')}. ` +
        `A rule that does not exist cannot be disabled, and silently ignoring it would leave you believing a rule is off when it is not. ` +
        `Known ids: ${RULE_IDS.join(', ')}.`,
    );
    this.name = 'UnknownRuleError';
  }
}

/**
 * Resolve a consumer's disable list.
 *
 * Rejects unknown ids rather than ignoring them, so a rule renamed upstream
 * surfaces as a failure at the next run instead of quietly coming back on.
 */
export function resolveDisabledRules(disabled: readonly string[]): Set<string> {
  const unknown = disabled.filter((id) => !RULES[id]);
  if (unknown.length > 0) throw new UnknownRuleError(unknown);

  return new Set(disabled);
}

/**
 * Severity for a rule, given what the consumer disabled.
 *
 * Disabling downgrades to a warning rather than silencing. The consumer here is
 * usually an agent, and a rule that vanishes teaches it nothing, where "this is
 * off in your project" is information it can act on. It also keeps a stale
 * opt-out visible instead of letting it rot unnoticed.
 */
export function severityFor(ruleId: string, disabled: ReadonlySet<string>): RuleSeverity {
  return disabled.has(ruleId) ? 'warning' : 'error';
}

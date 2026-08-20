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
        'core/options-at-field-level',
        'Put `options` on the field, not inside `props`',
        'Inside props it is silently ignored and the field renders with no choices. This is the single most common mistake.',
      ),
      rule(
        'core/options-required',
        'Give select, radio and multi-checkbox their `options`',
        'Without them the field renders empty and cannot be used.',
      ),
      rule(
        'core/options-shape',
        'Write each option as `{ label, value }`',
        'Primitives and other shapes are dropped, leaving a field with fewer choices than intended.',
      ),
      rule(
        'core/hidden-requires-value',
        'Give a hidden field a `value`',
        'A hidden field exists to carry a value through the form; without one it contributes nothing.',
      ),
      rule(
        'core/hidden-minimal',
        'Keep hidden fields to `key`, `type`, `value` and `className`',
        'Hidden fields render nothing, so labels, validation and layout properties on them have no effect and mislead the next reader.',
      ),
      rule(
        'core/container-requires-fields',
        'Give every container a `fields` array',
        'A container with no children renders nothing and is almost always a mistake rather than an intent.',
      ),
      rule(
        'core/array-api-exclusive',
        'Use `fields` or `template`, not both',
        'They are two different array APIs; supplying both leaves the intent ambiguous.',
      ),
      rule('core/array-api-required', 'Give an array either `fields` or `template`', 'Without one there is nothing to render for an item.'),
      rule(
        'core/container-logic-hidden-only',
        'Use only `hidden` logic on a container',
        'Containers have no value of their own, so disabled, required and derivation logic have nothing to act on. Put them on the children.',
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

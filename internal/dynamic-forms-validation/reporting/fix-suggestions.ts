/** Fix suggestions for common FormConfig validation errors. */

import type { FormattedValidationError } from '../validate/src/index.js';

/**
 * Maps a config property (or a substring of an error message) to a
 * copy-paste-ready correction. Keyed by the property that is wrong, so the
 * lookup can go straight from an error path to a suggestion.
 */
export const FIX_SUGGESTIONS: Record<string, string> = {
  options: 'Move `options` from `props: { options: [...] }` to field level: `{ key, type, options: [...] }`',
  label: 'Remove `label` from this container field (page/group/row/array). Use a `text` field inside for headings.',
  logic:
    "Containers (group, row, array) only support 'hidden' logic type (same as pages). For other logic types (disabled, required, readonly, derivation), apply them to child fields instead.",
  minValue: 'Use `minValue` at field level for sliders, not `min` in props.',
  maxValue: 'Use `maxValue` at field level for sliders, not `max` in props.',
  step: 'Use `step` at field level for sliders, not in props.',
  template:
    'Arrays support two APIs: (1) Full API with `fields` for explicit item definitions, or (2) Simplified API with `template` + `value` for common cases. If using `template`, provide a single field for primitive arrays or an array of fields for object arrays.',
  content: 'Use `label` for text content and `props: { elementType }` for HTML element.',
  element: 'Use `props: { elementType }` not `element` for text field HTML element.',
  hideWhen: "Use `logic: [{ type: 'hidden', condition: {...} }]` - no `hideWhen` shorthand exists.",
  showWhen: "Use `logic: [{ type: 'hidden', condition: {...} }]` with inverted condition - no `showWhen` shorthand exists.",
  expressions: "Use `logic: [{ type: 'derivation', expression }]` or shorthand `derivation: '...'` - no `expressions` property exists.",
  derivation:
    "Use shorthand `derivation: '...'` or `logic: [{ type: 'derivation', expression: '...' }]`. Derivations are defined on the target field itself.",
  targetField:
    "The `targetField` property has been removed. Define derivations directly on the target field using `derivation: '...'` or `logic: [{ type: 'derivation', expression: '...' }]`.",
  value: 'Hidden fields REQUIRE a `value` property. Add: `value: "your-value-here"`',
  validators: 'Hidden fields do NOT support validators. Remove the `validators` property.',
  required: 'Hidden fields do NOT support `required`. Remove it.',
  disabled: 'Hidden fields do NOT support `disabled`. Remove it.',
  readonly: 'Hidden fields do NOT support `readonly`. Remove it.',
  hidden: 'Hidden fields do NOT support `hidden`. Remove it (the field is already hidden).',
  col: 'Hidden fields do NOT support `col`. Remove it (no layout needed).',
  props: 'Hidden fields do NOT support `props`. Remove it.',
  arrayKey: 'arrayKey should be at FIELD level, not inside props.',
  responseMapping:
    'Declarative HTTP validators require `responseMapping: { validWhen: "response.isValid", errorKind: "serverError" }`. `validWhen` is an expression evaluated with `{ response }` scope — truthy means valid. `errorKind` maps to `validationMessages`.',
  validWhen:
    '`validWhen` is a property of `responseMapping`, not a top-level validator property. Use: `responseMapping: { validWhen: "response.ok", errorKind: "..." }`.',
  errorKind:
    '`errorKind` is a property of `responseMapping`, not a top-level validator property. Use: `responseMapping: { validWhen: "...", errorKind: "myError" }`.',
  stopOnUserOverride:
    '`stopOnUserOverride` is a derivation option. When true, the derivation stops running after the user manually edits the field. Pair with `reEngageOnDependencyChange: true` to re-derive when dependencies change.',
  reEngageOnDependencyChange:
    '`reEngageOnDependencyChange` requires `stopOnUserOverride: true`. Clears the user-override flag when dependencies change, allowing the derivation to run again.',
  httpCondition:
    'HTTP conditions use `type: "http"` with `http: { url, method?, queryParams? }` and optional `responseExpression` to extract boolean from response. Set `pendingValue` for in-flight behavior.',
};

/**
 * Split an error path into its property segments.
 *
 * Two producers emit different shapes: the zod adapter joins with dots and
 * includes array indices (`fields.0`), while the semantic checks use bracket
 * notation (`fields[0].props.options`). Both reduce to the same segment list,
 * with indices dropped because a number never names a property.
 */
function pathSegments(path: string): string[] {
  return path.split(/[.[\]]+/).filter((segment) => segment.length > 0 && !/^\d+$/.test(segment));
}

/**
 * Resolve a fix suggestion for a validation error.
 *
 * Matches only on the error's path. Scanning the message text was tried and
 * removed: messages routinely quote property names they are not about, so an
 * unknown field type whose message lists `hidden` among the valid types drew
 * "Hidden fields do NOT support `hidden`. Remove it", and a validators hint on
 * an `input` field drew "Remove the `validators` property". A wrong fix is
 * worse than none here, because the skill instructs agents to apply what this
 * reports before replying.
 *
 * An error that does not name a property in its path therefore gets no
 * suggestion, which is the honest answer.
 */
export function getFixSuggestion(error: FormattedValidationError): string | undefined {
  // Last segment first: it is the most specific property in the path.
  for (const segment of pathSegments(error.path).reverse()) {
    if (FIX_SUGGESTIONS[segment]) {
      return FIX_SUGGESTIONS[segment];
    }
  }

  return undefined;
}

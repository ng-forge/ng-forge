/** Maps validation errors to documentation pages. */

import type { FormattedValidationError } from '@ng-forge/dynamic-forms-validation';

const DOCS_BASE_URL = 'https://ng-forge.com/dynamic-forms';

/**
 * Error path patterns paired with the doc page that explains the rule.
 * The first match for a given error wins, and each hint is emitted at most
 * once per report.
 */
const ERROR_DOC_HINTS: ReadonlyArray<{ pattern: RegExp; label: string; path: string }> = [
  { pattern: /options/i, label: 'Options syntax', path: 'schema-fields/field-types' },
  { pattern: /hidden/i, label: 'Hidden field rules', path: 'prebuilt/hidden-fields' },
  { pattern: /container|group|row|page/i, label: 'Container field rules', path: 'prebuilt/form-groups' },
  { pattern: /logic|conditional/i, label: 'Conditional logic', path: 'dynamic-behavior/conditional-logic/overview' },
  { pattern: /validator|required|pattern|email/i, label: 'Validation', path: 'validation/basics' },
  { pattern: /derivation|expression/i, label: 'Value derivation', path: 'dynamic-behavior/value-derivation/basics' },
  { pattern: /template|simplified/i, label: 'Simplified array API', path: 'prebuilt/form-arrays/simplified' },
  {
    pattern: /responseMapping|validWhen/i,
    label: 'Async validators',
    path: 'dynamic-behavior/value-derivation/basics/async-derivation',
  },
  { pattern: /array/i, label: 'Array fields', path: 'prebuilt/form-arrays/complete' },
];

/**
 * Collect deduplicated documentation links relevant to a set of errors.
 * Suitable as the `relatedDocs` hook of a report.
 */
export function collectRelatedDocs(errors: FormattedValidationError[]): string[] {
  const seen = new Set<string>();
  const hints: string[] = [];

  for (const error of errors) {
    // Path only. Matching the message drew unrelated pages, because messages
    // quote property names they are not about: one unknown-field-type error
    // enumerated the valid types and pulled in the hidden, container and array
    // pages at once.
    for (const { pattern, label, path } of ERROR_DOC_HINTS) {
      if (!pattern.test(error.path)) {
        continue;
      }
      if (!seen.has(path)) {
        seen.add(path);
        hints.push(`${label}: ${DOCS_BASE_URL}/${path}`);
      }
      // First match wins, as documented above.
      break;
    }
  }

  return hints;
}

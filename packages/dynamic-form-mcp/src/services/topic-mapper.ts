/**
 * Topic-to-Section Mapper
 *
 * Maps MCP TOPICS keys to llms-full.txt section paths.
 * Some topics map to multiple sections (concatenated when fetched).
 * Topics with no website equivalent (MCP-specific patterns) return null.
 */

/**
 * Maps topic keys to one or more llms-full.txt section paths.
 * Topics not in this map are MCP-specific and should use hardcoded fallback.
 */
const TOPIC_SECTION_MAP: Record<string, string[]> = {
  // Field types
  input: ['schema-fields/field-types'],
  select: ['schema-fields/field-types'],
  slider: ['schema-fields/field-types'],
  radio: ['schema-fields/field-types'],
  checkbox: ['schema-fields/field-types'],
  textarea: ['schema-fields/field-types'],
  datepicker: ['schema-fields/field-types'],
  toggle: ['schema-fields/field-types'],
  text: ['prebuilt/text-components'],
  hidden: ['prebuilt/hidden-fields'],

  // Containers
  group: ['prebuilt/form-groups'],
  row: ['prebuilt/form-rows'],
  array: ['prebuilt/form-arrays/simplified', 'prebuilt/form-arrays/complete'],
  page: ['prebuilt/form-pages'],

  // Concepts
  validation: ['validation/basics'],
  'validation-messages': ['validation/basics'],
  conditional: ['dynamic-behavior/conditional-logic/overview'],
  derivation: ['dynamic-behavior/value-derivation/basics'],
  'property-derivation': ['dynamic-behavior/value-derivation/basics/property-derivation'],
  'async-validators': ['dynamic-behavior/value-derivation/basics/async-derivation'],
  'options-format': ['schema-fields/field-types'],
  'expression-variables': ['advanced/expression-parser'],
  buttons: ['prebuilt/form-pages'],

  // Patterns with website equivalents
  containers: ['prebuilt/form-groups', 'prebuilt/form-rows', 'prebuilt/form-pages'],
  'custom-validators': ['validation/custom-validators'],
  conditions: ['dynamic-behavior/conditional-logic/overview'],
  'common-expressions': ['advanced/expression-parser'],
  'type-narrowing': ['advanced/type-safety/basics'],

  // Advanced
  'external-data': ['advanced/expression-parser'],
  i18n: ['dynamic-behavior/i18n'],
  submission: ['dynamic-behavior/submission'],

  // Schema validation
  'schema-overview': ['schema-validation/overview'],
  'schema-angular': ['schema-validation/angular-schema'],
  'schema-zod': ['schema-validation/zod'],

  // Installation
  installation: ['installation'],

  // UI integrations
  'ui-material': ['ui-libs-integrations/material'],
  'ui-primeng': ['ui-libs-integrations/primeng'],
  'ui-ionic': ['ui-libs-integrations/ionic'],
  'ui-bootstrap': ['ui-libs-integrations/bootstrap'],

  // AI integration
  'ai-integration': ['ai-integration'],
};

/**
 * MCP-specific topics that have no website equivalent.
 * These always use hardcoded fallback content.
 */
const MCP_ONLY_TOPICS = new Set([
  'golden-path',
  'pitfalls',
  'field-placement',
  'logic-matrix',
  'context-api',
  'multi-page-gotchas',
  'array-buttons',
  'workflow',
]);

/**
 * Get the section paths for a topic.
 * Returns null for MCP-only topics (should use hardcoded fallback).
 * Returns undefined for unknown topics.
 */
export function getTopicSections(topic: string): string[] | null | undefined {
  if (MCP_ONLY_TOPICS.has(topic)) {
    return null;
  }
  return TOPIC_SECTION_MAP[topic];
}

/**
 * Check if a topic is MCP-specific (no website equivalent).
 */
export function isMcpOnlyTopic(topic: string): boolean {
  return MCP_ONLY_TOPICS.has(topic);
}

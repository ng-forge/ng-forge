/**
 * Validate Form Config Tool
 *
 * MCP tool wrapper for form config validation using Zod schemas.
 * Delegates to @ng-forge/dynamic-forms-zod/mcp for actual validation.
 * Enhanced to provide actionable fix suggestions.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  validateFormConfig,
  type UiIntegration,
  type ValidationResult,
  type FormattedValidationError,
} from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Common fixes for validation errors.
 */
const FIX_SUGGESTIONS: Record<string, string> = {
  options: 'Move `options` from `props: { options: [...] }` to field level: `{ key, type, options: [...] }`',
  label: 'Remove `label` from this container field (page/group/row/array). Use a `text` field inside for headings.',
  logic: "Move `logic` to individual child fields. Containers (row/group/array) don't support logic - only their children do.",
  minValue: 'Use `minValue` at field level for sliders, not `min` in props.',
  maxValue: 'Use `maxValue` at field level for sliders, not `max` in props.',
  step: 'Use `step` at field level for sliders, not in props.',
  template: 'Use `fields` instead of `template` for array item definition.',
  content: 'Use `label` for text content and `props: { elementType }` for HTML element.',
  element: 'Use `props: { elementType }` not `element` for text field HTML element.',
  hideWhen: "Use `logic: [{ type: 'hidden', condition: {...} }]` - no `hideWhen` shorthand exists.",
  showWhen: "Use `logic: [{ type: 'hidden', condition: {...} }]` with inverted condition - no `showWhen` shorthand exists.",
  expressions: "Use `logic: [{ type: 'derivation', targetField, expression }]` - no `expressions` property exists.",
  derivation: "Use `logic: [{ type: 'derivation', targetField: 'fieldKey', expression: '...' }]`",
};

/**
 * Get fix suggestion for an error.
 */
function getFixSuggestion(error: FormattedValidationError): string | undefined {
  const pathParts = error.path.split('.');
  const lastPart = pathParts[pathParts.length - 1];

  // Check for direct property match
  if (FIX_SUGGESTIONS[lastPart]) {
    return FIX_SUGGESTIONS[lastPart];
  }

  // Check message for known patterns
  for (const [key, suggestion] of Object.entries(FIX_SUGGESTIONS)) {
    if (error.message.toLowerCase().includes(key.toLowerCase())) {
      return suggestion;
    }
  }

  return undefined;
}

/**
 * Enhanced validation result with fix suggestions.
 */
interface EnhancedValidationResult extends ValidationResult {
  fixes?: Array<{ path: string; suggestion: string }>;
  summary?: string;
}

/**
 * Enhance validation result with fix suggestions.
 */
function enhanceValidationResult(result: ValidationResult, uiIntegration: string): EnhancedValidationResult {
  const enhanced: EnhancedValidationResult = { ...result };

  if (!result.valid && result.errors) {
    const fixes: Array<{ path: string; suggestion: string }> = [];

    for (const error of result.errors) {
      const suggestion = getFixSuggestion(error);
      if (suggestion) {
        fixes.push({ path: error.path, suggestion });
      }
    }

    if (fixes.length > 0) {
      enhanced.fixes = fixes;
    }

    // Create a human-readable summary
    const summaryLines = [
      `INVALID - ${result.errors.length} error(s) found for ${uiIntegration}`,
      '',
      'Errors:',
      ...result.errors.map((e) => `  - ${e.path}: ${e.message}`),
    ];

    if (fixes.length > 0) {
      summaryLines.push('', 'Suggested Fixes:');
      for (const fix of fixes) {
        summaryLines.push(`  - ${fix.path}: ${fix.suggestion}`);
      }
    }

    summaryLines.push('', 'Tip: Use ngforge_get_cheatsheet for property placement rules.');
    enhanced.summary = summaryLines.join('\n');
  } else {
    enhanced.summary = `VALID - Config passes all validation checks for ${uiIntegration}`;
  }

  return enhanced;
}

export function registerValidateFormConfigTool(server: McpServer): void {
  server.tool(
    'ngforge_validate_form_config',
    'Validates a FormConfig against the actual TypeScript types for a specific UI library. Returns detailed error messages with FIX SUGGESTIONS when validation fails. ALWAYS call this before deploying your form config!',
    {
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to validate against (material, bootstrap, primeng, ionic)'),
      config: z.object({}).passthrough().describe('The FormConfig object to validate'),
    },
    async ({ uiIntegration, config }) => {
      const result = validateFormConfig(uiIntegration as UiIntegration, config);
      const enhanced = enhanceValidationResult(result, uiIntegration);

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(enhanced, null, 2),
          },
        ],
      };
    },
  );
}

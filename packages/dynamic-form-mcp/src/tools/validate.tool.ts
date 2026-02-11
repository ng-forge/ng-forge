/**
 * Unified Validation Tool
 *
 * Consolidated validation tool that absorbs:
 * - validate-file.tool.ts (TypeScript file validation with AST extraction)
 * - validate-form-config.tool.ts (JSON config validation)
 * - validate-field.tool.ts (single field validation)
 *
 * Single tool for "Is my config correct?"
 * Auto-detects if config is a file path or JSON object.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import {
  validateFormConfig,
  type UiIntegration,
  type ValidationResult,
  type FormattedValidationError,
} from '@ng-forge/dynamic-forms-zod/mcp';
import {
  createSourceFile,
  findFormConfigCandidates,
  extractToJson,
  type FormConfigCandidate,
  type ExtractionResult,
} from '../utils/ast-extractor.js';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Common fixes for validation errors.
 */
const FIX_SUGGESTIONS: Record<string, string> = {
  options: 'Move `options` from `props: { options: [...] }` to field level: `{ key, type, options: [...] }`',
  label: 'Remove `label` from this container field (page/group/row/array). Use a `text` field inside for headings.',
  logic:
    "Containers (group, row, array) only support 'hidden' logic type (same as pages). For other logic types (disabled, required, readonly, derivation), apply them to child fields instead.",
  minValue: 'Use `minValue` at field level for sliders, not `min` in props.',
  maxValue: 'Use `maxValue` at field level for sliders, not `max` in props.',
  step: 'Use `step` at field level for sliders, not in props.',
  template: 'Use `fields` instead of `template` for array item definition.',
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
 * Result of extracting and validating a single FormConfig from file.
 */
interface ConfigValidationResult {
  name: string;
  line: number;
  matchReason: FormConfigCandidate['matchReason'];
  extraction: ExtractionResult;
  validation: ValidationResult;
}

/**
 * Format validation report for file validation.
 */
function formatFileReport(
  filePath: string,
  uiIntegration: string,
  candidates: FormConfigCandidate[],
  results: ConfigValidationResult[],
): string {
  const lines: string[] = [];

  lines.push('# Validation Report');
  lines.push('');
  lines.push(`**File:** ${filePath}`);
  lines.push(`**UI Integration:** ${uiIntegration}`);
  lines.push('');

  // Discovery Phase
  if (candidates.length === 0) {
    lines.push('## No FormConfig Found');
    lines.push('');
    lines.push('Could not find any FormConfig objects in the file.');
    lines.push('');
    lines.push('**Detection methods used:**');
    lines.push('1. `satisfies FormConfig` (recommended)');
    lines.push('2. `const x: FormConfig = {...}`');
    lines.push('3. `as FormConfig`');
    lines.push('4. Structural match (object with `fields` array)');
    lines.push('');
    lines.push('**Tip:** Ensure your config has a `fields` array with objects containing `key` or `type`.');
    return lines.join('\n');
  }

  lines.push(`## Found ${candidates.length} FormConfig(s)`);
  lines.push('');

  // Extraction Warnings
  const hasWarnings = results.some((r) => r.extraction.warnings.length > 0);
  if (hasWarnings) {
    lines.push('### Extraction Notes');
    lines.push('');
    lines.push('Some runtime values were replaced with placeholders:');
    lines.push('');
    for (const result of results) {
      for (const warning of result.extraction.warnings) {
        lines.push(`- **${warning.path}**: ${warning.issue}`);
      }
    }
    lines.push('');
  }

  // Validation Results
  const allValid = results.every((r) => r.validation.valid);
  const totalErrors = results.reduce((sum, r) => sum + (r.validation.errors?.length || 0), 0);

  if (allValid) {
    lines.push('### ✅ All Configs Valid');
    lines.push('');
    for (const result of results) {
      lines.push(`- **${result.name}** (line ${result.line}): Valid`);
    }
  } else {
    lines.push(`### ❌ ${totalErrors} Error(s) Found`);
    lines.push('');

    for (const result of results) {
      if (result.validation.valid) {
        lines.push(`#### ${result.name} (line ${result.line}): ✅ Valid`);
      } else {
        lines.push(`#### ${result.name} (line ${result.line}): ❌ Invalid`);
        lines.push('');

        if (result.validation.errors) {
          for (const error of result.validation.errors) {
            lines.push(`- **${error.path}:** ${error.message}`);
            const fix = getFixSuggestion(error);
            if (fix) {
              lines.push(`  - **Fix:** ${fix}`);
            }
          }
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format validation report for JSON config validation.
 */
function formatJsonReport(uiIntegration: string, result: ValidationResult): string {
  const lines: string[] = [];

  lines.push('# Validation Report');
  lines.push('');
  lines.push(`**UI Integration:** ${uiIntegration}`);
  lines.push('');

  if (result.valid) {
    lines.push('### ✅ Config Valid');
    lines.push('');
    lines.push('The configuration passes all validation checks.');
  } else {
    const errorCount = result.errors?.length || 0;
    lines.push(`### ❌ ${errorCount} Error(s) Found`);
    lines.push('');

    if (result.errors) {
      for (const error of result.errors) {
        lines.push(`- **${error.path}:** ${error.message}`);
        const fix = getFixSuggestion(error);
        if (fix) {
          lines.push(`  - **Fix:** ${fix}`);
        }
      }
    }

    lines.push('');
    lines.push('**Tip:** Use `ngforge_lookup topic="pitfalls"` for common mistakes and solutions.');
  }

  return lines.join('\n');
}

/**
 * Detect if a string is a file path.
 */
function isFilePath(value: string): boolean {
  // Check for common file path patterns
  return (
    value.startsWith('/') || // Absolute path (Unix)
    value.startsWith('./') || // Relative path
    value.startsWith('../') || // Parent directory
    value.startsWith('~') || // Home directory
    /^[a-zA-Z]:\\/.test(value) || // Windows absolute path
    value.endsWith('.ts') ||
    value.endsWith('.js') ||
    value.endsWith('.tsx') ||
    value.endsWith('.jsx')
  );
}

/**
 * Parse config input - handles string (file path or JSON) or object.
 */
async function parseConfigInput(
  config: string | Record<string, unknown>,
): Promise<
  { type: 'file'; path: string } | { type: 'json'; data: Record<string, unknown> } | { type: 'object'; data: Record<string, unknown> }
> {
  // Already an object
  if (typeof config === 'object') {
    return { type: 'object', data: config };
  }

  // String - could be file path or JSON
  const trimmed = config.trim();

  // Check if it's a file path
  if (isFilePath(trimmed)) {
    return { type: 'file', path: trimmed };
  }

  // Try to parse as JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      return { type: 'json', data: parsed };
    } catch {
      // Not valid JSON - might be a file path after all
      return { type: 'file', path: trimmed };
    }
  }

  // Default to treating as file path
  return { type: 'file', path: trimmed };
}

export function registerValidateTool(server: McpServer): void {
  server.tool(
    'ngforge_validate',
    `VALIDATION: Validate FormConfig - "Is my config correct?"

Auto-detects input type:
- File path (.ts/.js): Reads file, extracts FormConfig(s), validates each
- JSON string: Parses and validates
- JSON object: Validates directly

Returns SPECIFIC error messages with:
- Exact property that's wrong
- What the correct structure should look like
- Copy-paste fix suggestions

Example errors you'll see:
- "Hidden field missing REQUIRED value property"
- "options MUST be at FIELD level, NOT inside props"
- "containers only support 'hidden' logic type"`,
    {
      config: z
        .union([z.string(), z.object({}).passthrough()])
        .describe(
          'File path (.ts/.js) OR JSON string OR JSON object. Auto-detects: paths ending in .ts/.js or starting with / are treated as files.',
        ),
      uiIntegration: z
        .enum(UI_INTEGRATIONS)
        .default('material')
        .describe('UI library to validate against (material, bootstrap, primeng, ionic). Defaults to material.'),
    },
    async ({ config, uiIntegration }) => {
      try {
        const parsed = await parseConfigInput(config);

        // File validation
        if (parsed.type === 'file') {
          const filePath = parsed.path;

          // Read the file
          const source = await readFile(filePath, 'utf-8');

          // Parse with ts-morph
          const sourceFile = createSourceFile(source, filePath);

          // Find candidates
          const candidates = findFormConfigCandidates(sourceFile);

          // Extract and validate each candidate
          const results: ConfigValidationResult[] = candidates.map((candidate) => {
            const extraction = extractToJson(candidate.objectLiteral);
            const validation = validateFormConfig(uiIntegration as UiIntegration, extraction.value);

            return {
              name: candidate.name,
              line: candidate.startLine,
              matchReason: candidate.matchReason,
              extraction,
              validation,
            };
          });

          // Format report
          const report = formatFileReport(filePath, uiIntegration, candidates, results);

          // Structured output
          const structured = {
            type: 'file',
            filePath,
            uiIntegration,
            configsFound: results.length,
            allValid: results.every((r) => r.validation.valid),
            results: results.map((r) => ({
              name: r.name,
              line: r.line,
              valid: r.validation.valid,
              errorCount: r.validation.errors?.length || 0,
            })),
          };

          return {
            content: [
              { type: 'text' as const, text: report },
              { type: 'text' as const, text: '\n\n```json\n' + JSON.stringify(structured, null, 2) + '\n```' },
            ],
          };
        }

        // JSON or object validation
        const configData = parsed.data;
        const result = validateFormConfig(uiIntegration as UiIntegration, configData);

        const report = formatJsonReport(uiIntegration, result);

        const structured = {
          type: parsed.type,
          uiIntegration,
          valid: result.valid,
          errorCount: result.errors?.length || 0,
          errors: result.errors,
        };

        return {
          content: [
            { type: 'text' as const, text: report },
            { type: 'text' as const, text: '\n\n```json\n' + JSON.stringify(structured, null, 2) + '\n```' },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';

        // Check if it's a file not found error
        if (message.includes('ENOENT') || message.includes('no such file')) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `# Validation Error

**Error:** File not found

The specified file does not exist. Please check:
1. The path is correct and absolute
2. The file extension is .ts or .js
3. The file hasn't been moved or deleted

**Input received:** ${typeof config === 'string' ? config : '[object]'}`,
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: `# Validation Error

**Error:** ${message}

If validating a file, ensure:
- The path is absolute
- The file contains valid TypeScript/JavaScript
- FormConfig objects have a \`fields\` array

If validating JSON, ensure:
- The JSON is valid syntax
- The config has a \`fields\` array at root`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}

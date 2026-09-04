/** Unified Validation Tool */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { access } from 'node:fs/promises';
import { dirname, join, parse, resolve } from 'node:path';
import { z } from 'zod';
import {
  formatConfigReport,
  formatFileReport,
  loadProjectRules,
  parseConfigInput,
  validateFile,
  validateFormConfig,
  type FormattedValidationError,
  type UiIntegration,
} from '@ng-forge/dynamic-forms-validation';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * The project's disabled rules for a file being validated.
 *
 * Discovery walks up from the file rather than the working directory: an MCP
 * server is long-lived and its cwd has nothing to do with the file an agent
 * just asked about. A malformed rules file is reported rather than ignored,
 * matching the CLI.
 */
async function projectDisabledRules(filePath: string): Promise<ReadonlySet<string>> {
  return (await loadProjectRules(await nearestManifest(dirname(filePath)))).disabled;
}

/**
 * Findings of one severity.
 *
 * A finding with no severity is an error: only the disabled-rule path sets one,
 * and it sets `warning`.
 */
function countBySeverity(errors: FormattedValidationError[] | undefined, severity: 'error' | 'warning'): number {
  return (errors ?? []).filter((error) => (error.severity ?? 'error') === severity).length;
}

/** The closest `package.json` at or above `from`, which is where the rules file sits. */
async function nearestManifest(start: string): Promise<string | undefined> {
  // Absolute first. `dirname('.')` is `'.'` and `parse('.').root` is empty, so
  // walking a relative path never reaches the root and never terminates.
  const from = resolve(start);
  const { root } = parse(from);

  for (let dir = from; ; dir = dirname(dir)) {
    const candidate = join(dir, 'package.json');
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Keep walking.
    }
    if (dir === root) return undefined;
  }
}

/**
 * Error-to-topic hints for contextual documentation references.
 * Maps error text patterns to relevant lookup tool calls. This is the MCP
 * flavour of the CLI's `collectRelatedDocs`: same intent, but it points the
 * model at `ngforge_lookup` rather than at a URL it would have to fetch.
 */
const ERROR_TOPIC_HINTS: Array<{ pattern: RegExp; hint: string }> = [
  { pattern: /options/i, hint: '`ngforge_lookup topic="options-format"` — correct options syntax' },
  { pattern: /hidden/i, hint: '`ngforge_lookup topic="hidden"` — hidden field rules' },
  { pattern: /container|group|row|page/i, hint: '`ngforge_lookup topic="containers"` — container field rules' },
  { pattern: /logic|conditional/i, hint: '`ngforge_lookup topic="conditional"` — logic/conditional syntax' },
  { pattern: /validator|required|pattern|email/i, hint: '`ngforge_lookup topic="validation"` — validation rules' },
  { pattern: /derivation|expression/i, hint: '`ngforge_lookup topic="derivation"` — derivation syntax' },
  { pattern: /template|simplified/i, hint: '`ngforge_lookup topic="simplified-array"` — simplified array API' },
  { pattern: /responseMapping|validWhen/i, hint: '`ngforge_lookup topic="async-validators"` — async validator config' },
  { pattern: /array/i, hint: '`ngforge_lookup topic="array"` — array field configuration' },
];

/** Collect unique topic hints based on validation errors. */
function collectErrorTopicHints(errors: FormattedValidationError[]): string[] {
  const seenHints = new Set<string>();
  const hints: string[] = [];

  for (const error of errors) {
    const textToSearch = `${error.path} ${error.message}`;
    for (const { pattern, hint } of ERROR_TOPIC_HINTS) {
      if (pattern.test(textToSearch) && !seenHints.has(hint)) {
        seenHints.add(hint);
        hints.push(hint);
      }
    }
  }

  return hints;
}

/**
 * Hints for the JSON/object path. Same topic mapping as the file path, plus a
 * standing pointer to the pitfalls topic: when the model handed us a config
 * inline it has no file to re-read, so the catch-all is worth repeating.
 */
function collectObjectReportHints(errors: FormattedValidationError[]): string[] {
  if (errors.length === 0) {
    return [];
  }
  return [...collectErrorTopicHints(errors), 'Use `ngforge_lookup topic="pitfalls"` for common mistakes and solutions.'];
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
        const parsed = parseConfigInput(config);

        // File validation
        if (parsed.type === 'file') {
          // The same `.ng-forge/rules.json` the CLI honours. Without this the
          // two disagreed on the same file, while the generated guidance told
          // agents they run the same rules.
          const disabledRules = await projectDisabledRules(parsed.path);
          const result = await validateFile(parsed.path, uiIntegration as UiIntegration, { disabledRules });
          const report = formatFileReport(result, { relatedDocs: collectErrorTopicHints });

          // Counted by severity, as `validateSource` does. A finding downgraded
          // to a warning by a disabled rule does not block, so counting it as an
          // error reported `valid: true` beside `errorCount: 1`.
          const structured = {
            type: 'file',
            filePath: result.filePath,
            uiIntegration,
            configsFound: result.results.length,
            allValid: result.valid,
            errorCount: result.errorCount,
            warningCount: result.warningCount,
            results: result.results.map((r) => ({
              name: r.name,
              line: r.line,
              valid: r.validation.valid,
              errorCount: countBySeverity(r.validation.errors, 'error'),
              warningCount: countBySeverity(r.validation.errors, 'warning'),
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

        const report = formatConfigReport(uiIntegration as UiIntegration, result, { relatedDocs: collectObjectReportHints });

        const structured = {
          type: parsed.type,
          uiIntegration,
          valid: result.valid,
          errorCount: countBySeverity(result.errors, 'error'),
          warningCount: countBySeverity(result.errors, 'warning'),
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

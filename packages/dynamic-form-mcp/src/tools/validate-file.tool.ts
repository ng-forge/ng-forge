/**
 * Validate File Tool
 *
 * Reads a TypeScript/JavaScript file and extracts FormConfig objects
 * for validation using ts-morph AST parsing for robust handling of
 * complex patterns including:
 * - new Date() constructors
 * - Function references and arrow functions
 * - Regex literals
 * - External variable references
 * - Method calls like Math.floor()
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { validateFormConfig, type UiIntegration, type ValidationResult } from '@ng-forge/dynamic-forms-zod/mcp';
import {
  createSourceFile,
  findFormConfigCandidates,
  extractToJson,
  type FormConfigCandidate,
  type ExtractionResult,
} from '../utils/ast-extractor.js';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Result of extracting and validating a single FormConfig.
 */
interface ConfigValidationResult {
  name: string;
  line: number;
  matchReason: FormConfigCandidate['matchReason'];
  extraction: ExtractionResult;
  validation: ValidationResult;
}

/**
 * Format a validation report with detailed information about discovery,
 * extraction, and validation phases.
 */
function formatReport(
  filePath: string,
  uiIntegration: string,
  candidates: FormConfigCandidate[],
  results: ConfigValidationResult[],
): string {
  const lines: string[] = [];

  lines.push('# File Validation Report');
  lines.push('');
  lines.push(`**File:** ${filePath}`);
  lines.push(`**UI Integration:** ${uiIntegration}`);
  lines.push('');

  // Discovery Phase
  lines.push('## Discovery Phase');
  lines.push('');

  if (candidates.length === 0) {
    lines.push('**Found 0 FormConfig candidate(s)**');
    lines.push('');
    lines.push('Could not find any FormConfig objects in the file.');
    lines.push('');
    lines.push('### Detection Strategies Used');
    lines.push('');
    lines.push('1. **Satisfies clause** (recommended): `const x = {...} as const satisfies FormConfig`');
    lines.push('2. **Type annotation**: `const x: FormConfig = {...}`');
    lines.push('3. **As cast**: `const x = {...} as FormConfig`');
    lines.push('4. **Structural match**: Any object with `fields` array containing objects with `key` or `type`');
    lines.push('');
    lines.push('### Troubleshooting');
    lines.push('');
    lines.push('- Ensure the file path is absolute and the file exists');
    lines.push('- Check that FormConfig objects have a `fields` array at the root');
    lines.push('- Fields array elements must have `key` or `type` properties');
    lines.push('- For custom type aliases (e.g., `MyFormConfig`), structural detection will still find them');
    return lines.join('\n');
  }

  lines.push(`Found **${candidates.length}** FormConfig candidate(s):`);
  lines.push('');
  lines.push('| Name | Line | Detection Method |');
  lines.push('|------|------|------------------|');
  for (const candidate of candidates) {
    const reasonLabel = {
      'type-annotation': 'Type annotation',
      satisfies: 'as const satisfies',
      'as-cast': 'As cast',
      structural: 'Structural match',
    }[candidate.matchReason];
    lines.push(`| ${candidate.name} | ${candidate.startLine} | ${reasonLabel} |`);
  }
  lines.push('');

  // Extraction Warnings
  const hasWarnings = results.some((r) => r.extraction.warnings.length > 0);

  if (hasWarnings) {
    lines.push('## Extraction Warnings');
    lines.push('');
    lines.push('The following runtime values were replaced with placeholders:');
    lines.push('');

    for (const result of results) {
      if (result.extraction.warnings.length === 0) {
        continue;
      }

      lines.push(`### ${result.name}`);
      lines.push('');

      for (const warning of result.extraction.warnings) {
        lines.push(`- **${warning.path}**: ${warning.issue}`);
        lines.push(`  - Original: \`${warning.originalText}\``);
        lines.push(`  - Placeholder: \`${JSON.stringify(warning.placeholder)}\``);
      }
      lines.push('');
    }
  }

  // Validation Results
  lines.push('## Validation Results');
  lines.push('');

  const allValid = results.every((r) => r.validation.valid);
  const totalErrors = results.reduce((sum, r) => sum + (r.validation.errors?.length || 0), 0);

  if (allValid) {
    lines.push('### All Configs Valid');
    lines.push('');
    for (const result of results) {
      lines.push(`- **${result.name}** (line ${result.line}): Valid`);
      if (result.extraction.warnings.length > 0) {
        lines.push(`  - Note: ${result.extraction.warnings.length} runtime value(s) replaced with placeholders`);
      }
    }
  } else {
    lines.push(`**Total Errors:** ${totalErrors}`);
    lines.push('');

    for (const result of results) {
      const statusIcon = result.validation.valid ? 'Valid' : 'Invalid';
      lines.push(`### ${result.name} (line ${result.line}): ${statusIcon}`);
      lines.push('');

      if (result.validation.valid) {
        lines.push('All validatable properties passed schema validation.');
        if (result.extraction.warnings.length > 0) {
          lines.push(`Note: ${result.extraction.warnings.length} runtime value(s) could not be validated.`);
        }
      } else if (result.validation.errors) {
        for (const error of result.validation.errors) {
          lines.push(`- **${error.path}:** ${error.message}`);
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Format structured JSON output for programmatic consumption.
 */
function formatStructuredOutput(filePath: string, uiIntegration: string, results: ConfigValidationResult[]): object {
  return {
    filePath,
    uiIntegration,
    configsFound: results.length,
    allValid: results.every((r) => r.validation.valid),
    results: results.map((r) => ({
      name: r.name,
      startLine: r.line,
      matchReason: r.matchReason,
      valid: r.validation.valid,
      errors: r.validation.errors,
      extractionWarnings: r.extraction.warnings.length > 0 ? r.extraction.warnings : undefined,
    })),
  };
}

export function registerValidateFileTool(server: McpServer): void {
  server.tool(
    'ngforge_validate_file',
    `VALIDATION TOOL: Validate FormConfig in a TypeScript file. Use AFTER writing your config.

Returns SPECIFIC error messages with:
- Exact property that's wrong
- What the correct structure should look like
- Copy-paste fix suggestions

Handles complex syntax: new Date(), functions, regex, external variables.

Example errors you'll see:
- "Hidden field missing REQUIRED value property"
- "options MUST be at FIELD level, NOT inside props"
- "row containers do NOT support logic blocks"`,
    {
      filePath: z.string().describe('Absolute path to the TypeScript/JavaScript file containing FormConfig'),
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to validate against (material, bootstrap, primeng, ionic)'),
    },
    async ({ filePath, uiIntegration }) => {
      try {
        // 1. Read the file
        const source = await readFile(filePath, 'utf-8');

        // 2. Parse with ts-morph
        const sourceFile = createSourceFile(source, filePath);

        // 3. Find candidates using structural detection
        const candidates = findFormConfigCandidates(sourceFile);

        // 4. Extract and validate each candidate
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

        // 5. Format the report
        const report = formatReport(filePath, uiIntegration, candidates, results);
        const structured = formatStructuredOutput(filePath, uiIntegration, results);

        return {
          content: [
            { type: 'text' as const, text: report },
            { type: 'text' as const, text: '\n\n```json\n' + JSON.stringify(structured, null, 2) + '\n```' },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return {
          content: [
            {
              type: 'text' as const,
              text: `# File Validation Error\n\n**File:** ${filePath}\n**Error:** ${message}\n\nMake sure the file exists and contains valid TypeScript/JavaScript.`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}

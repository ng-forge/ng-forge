/**
 * Validate File Tool
 *
 * Reads a TypeScript/JavaScript file and extracts FormConfig objects
 * for validation. Handles common export patterns.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { readFile } from 'fs/promises';
import { validateFormConfig, type UiIntegration, type ValidationResult } from '@ng-forge/dynamic-forms-zod/mcp';

const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/**
 * Extract FormConfig objects from TypeScript/JavaScript source code.
 * Handles common patterns like:
 * - const config: FormConfig = { fields: [...] }
 * - const config: FormConfig<T> = { fields: [...] }
 * - export const config = { fields: [...] } satisfies FormConfig
 * - export const config = { fields: [...] } as FormConfig
 * - { fields: [...] } (standalone object)
 */
function extractFormConfigs(source: string): Array<{ name: string; config: unknown; startLine: number }> {
  const configs: Array<{ name: string; config: unknown; startLine: number }> = [];
  const foundNames = new Set<string>();

  // Pattern 1: Type annotation - const varName: FormConfig = { ... }
  // Also handles: FormConfig<T>, FormConfig | undefined, etc.
  const typeAnnotationRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*:\s*FormConfig(?:<[^>]*>|\s*\|[^=]*)?\s*=\s*/gm;

  let match;
  while ((match = typeAnnotationRegex.exec(source)) !== null) {
    const varName = match[1];
    if (foundNames.has(varName)) continue;

    const startIndex = match.index + match[0].length;
    const startLine = source.substring(0, match.index).split('\n').length;

    try {
      const config = extractObjectAtPosition(source, startIndex);
      if (config && typeof config === 'object' && 'fields' in config) {
        configs.push({ name: varName, config, startLine });
        foundNames.add(varName);
      }
    } catch {
      // Skip malformed configs
    }
  }

  // Pattern 2: satisfies FormConfig - const varName = { ... } satisfies FormConfig
  const satisfiesRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(\{[\s\S]*?\})\s*satisfies\s+FormConfig/gm;

  while ((match = satisfiesRegex.exec(source)) !== null) {
    const varName = match[1];
    if (foundNames.has(varName)) continue;

    const startLine = source.substring(0, match.index).split('\n').length;

    // Find the object start position
    const objectStartMatch = source.substring(match.index).match(/=\s*\{/);
    if (!objectStartMatch) continue;

    const startIndex = match.index + (objectStartMatch.index ?? 0) + objectStartMatch[0].length - 1;

    try {
      const config = extractObjectAtPosition(source, startIndex);
      if (config && typeof config === 'object' && 'fields' in config) {
        configs.push({ name: varName, config, startLine });
        foundNames.add(varName);
      }
    } catch {
      // Skip malformed configs
    }
  }

  // Pattern 3: as FormConfig - const varName = { ... } as FormConfig
  const asRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(\{[\s\S]*?\})\s*as\s+FormConfig/gm;

  while ((match = asRegex.exec(source)) !== null) {
    const varName = match[1];
    if (foundNames.has(varName)) continue;

    const startLine = source.substring(0, match.index).split('\n').length;

    // Find the object start position
    const objectStartMatch = source.substring(match.index).match(/=\s*\{/);
    if (!objectStartMatch) continue;

    const startIndex = match.index + (objectStartMatch.index ?? 0) + objectStartMatch[0].length - 1;

    try {
      const config = extractObjectAtPosition(source, startIndex);
      if (config && typeof config === 'object' && 'fields' in config) {
        configs.push({ name: varName, config, startLine });
        foundNames.add(varName);
      }
    } catch {
      // Skip malformed configs
    }
  }

  // Pattern 4: Variable with FormConfig in comment or inferred type
  // Look for variables assigned objects with fields arrays
  const variableWithFieldsRegex = /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*\{/gm;

  while ((match = variableWithFieldsRegex.exec(source)) !== null) {
    const varName = match[1];
    if (foundNames.has(varName)) continue;

    const startIndex = match.index + match[0].length - 1;
    const startLine = source.substring(0, match.index).split('\n').length;

    try {
      const config = extractObjectAtPosition(source, startIndex);
      if (config && typeof config === 'object' && 'fields' in config && Array.isArray((config as Record<string, unknown>).fields)) {
        // Check if "fields" contains objects that look like form fields
        const fields = (config as { fields: unknown[] }).fields;
        if (fields.length > 0 && typeof fields[0] === 'object' && fields[0] !== null) {
          const firstField = fields[0] as Record<string, unknown>;
          if ('key' in firstField || 'type' in firstField) {
            configs.push({ name: varName, config, startLine });
            foundNames.add(varName);
          }
        }
      }
    } catch {
      // Skip malformed configs
    }
  }

  // Pattern 5: Fallback - any object literal with fields: [ as top-level
  if (configs.length === 0) {
    const fieldsRegex = /\{\s*fields\s*:\s*\[/gm;
    while ((match = fieldsRegex.exec(source)) !== null) {
      const startIndex = match.index;
      const startLine = source.substring(0, match.index).split('\n').length;

      try {
        const config = extractObjectAtPosition(source, startIndex);
        if (config && typeof config === 'object' && 'fields' in config) {
          const name = `config_line_${startLine}`;
          if (!foundNames.has(name)) {
            configs.push({ name, config, startLine });
            foundNames.add(name);
          }
        }
      } catch {
        // Skip malformed configs
      }
    }
  }

  return configs;
}

/**
 * Extract a JavaScript object starting at a given position.
 * Handles nested braces and common TypeScript syntax.
 */
function extractObjectAtPosition(source: string, startIndex: number): unknown {
  // Find the opening brace
  let braceStart = startIndex;
  while (braceStart < source.length && source[braceStart] !== '{') {
    braceStart++;
  }

  if (braceStart >= source.length) {
    throw new Error('No object found');
  }

  // Find matching closing brace
  let depth = 0;
  let inString = false;
  let stringChar = '';
  let i = braceStart;

  while (i < source.length) {
    const char = source[i];
    const prevChar = i > 0 ? source[i - 1] : '';

    // Handle string boundaries
    if ((char === '"' || char === "'" || char === '`') && prevChar !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = char;
      } else if (char === stringChar) {
        inString = false;
      }
    }

    // Track brace depth (only outside strings)
    if (!inString) {
      if (char === '{') depth++;
      if (char === '}') depth--;

      if (depth === 0) {
        break;
      }
    }

    i++;
  }

  if (depth !== 0) {
    throw new Error('Unbalanced braces');
  }

  // Extract the object literal
  let objectStr = source.substring(braceStart, i + 1);

  // Clean up TypeScript-specific syntax for JSON parsing
  objectStr = cleanForParsing(objectStr);

  // Try to parse as JSON-like object
  try {
    // Use Function constructor to evaluate as JavaScript (safer than eval)
    const fn = new Function(`return (${objectStr})`);
    return fn();
  } catch {
    throw new Error('Failed to parse object');
  }
}

/**
 * Clean TypeScript/JavaScript object literal for parsing.
 */
function cleanForParsing(source: string): string {
  let result = source;

  // Remove TypeScript type annotations from property values
  // e.g., value: 'test' as const -> value: 'test'
  result = result.replace(/:\s*('[^']*'|"[^"]*")\s+as\s+const/g, ': $1');

  // Remove trailing commas before closing braces/brackets
  result = result.replace(/,(\s*[}\]])/g, '$1');

  // Handle template literals with simple expressions (convert to regular strings)
  // This is a simplification - complex template literals won't work
  result = result.replace(/`([^`]*)`/g, (_, content) => {
    // If it contains ${}, it's a template literal with expressions - keep as is
    if (content.includes('${')) {
      return `"${content.replace(/"/g, '\\"')}"`;
    }
    return `"${content.replace(/"/g, '\\"')}"`;
  });

  return result;
}

/**
 * Format validation results for file-based validation.
 */
function formatFileValidationResult(
  filePath: string,
  configs: Array<{ name: string; config: unknown; startLine: number }>,
  results: Array<{ name: string; startLine: number; result: ValidationResult }>,
  uiIntegration: string,
): string {
  const lines: string[] = [];

  lines.push(`# File Validation Report`);
  lines.push('');
  lines.push(`**File:** ${filePath}`);
  lines.push(`**UI Integration:** ${uiIntegration}`);
  lines.push(`**Configs Found:** ${configs.length}`);
  lines.push('');

  if (configs.length === 0) {
    lines.push('## No FormConfig Objects Found');
    lines.push('');
    lines.push('Could not find any FormConfig objects in the file.');
    lines.push('');
    lines.push('**Expected patterns:**');
    lines.push('- `const myConfig: FormConfig = { fields: [...] }`');
    lines.push('- `export const config: FormConfig = { fields: [...] }`');
    lines.push('- `{ fields: [...] }` (standalone object)');
    return lines.join('\n');
  }

  const allValid = results.every((r) => r.result.valid);
  const totalErrors = results.reduce((sum, r) => sum + (r.result.errors?.length || 0), 0);

  if (allValid) {
    lines.push(`## ✅ ALL CONFIGS VALID`);
    lines.push('');
    for (const { name, startLine } of configs) {
      lines.push(`- **${name}** (line ${startLine}): Valid`);
    }
  } else {
    lines.push(`## ❌ VALIDATION ERRORS FOUND`);
    lines.push('');
    lines.push(`Total errors: ${totalErrors}`);
    lines.push('');

    for (const { name, startLine, result } of results) {
      if (result.valid) {
        lines.push(`### ${name} (line ${startLine}): ✅ Valid`);
      } else {
        lines.push(`### ${name} (line ${startLine}): ❌ Invalid`);
        lines.push('');
        if (result.errors) {
          for (const error of result.errors) {
            lines.push(`- **${error.path}:** ${error.message}`);
          }
        }
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function registerValidateFileTool(server: McpServer): void {
  server.tool(
    'ngforge_validate_file',
    'Reads a TypeScript/JavaScript file and validates all FormConfig objects found in it. Extracts configs from common patterns like `const config: FormConfig = {...}`. Use this to validate your actual source files instead of manually converting to JSON.',
    {
      filePath: z.string().describe('Absolute path to the TypeScript/JavaScript file containing FormConfig'),
      uiIntegration: z.enum(UI_INTEGRATIONS).describe('UI library to validate against (material, bootstrap, primeng, ionic)'),
    },
    async ({ filePath, uiIntegration }) => {
      try {
        // Read the file
        const source = await readFile(filePath, 'utf-8');

        // Extract FormConfig objects
        const configs = extractFormConfigs(source);

        // Validate each config
        const results = configs.map(({ name, config, startLine }) => ({
          name,
          startLine,
          result: validateFormConfig(uiIntegration as UiIntegration, config),
        }));

        // Format the output
        const output = formatFileValidationResult(filePath, configs, results, uiIntegration);

        // Also return structured data
        const structured = {
          filePath,
          uiIntegration,
          configsFound: configs.length,
          allValid: results.every((r) => r.result.valid),
          results: results.map((r) => ({
            name: r.name,
            startLine: r.startLine,
            valid: r.result.valid,
            errors: r.result.errors,
          })),
        };

        return {
          content: [
            { type: 'text' as const, text: output },
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

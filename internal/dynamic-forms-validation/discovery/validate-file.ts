/** FormConfig discovery and validation over source files. */

import { readFile } from 'node:fs/promises';
import { validateFormConfig, type UiIntegration, type ValidateConfigOptions, type ValidationResult } from '../validate/src';
import {
  createSourceFile,
  findFormConfigCandidates,
  extractToJson,
  type FormConfigCandidate,
  type ExtractionResult,
} from './ast-extractor';

/** The four UI integrations a config can be validated against. */
export const UI_INTEGRATIONS = ['material', 'bootstrap', 'primeng', 'ionic'] as const;

/** Outcome of extracting and validating a single FormConfig found in a file. */
export interface ConfigValidationResult {
  /** Variable or property name the config was declared under. */
  name: string;
  /** 1-indexed line of the declaration. */
  line: number;
  /** How the config was identified (satisfies, type annotation, structural match). */
  matchReason: FormConfigCandidate['matchReason'];
  /** Runtime values that had to be replaced with placeholders to validate statically. */
  extraction: ExtractionResult;
  /** Schema validation outcome. */
  validation: ValidationResult;
}

/** Aggregate result for one source file. */
export interface FileValidationResult {
  filePath: string;
  uiIntegration: UiIntegration;
  /** Every FormConfig found in the file, in declaration order. */
  results: ConfigValidationResult[];
  /** True when the file contained no recognisable FormConfig. */
  noConfigsFound: boolean;
  /** True when every config found is valid. Vacuously true for a file with none. */
  valid: boolean;
  /** Total error count across every config in the file. */
  errorCount: number;
}

/**
 * Extract and validate every FormConfig in a TypeScript/JavaScript source string.
 *
 * Kept separate from {@link validateFile} so callers that already hold the
 * source (an editor buffer, an MCP tool argument) do not have to touch disk.
 */
export function validateSource(
  source: string,
  filePath: string,
  uiIntegration: UiIntegration,
  options?: ValidateConfigOptions,
): FileValidationResult {
  const sourceFile = createSourceFile(source, filePath);
  const candidates = findFormConfigCandidates(sourceFile);

  const results: ConfigValidationResult[] = candidates.map((candidate) => {
    const extraction = extractToJson(candidate.objectLiteral);
    return {
      name: candidate.name,
      line: candidate.startLine,
      matchReason: candidate.matchReason,
      extraction,
      validation: validateFormConfig(uiIntegration, extraction.value, options),
    };
  });

  return {
    filePath,
    uiIntegration,
    results,
    noConfigsFound: results.length === 0,
    valid: results.every((r) => r.validation.valid),
    errorCount: results.reduce((sum, r) => sum + (r.validation.errors?.length ?? 0), 0),
  };
}

/** Read a source file from disk and validate every FormConfig it declares. */
export async function validateFile(
  filePath: string,
  uiIntegration: UiIntegration,
  options?: ValidateConfigOptions,
): Promise<FileValidationResult> {
  const source = await readFile(filePath, 'utf-8');
  return validateSource(source, filePath, uiIntegration, options);
}

/** Validate an already-parsed config object. */
export function validateConfigObject(config: unknown, uiIntegration: UiIntegration): ValidationResult {
  return validateFormConfig(uiIntegration, config);
}

/** Narrowed form of the accepted `config` inputs. */
export type ParsedConfigInput =
  { type: 'file'; path: string } | { type: 'json'; data: Record<string, unknown> } | { type: 'object'; data: Record<string, unknown> };

/** Heuristic: does this string look like a path rather than inline JSON? */
function isFilePath(value: string): boolean {
  return (
    value.startsWith('/') ||
    value.startsWith('./') ||
    value.startsWith('../') ||
    value.startsWith('~') ||
    /^[a-zA-Z]:\\/.test(value) ||
    value.endsWith('.ts') ||
    value.endsWith('.js') ||
    value.endsWith('.tsx') ||
    value.endsWith('.jsx')
  );
}

/**
 * Classify a `config` argument that may be a file path, a JSON string, or an
 * already-parsed object. Used by callers that accept loosely-typed input.
 */
export function parseConfigInput(config: string | Record<string, unknown>): ParsedConfigInput {
  if (typeof config === 'object') {
    return { type: 'object', data: config };
  }

  const trimmed = config.trim();

  if (isFilePath(trimmed)) {
    return { type: 'file', path: trimmed };
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      return { type: 'json', data: JSON.parse(trimmed) };
    } catch {
      // Looked like JSON but did not parse; fall through to treating it as a path.
      return { type: 'file', path: trimmed };
    }
  }

  return { type: 'file', path: trimmed };
}

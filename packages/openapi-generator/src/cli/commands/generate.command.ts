import type { Command } from 'commander';
import { parseOpenAPISpec } from '../../parser/openapi-parser.js';
import { extractEndpoints } from '../../parser/endpoint-extractor.js';
import type { EndpointInfo } from '../../parser/endpoint-extractor.js';
import { mapSchemaToFields } from '../../mapper/schema-to-fields.js';
import type { MappingOptions, MappingResult } from '../../mapper/schema-to-fields.js';
import { generateFormConfig } from '../../generator/form-config-generator.js';
import { generateInterface } from '../../generator/interface-generator.js';
import { generateBarrel } from '../../generator/barrel-generator.js';
import { writeGeneratedFiles } from '../../generator/file-writer.js';
import type { GeneratedFile } from '../../generator/file-writer.js';
import { toFormFileName } from '../../utils/naming.js';
import { logger } from '../../utils/logger.js';
import { setLogLevel } from '../../utils/logger.js';
import { loadConfig, saveConfig } from '../../config/generator-config.js';
import type { GeneratorConfig } from '../../config/generator-config.js';
import { promptEndpointSelection } from '../prompts/endpoint-prompt.js';
import { promptFieldTypeChoices } from '../prompts/field-type-prompt.js';
import { startWatcher } from '../../watcher/file-watcher.js';
import { DEFAULT_FIELD_CHOICES } from '../../config/defaults.js';

interface GenerateOptions {
  spec: string;
  output: string;
  interactive: 'full' | 'none';
  endpoints?: string;
  readOnly?: boolean;
  watch?: boolean;
  config?: string;
  dryRun?: boolean;
  skipExisting?: boolean;
  verbose?: boolean;
  quiet?: boolean;
}

/**
 * Register generate options directly on the given Command (no subcommand).
 */
export function registerGenerateOptions(cmd: Command): void {
  cmd
    .requiredOption('--spec <path>', 'Path to OpenAPI spec file')
    .requiredOption('--output <path>', 'Output directory for generated files')
    .option(
      '--interactive <mode>',
      'Prompt mode: full (select endpoints + resolve ambiguous types) or none (auto-select, falls back to none in non-TTY)',
      (value: string) => {
        if (value !== 'full' && value !== 'none') {
          throw new Error(`Invalid interactive mode '${value}'. Allowed values: full, none`);
        }
        return value as 'full' | 'none';
      },
      'full',
    )
    .option('--endpoints <list>', 'Comma-separated endpoints, e.g. "POST:/users,PUT:/users/{id}"')
    .option('--read-only', 'Generate GET endpoint forms with all fields disabled')
    .option('--watch', 'Watch spec file for changes and regenerate')
    .option('--config <path>', 'Directory for .ng-forge-generator.json config (defaults to --output)')
    .option('--dry-run', 'List files that would be generated without writing them')
    .option('--skip-existing', 'Skip files that already exist on disk')
    .option('--verbose', 'Show detailed output including field mapping decisions')
    .option('--quiet', 'Suppress info output; still shows success summary, warnings, and errors')
    .addHelpText('after', '\nNote: Generated files are not formatted. Run your project formatter (e.g. prettier) after generation.');
}

/**
 * Action handler for the generate command.
 */
export async function runGenerateAction(options: GenerateOptions): Promise<void> {
  if (options.verbose && options.quiet) {
    logger.error('Cannot use --verbose and --quiet together');
    process.exit(1);
  }
  if (options.verbose) setLogLevel('verbose');
  if (options.quiet) setLogLevel('quiet');

  // Auto-detect non-TTY environments and fall back to non-interactive mode
  if (options.interactive === 'full' && !process.stdin.isTTY) {
    logger.warn('Non-interactive terminal detected, falling back to --interactive none');
    options.interactive = 'none';
  }

  await runGenerate(options);
}

async function runGenerate(options: GenerateOptions): Promise<void> {
  const configDir = options.config ?? options.output;
  const existingConfig = await loadConfig(configDir);
  const decisions = existingConfig?.decisions ?? {};

  if (existingConfig) {
    logger.info(`Loaded config from ${configDir}/.ng-forge-generator.json (${existingConfig.endpoints.length} saved endpoint(s))`);
  }

  logger.info(`Parsing OpenAPI spec: ${options.spec}`);
  const spec = await parseOpenAPISpec(options.spec);
  const allEndpoints = extractEndpoints(spec);

  if (allEndpoints.length === 0) {
    logger.warn('No endpoints found in the spec');
    process.exit(1);
  }

  logger.verbose(`Found ${allEndpoints.length} endpoint(s): ${allEndpoints.map((ep) => `${ep.method}:${ep.path}`).join(', ')}`);

  let selectedEndpoints: EndpointInfo[];
  if (options.interactive === 'none' || options.endpoints) {
    // Use CLI --endpoints if provided, otherwise fall back to saved config endpoints
    const endpointFilter = options.endpoints ?? existingConfig?.endpoints?.join(',');

    if (endpointFilter) {
      selectedEndpoints = filterEndpoints(allEndpoints, endpointFilter);
    } else {
      // No explicit filter: auto-select all endpoints
      selectedEndpoints = allEndpoints;
    }

    // Warn about requested endpoints not found in the spec
    const filterSource = options.endpoints ?? endpointFilter;
    if (filterSource) {
      const requested = filterSource.split(',').map((s) => s.trim());
      const matched = new Set(selectedEndpoints.map((ep) => `${ep.method}:${ep.path}`));
      for (const req of requested) {
        if (!matched.has(req)) {
          logger.warn(`Requested endpoint '${req}' was not found in the spec`);
        }
      }
    }
  } else {
    selectedEndpoints = await promptEndpointSelection(allEndpoints);
  }

  if (selectedEndpoints.length === 0) {
    logger.warn('No endpoints selected');
    process.exit(1);
  }

  const allFiles: GeneratedFile[] = [];
  const allFormFileNames: string[] = [];
  const allInterfaceFileNames: string[] = [];
  const updatedDecisions = { ...decisions };
  const processedEndpoints: string[] = [];
  const configEndpoints: string[] = [];

  for (const endpoint of selectedEndpoints) {
    const schema = endpoint.requestBodySchema ?? endpoint.responseSchema;
    if (!schema) {
      logger.warn(`No schema found for ${endpoint.method} ${endpoint.path}, skipping`);
      continue;
    }

    const isGet = endpoint.method === 'GET';
    const editable = isGet ? !(options.readOnly ?? false) : true;

    // Skip GET endpoints whose response is a top-level array (produces empty form)
    if (isGet && schema.type === 'array') {
      logger.warn(`${endpoint.method} ${endpoint.path}: Response is a top-level array, skipping (no form fields to generate)`);
      continue;
    }

    if (isGet && options.readOnly) {
      logger.verbose(`${endpoint.method} ${endpoint.path}: fields disabled (--read-only mode)`);
    }

    const schemaName = endpoint.operationId ?? `${endpoint.method}${endpoint.path}`;

    const mappingOptions: MappingOptions = {
      editable,
      decisions: updatedDecisions,
      schemaName,
    };

    let result: MappingResult = mapSchemaToFields(schema, endpoint.requiredFields, mappingOptions);

    for (const warning of result.warnings) {
      logger.warn(`${endpoint.method} ${endpoint.path}: ${warning}`);
    }

    if (result.ambiguousFields.length > 0 && options.interactive === 'full') {
      logger.info(`\nAmbiguous fields in ${endpoint.method} ${endpoint.path}:`);
      const newDecisions = await promptFieldTypeChoices(result.ambiguousFields);
      Object.assign(updatedDecisions, newDecisions);

      result = mapSchemaToFields(schema, endpoint.requiredFields, {
        ...mappingOptions,
        decisions: updatedDecisions,
      });
    }

    // In non-interactive mode, apply default field choices for any remaining ambiguous fields
    if (result.ambiguousFields.length > 0 && options.interactive === 'none') {
      const defaultsByScope = new Map<string, string[]>();
      for (const ambiguous of result.ambiguousFields) {
        if (!updatedDecisions[ambiguous.fieldPath]) {
          const defaultChoice = DEFAULT_FIELD_CHOICES[ambiguous.scope];
          if (defaultChoice) {
            updatedDecisions[ambiguous.fieldPath] = defaultChoice;
            const list = defaultsByScope.get(ambiguous.scope) ?? [];
            list.push(ambiguous.fieldPath);
            defaultsByScope.set(ambiguous.scope, list);
          }
        }
      }
      for (const [scope, fields] of defaultsByScope) {
        const choice = DEFAULT_FIELD_CHOICES[scope];
        if (fields.length <= 2) {
          for (const fieldPath of fields) {
            logger.verbose(`Field '${fieldPath}': resolved ambiguous ${scope} → '${choice}' (default)`);
          }
        } else {
          logger.verbose(`${fields.length} ${scope} fields resolved to '${choice}' (default): ${fields.join(', ')}`);
        }
      }

      result = mapSchemaToFields(schema, endpoint.requiredFields, {
        ...mappingOptions,
        decisions: updatedDecisions,
      });
    }

    const formFileName = toFormFileName(endpoint.method, endpoint.path, endpoint.operationId);

    logger.verbose(`${endpoint.method} ${endpoint.path} → forms/${formFileName}`);

    for (const field of result.fields) {
      logFieldDecisions(field, '  ');
    }

    const formContent = generateFormConfig(result.fields, {
      method: endpoint.method,
      path: endpoint.path,
      operationId: endpoint.operationId,
    });

    allFiles.push({
      fileName: formFileName,
      content: formContent,
      subdirectory: 'forms',
    });
    allFormFileNames.push(formFileName);

    const interfaceContent = generateInterface(schema, {
      method: endpoint.method,
      path: endpoint.path,
      operationId: endpoint.operationId,
    });

    const interfaceFileName = formFileName.replace('.form.ts', '.types.ts');
    allFiles.push({
      fileName: interfaceFileName,
      content: interfaceContent,
      subdirectory: 'types',
    });
    allInterfaceFileNames.push(interfaceFileName);
    processedEndpoints.push(`${endpoint.method} ${endpoint.path}`);
    configEndpoints.push(`${endpoint.method}:${endpoint.path}`);
  }

  allFiles.push({
    fileName: 'index.ts',
    content: generateBarrel(allFormFileNames),
    subdirectory: 'forms',
  });
  allFiles.push({
    fileName: 'index.ts',
    content: generateBarrel(allInterfaceFileNames),
    subdirectory: 'types',
  });

  if (allFormFileNames.length === 0) {
    logger.warn('No forms generated — all selected endpoints were skipped (e.g. top-level array responses)');
    return;
  }

  if (options.dryRun) {
    logger.info('Dry run — files that would be generated:');
    for (const file of allFiles) {
      const dir = file.subdirectory ? `${file.subdirectory}/` : '';
      logger.info(`  ${dir}${file.fileName}`);
    }
    return;
  }

  const { writtenPaths, unchangedCount } = await writeGeneratedFiles(options.output, allFiles, { skipExisting: options.skipExisting });
  const skippedCount = allFiles.length - writtenPaths.length - unchangedCount;
  const formCount = allFormFileNames.length;

  const suffixParts: string[] = [];
  if (unchangedCount > 0) suffixParts.push(`${unchangedCount} unchanged`);
  if (skippedCount > 0) suffixParts.push(`${skippedCount} skipped`);
  const suffix = suffixParts.length > 0 ? ` (${suffixParts.join(', ')})` : '';

  logger.success(
    `Wrote ${writtenPaths.length} file${writtenPaths.length !== 1 ? 's' : ''} in ${options.output}${suffix} — ${formCount} form${formCount !== 1 ? 's' : ''}`,
  );

  // Summary: list processed endpoints
  logger.info(`  Endpoints: ${processedEndpoints.join(', ')}`);

  const interfaceCount = allInterfaceFileNames.length;
  const barrelCount = 2;
  logger.info(
    `  ${formCount} form config${formCount !== 1 ? 's' : ''}, ${interfaceCount} interface${interfaceCount !== 1 ? 's' : ''}, ${barrelCount} barrel files`,
  );
  logger.info('  Tip: Run your project formatter (e.g. Prettier) on the output directory');

  const config: GeneratorConfig = {
    spec: options.spec,
    output: options.output,
    endpoints: configEndpoints,
    decisions: updatedDecisions,
    readOnly: options.readOnly,
  };
  await saveConfig(configDir, config);

  if (options.watch) {
    const watcher = startWatcher({
      specPath: options.spec,
      onChange: async () => {
        // Detect new endpoints not yet in the saved config
        const currentConfig = await loadConfig(configDir);
        const savedEndpointKeys = new Set(currentConfig?.endpoints ?? []);
        const freshSpec = await parseOpenAPISpec(options.spec);
        const freshEndpoints = extractEndpoints(freshSpec);
        const newEndpoints = freshEndpoints.filter((ep) => !savedEndpointKeys.has(`${ep.method}:${ep.path}`));

        if (newEndpoints.length > 0) {
          const newKeys = newEndpoints.map((ep) => `${ep.method}:${ep.path}`).join(', ');
          logger.info(`New endpoint(s) detected: ${newKeys}. Re-run without --watch to select them.`);
        }

        await runGenerate({ ...options, watch: false, interactive: 'none' });
      },
    });

    process.on('SIGINT', () => {
      logger.info('\nStopping watcher...');
      watcher.close().then(() => process.exit(0));
    });

    logger.info(`Press Ctrl+C to stop watching ${options.spec}`);
    await new Promise(() => {
      // Keep process alive until user terminates
    });
  }
}

function logFieldDecisions(
  field: { key: string; type: string; fields?: { key: string; type: string; fields?: unknown[] }[]; template?: unknown },
  indent: string,
): void {
  logger.verbose(`${indent}${field.key} → ${field.type}`);
  if (field.fields) {
    for (const child of field.fields) {
      logFieldDecisions(child as typeof field, indent + '  ');
    }
  }
  if (field.template) {
    if (Array.isArray(field.template)) {
      for (const child of field.template) {
        logFieldDecisions(child as typeof field, indent + '  ');
      }
    } else {
      logFieldDecisions(field.template as typeof field, indent + '  ');
    }
  }
}

export function filterEndpoints(allEndpoints: EndpointInfo[], filter?: string): EndpointInfo[] {
  if (!filter) return allEndpoints;

  const requested = filter.split(',').map((s) => s.trim());
  return allEndpoints.filter((ep) => {
    const key = `${ep.method}:${ep.path}`;
    return requested.includes(key);
  });
}

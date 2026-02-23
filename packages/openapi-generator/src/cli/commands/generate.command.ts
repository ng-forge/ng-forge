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
import { toFormFileName, toInterfaceName } from '../../utils/naming.js';
import { logger } from '../../utils/logger.js';
import { loadConfig, saveConfig } from '../../config/generator-config.js';
import type { GeneratorConfig } from '../../config/generator-config.js';
import { promptEndpointSelection } from '../prompts/endpoint-prompt.js';
import { promptFieldTypeChoices } from '../prompts/field-type-prompt.js';
import { startWatcher } from '../../watcher/file-watcher.js';

interface GenerateOptions {
  spec: string;
  output: string;
  interactive: 'full' | 'none';
  endpoints?: string;
  editable?: boolean;
  watch?: boolean;
  config?: string;
}

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Generate dynamic form configurations from an OpenAPI spec')
    .requiredOption('--spec <path>', 'Path to OpenAPI spec file')
    .requiredOption('--output <path>', 'Output directory for generated files')
    .option('--interactive <mode>', 'Interactive mode: full or none', 'full')
    .option('--endpoints <list>', 'Comma-separated METHOD:/path endpoints (for non-interactive)')
    .option('--editable', 'Generate editable forms for GET endpoints')
    .option('--watch', 'Watch spec file for changes and regenerate')
    .option('--config <path>', 'Path to config file directory')
    .action(async (options: GenerateOptions) => {
      await runGenerate(options);
    });
}

async function runGenerate(options: GenerateOptions): Promise<void> {
  const configDir = options.config ?? process.cwd();
  const existingConfig = await loadConfig(configDir);
  const decisions = existingConfig?.decisions ?? {};

  logger.info(`Parsing OpenAPI spec: ${options.spec}`);
  const spec = await parseOpenAPISpec(options.spec);
  const allEndpoints = extractEndpoints(spec);

  if (allEndpoints.length === 0) {
    logger.warn('No endpoints found in the spec');
    return;
  }

  let selectedEndpoints: EndpointInfo[];
  if (options.interactive === 'none' || options.endpoints) {
    selectedEndpoints = filterEndpoints(allEndpoints, options.endpoints);
  } else {
    selectedEndpoints = await promptEndpointSelection(allEndpoints);
  }

  if (selectedEndpoints.length === 0) {
    logger.warn('No endpoints selected');
    return;
  }

  const allFiles: GeneratedFile[] = [];
  const allFormFileNames: string[] = [];
  const allInterfaceFileNames: string[] = [];
  const updatedDecisions = { ...decisions };

  for (const endpoint of selectedEndpoints) {
    const schema = endpoint.requestBodySchema ?? endpoint.responseSchema;
    if (!schema) {
      logger.warn(`No schema found for ${endpoint.method} ${endpoint.path}, skipping`);
      continue;
    }

    const isGet = endpoint.method === 'GET';
    const editable = options.editable ?? false;
    const schemaName = endpoint.operationId ?? `${endpoint.method}${endpoint.path}`;

    const mappingOptions: MappingOptions = {
      editable: isGet ? editable : true,
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

    const formFileName = toFormFileName(endpoint.method, endpoint.path, endpoint.operationId);
    const interfaceName = toInterfaceName(endpoint.method, endpoint.path, endpoint.operationId);

    const formContent = generateFormConfig(result.fields, {
      method: endpoint.method,
      path: endpoint.path,
      operationId: endpoint.operationId,
      interfaceName,
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

  const writtenPaths = await writeGeneratedFiles(options.output, allFiles);
  logger.success(`Generated ${writtenPaths.length} files in ${options.output}`);

  const config: GeneratorConfig = {
    spec: options.spec,
    output: options.output,
    endpoints: selectedEndpoints.map((e) => `${e.method}:${e.path}`),
    decisions: updatedDecisions,
    editable: options.editable,
  };
  await saveConfig(configDir, config);

  if (options.watch) {
    startWatcher({
      specPath: options.spec,
      onChange: async () => {
        await runGenerate({ ...options, watch: false, interactive: 'none' });
      },
    });

    logger.info('Press Ctrl+C to stop watching');
    await new Promise(() => {
      // Keep process alive until user terminates
    });
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

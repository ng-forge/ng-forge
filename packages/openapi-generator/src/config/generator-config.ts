import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { logger } from '../utils/logger.js';

export interface GeneratorConfig {
  spec: string;
  output: string;
  endpoints: string[];
  decisions: Record<string, string>;
  editable?: boolean;
}

const CONFIG_FILENAME = '.ng-forge-generator.json';

export async function loadConfig(dir: string): Promise<GeneratorConfig | null> {
  try {
    const content = await readFile(join(dir, CONFIG_FILENAME), 'utf-8');
    return JSON.parse(content) as GeneratorConfig;
  } catch {
    return null;
  }
}

export async function saveConfig(dir: string, config: GeneratorConfig): Promise<void> {
  const filePath = join(dir, CONFIG_FILENAME);
  await writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
  logger.info(`Config saved to ${filePath}`);
}

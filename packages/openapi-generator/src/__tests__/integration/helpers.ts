import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const fixtureDir = resolve(__dirname, '__fixtures__');

export function fixturePath(name: string): string {
  return join(fixtureDir, name);
}

export async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'openapi-gen-integration-'));
}

export async function cleanupDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export async function readGenerated(outputDir: string, subdirectory: string, fileName: string): Promise<string> {
  return readFile(join(outputDir, subdirectory, fileName), 'utf-8');
}

export async function readConfigFile(dir: string): Promise<Record<string, unknown>> {
  const content = await readFile(join(dir, '.ng-forge-generator.json'), 'utf-8');
  return JSON.parse(content);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

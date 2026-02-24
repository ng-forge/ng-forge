import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface GeneratedFile {
  fileName: string;
  content: string;
  subdirectory?: string;
}

export interface WriteOptions {
  skipExisting?: boolean;
}

export async function writeGeneratedFiles(outputDir: string, files: GeneratedFile[], options?: WriteOptions): Promise<string[]> {
  const writtenPaths: string[] = [];

  for (const file of files) {
    const dir = file.subdirectory ? join(outputDir, file.subdirectory) : outputDir;
    await mkdir(dir, { recursive: true });

    const filePath = join(dir, file.fileName);

    // Skip existing files when option is set
    if (options?.skipExisting) {
      const exists = await readFileSafe(filePath);
      if (exists !== null) {
        continue;
      }
    }

    // Only write if content changed
    const existing = await readFileSafe(filePath);
    if (existing !== file.content) {
      await writeFile(filePath, file.content, 'utf-8');
    }

    writtenPaths.push(filePath);
  }

  return writtenPaths;
}

async function readFileSafe(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf-8');
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

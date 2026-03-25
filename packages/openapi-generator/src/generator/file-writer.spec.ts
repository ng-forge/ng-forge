import { mkdtemp, rm, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { writeGeneratedFiles } from './file-writer';
import type { GeneratedFile } from './file-writer';

describe('writeGeneratedFiles', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'file-writer-test-'));
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('should write files to disk', async () => {
    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'export const form = {};' }];

    const result = await writeGeneratedFiles(tempDir, files);

    expect(result.writtenPaths).toHaveLength(1);
    expect(result.writtenPaths[0]).toBe(join(tempDir, 'form.ts'));
    expect(result.unchangedCount).toBe(0);

    const content = await readFile(result.writtenPaths[0], 'utf-8');
    expect(content).toBe('export const form = {};');
  });

  it('should create subdirectories', async () => {
    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'content', subdirectory: 'forms/pets' }];

    const result = await writeGeneratedFiles(tempDir, files);

    expect(result.writtenPaths[0]).toBe(join(tempDir, 'forms/pets', 'form.ts'));
    const content = await readFile(result.writtenPaths[0], 'utf-8');
    expect(content).toBe('content');
  });

  it('should skip writing unchanged files and track them', async () => {
    const existingContent = 'export const form = {};';
    await mkdir(tempDir, { recursive: true });
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, existingContent, 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: existingContent }];

    const result = await writeGeneratedFiles(tempDir, files);
    expect(result.writtenPaths).toHaveLength(0);
    expect(result.unchangedCount).toBe(1);

    // Content should remain the same
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe(existingContent);
  });

  it('should overwrite changed files', async () => {
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, 'old content', 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'new content' }];

    const result = await writeGeneratedFiles(tempDir, files);

    expect(result.writtenPaths).toHaveLength(1);
    expect(result.unchangedCount).toBe(0);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('new content');
  });

  it('should write multiple files', async () => {
    const files: GeneratedFile[] = [
      { fileName: 'a.ts', content: 'a' },
      { fileName: 'b.ts', content: 'b' },
      { fileName: 'c.ts', content: 'c' },
    ];

    const result = await writeGeneratedFiles(tempDir, files);

    expect(result.writtenPaths).toHaveLength(3);
    expect(result.unchangedCount).toBe(0);
    for (let i = 0; i < files.length; i++) {
      const content = await readFile(result.writtenPaths[i], 'utf-8');
      expect(content).toBe(files[i].content);
    }
  });

  it('should skip existing files when skipExisting is true', async () => {
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, 'original content', 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'new content' }];

    const result = await writeGeneratedFiles(tempDir, files, { skipExisting: true });

    expect(result.writtenPaths).toHaveLength(0);
    expect(result.unchangedCount).toBe(0);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('original content');
  });

  it('should write new files even when skipExisting is true', async () => {
    const files: GeneratedFile[] = [{ fileName: 'new-form.ts', content: 'new content' }];

    const result = await writeGeneratedFiles(tempDir, files, { skipExisting: true });

    expect(result.writtenPaths).toHaveLength(1);
    const content = await readFile(result.writtenPaths[0], 'utf-8');
    expect(content).toBe('new content');
  });
});

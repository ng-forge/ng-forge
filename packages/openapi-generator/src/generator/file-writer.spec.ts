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

    const paths = await writeGeneratedFiles(tempDir, files);

    expect(paths).toHaveLength(1);
    expect(paths[0]).toBe(join(tempDir, 'form.ts'));

    const content = await readFile(paths[0], 'utf-8');
    expect(content).toBe('export const form = {};');
  });

  it('should create subdirectories', async () => {
    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'content', subdirectory: 'forms/pets' }];

    const paths = await writeGeneratedFiles(tempDir, files);

    expect(paths[0]).toBe(join(tempDir, 'forms/pets', 'form.ts'));
    const content = await readFile(paths[0], 'utf-8');
    expect(content).toBe('content');
  });

  it('should skip writing unchanged files', async () => {
    const existingContent = 'export const form = {};';
    await mkdir(tempDir, { recursive: true });
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, existingContent, 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: existingContent }];

    // Should not throw and should return the path
    const paths = await writeGeneratedFiles(tempDir, files);
    expect(paths).toHaveLength(1);

    // Content should remain the same
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe(existingContent);
  });

  it('should overwrite changed files', async () => {
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, 'old content', 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'new content' }];

    await writeGeneratedFiles(tempDir, files);

    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('new content');
  });

  it('should write multiple files', async () => {
    const files: GeneratedFile[] = [
      { fileName: 'a.ts', content: 'a' },
      { fileName: 'b.ts', content: 'b' },
      { fileName: 'c.ts', content: 'c' },
    ];

    const paths = await writeGeneratedFiles(tempDir, files);

    expect(paths).toHaveLength(3);
    for (let i = 0; i < files.length; i++) {
      const content = await readFile(paths[i], 'utf-8');
      expect(content).toBe(files[i].content);
    }
  });

  it('should skip existing files when skipExisting is true', async () => {
    const filePath = join(tempDir, 'form.ts');
    await writeFile(filePath, 'original content', 'utf-8');

    const files: GeneratedFile[] = [{ fileName: 'form.ts', content: 'new content' }];

    const paths = await writeGeneratedFiles(tempDir, files, { skipExisting: true });

    expect(paths).toHaveLength(0);
    const content = await readFile(filePath, 'utf-8');
    expect(content).toBe('original content');
  });

  it('should write new files even when skipExisting is true', async () => {
    const files: GeneratedFile[] = [{ fileName: 'new-form.ts', content: 'new content' }];

    const paths = await writeGeneratedFiles(tempDir, files, { skipExisting: true });

    expect(paths).toHaveLength(1);
    const content = await readFile(paths[0], 'utf-8');
    expect(content).toBe('new content');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadConfig, saveConfig } from './generator-config.js';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('loadConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return parsed config when file exists', async () => {
    const config = {
      spec: './api.yaml',
      output: './generated',
      endpoints: ['POST:/pets'],
      decisions: { name: 'input' },
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(config));

    const result = await loadConfig('/some/dir');
    expect(result).toEqual(config);
    expect(readFile).toHaveBeenCalledWith(join('/some/dir', '.ng-forge-generator.json'), 'utf-8');
  });

  it('should return null when file does not exist', async () => {
    const enoentError = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
    enoentError.code = 'ENOENT';
    vi.mocked(readFile).mockRejectedValue(enoentError);

    const result = await loadConfig('/missing/dir');
    expect(result).toBeNull();
  });

  it('should return null and warn when config file contains invalid JSON', async () => {
    vi.mocked(readFile).mockResolvedValue('{ invalid json }');

    const result = await loadConfig('/some/dir');
    expect(result).toBeNull();
  });

  it('should throw on non-ENOENT errors (e.g. permission denied)', async () => {
    const permError = new Error('EACCES: permission denied') as NodeJS.ErrnoException;
    permError.code = 'EACCES';
    vi.mocked(readFile).mockRejectedValue(permError);

    await expect(loadConfig('/some/dir')).rejects.toThrow('EACCES');
  });
});

describe('saveConfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should write valid JSON to the config file', async () => {
    vi.mocked(writeFile).mockResolvedValue();

    const config = {
      spec: './api.yaml',
      output: './generated',
      endpoints: ['POST:/pets'],
      decisions: {},
    };

    await saveConfig('/some/dir', config);

    expect(writeFile).toHaveBeenCalledWith(join('/some/dir', '.ng-forge-generator.json'), JSON.stringify(config, null, 2) + '\n', 'utf-8');
  });
});

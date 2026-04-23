import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { registerGenerateOptions, filterEndpoints } from './generate.command.js';
import type { EndpointInfo } from '../../parser/endpoint-extractor.js';

describe('registerGenerateOptions', () => {
  it('should register options directly on the command', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const helpText = program.helpInformation();
    expect(helpText).toContain('--spec');
    expect(helpText).toContain('--output');
    expect(helpText).toContain('--interactive');
  });

  it('should register --dry-run option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const dryRunOption = program.options.find((opt) => opt.long === '--dry-run');
    expect(dryRunOption).toBeDefined();
  });

  it('should register --skip-existing option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const skipExistingOption = program.options.find((opt) => opt.long === '--skip-existing');
    expect(skipExistingOption).toBeDefined();
  });

  it('should register --interactive option with validation', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const interactiveOption = program.options.find((opt) => opt.long === '--interactive');
    expect(interactiveOption).toBeDefined();
  });

  it('should reject invalid --interactive values', () => {
    const program = new Command();
    program.exitOverride();
    registerGenerateOptions(program);
    program.action(() => {
      /* noop */
    });

    expect(() => {
      program.parse(['node', 'test', '--spec', 'a.yaml', '--output', './out', '--interactive', 'banana'], { from: 'user' });
    }).toThrow();
  });

  it('should include help text about formatting', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const helpText = program.helpInformation();
    expect(helpText).toContain('--interactive');
  });

  it('should register --verbose option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const verboseOption = program.options.find((opt) => opt.long === '--verbose');
    expect(verboseOption).toBeDefined();
  });

  it('should register --quiet option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const quietOption = program.options.find((opt) => opt.long === '--quiet');
    expect(quietOption).toBeDefined();
  });

  it('should register --read-only option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const readOnlyOption = program.options.find((opt) => opt.long === '--read-only');
    expect(readOnlyOption).toBeDefined();
  });

  it('should register --barrel-extension option', () => {
    const program = new Command();
    registerGenerateOptions(program);

    const barrelExtOption = program.options.find((opt) => opt.long === '--barrel-extension');
    expect(barrelExtOption).toBeDefined();
  });

  it('should accept empty string and dot-prefixed values for --barrel-extension', () => {
    for (const value of ['', '.js', '.mjs', '.cjs']) {
      const program = new Command();
      program.exitOverride();
      registerGenerateOptions(program);
      program.action(() => {
        /* noop */
      });

      expect(() => {
        program.parse(['--spec', 'a.yaml', '--output', './out', '--interactive', 'none', '--barrel-extension', value], { from: 'user' });
      }).not.toThrow();
    }
  });

  it('should reject non-dot-prefixed --barrel-extension values', () => {
    const program = new Command();
    program.exitOverride();
    registerGenerateOptions(program);
    program.action(() => {
      /* noop */
    });

    expect(() => {
      program.parse(['--spec', 'a.yaml', '--output', './out', '--interactive', 'none', '--barrel-extension', 'banana'], { from: 'user' });
    }).toThrow(/Invalid --barrel-extension/);
  });
});

describe('filterEndpoints', () => {
  const endpoints: EndpointInfo[] = [
    { method: 'GET', path: '/pets', requiredFields: [] },
    { method: 'POST', path: '/pets', requiredFields: ['name'] },
    { method: 'PUT', path: '/pets/{id}', requiredFields: ['name'] },
  ];

  it('should return all endpoints when no filter is provided', () => {
    const result = filterEndpoints(endpoints);
    expect(result).toEqual(endpoints);
  });

  it('should filter endpoints by METHOD:path', () => {
    const result = filterEndpoints(endpoints, 'POST:/pets');
    expect(result).toHaveLength(1);
    expect(result[0].method).toBe('POST');
  });

  it('should handle comma-separated filters', () => {
    const result = filterEndpoints(endpoints, 'GET:/pets, POST:/pets');
    expect(result).toHaveLength(2);
  });

  it('should return empty array when no endpoints match filter', () => {
    const result = filterEndpoints(endpoints, 'DELETE:/pets');
    expect(result).toHaveLength(0);
  });
});

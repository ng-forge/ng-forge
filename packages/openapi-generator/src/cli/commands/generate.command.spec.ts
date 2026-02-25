import { describe, it, expect } from 'vitest';
import { Command } from 'commander';
import { registerGenerateCommand, filterEndpoints } from './generate.command.js';
import type { EndpointInfo } from '../../parser/endpoint-extractor.js';

describe('registerGenerateCommand', () => {
  it('should add the generate command to the program', () => {
    const program = new Command();
    registerGenerateCommand(program);

    const generateCmd = program.commands.find((cmd) => cmd.name() === 'generate');
    expect(generateCmd).toBeDefined();
    expect(generateCmd!.description()).toBe('Generate dynamic form configurations from an OpenAPI spec');
  });

  it('should register --dry-run option', () => {
    const program = new Command();
    registerGenerateCommand(program);

    const generateCmd = program.commands.find((cmd) => cmd.name() === 'generate');
    const dryRunOption = generateCmd!.options.find((opt) => opt.long === '--dry-run');
    expect(dryRunOption).toBeDefined();
  });

  it('should register --skip-existing option', () => {
    const program = new Command();
    registerGenerateCommand(program);

    const generateCmd = program.commands.find((cmd) => cmd.name() === 'generate');
    const skipExistingOption = generateCmd!.options.find((opt) => opt.long === '--skip-existing');
    expect(skipExistingOption).toBeDefined();
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

import { describe, expect, it } from 'vitest';
import { BaseFieldDefSchema } from '../field/field-def.schema';
import { FieldWebMcpConfigSchema } from '../field/field-web-mcp.schema';

/**
 * The per-field policy decides what an agent may read and write. A schema that
 * drops the key parses a locked-down field into an unrestricted one, so a config
 * that round-trips through validation — anything the MCP server or the CLI
 * generates — would silently widen what agents can reach.
 */
describe('field-level webMcp', () => {
  it('keeps a readable/writable override on a parsed field', () => {
    const result = BaseFieldDefSchema.safeParse({ key: 'ssn', type: 'input', webMcp: { readable: false } });

    expect(result.success).toBe(true);
    expect(result.success && result.data.webMcp).toEqual({ readable: false });
  });

  it('keeps `false`, which hides the field from agents entirely', () => {
    const result = BaseFieldDefSchema.safeParse({ key: 'token', type: 'hidden', webMcp: false });

    expect(result.success && result.data.webMcp).toBe(false);
  });

  it('keeps both axes together', () => {
    const result = BaseFieldDefSchema.safeParse({ key: 'total', type: 'input', webMcp: { readable: true, writable: false } });

    expect(result.success && result.data.webMcp).toEqual({ readable: true, writable: false });
  });

  it('leaves the key absent when the field says nothing', () => {
    const result = BaseFieldDefSchema.safeParse({ key: 'name', type: 'input' });

    expect(result.success).toBe(true);
    expect(result.success && 'webMcp' in result.data).toBe(false);
  });

  it('rejects a non-boolean axis', () => {
    expect(FieldWebMcpConfigSchema.safeParse({ readable: 'no' }).success).toBe(false);
  });

  it('rejects `true`, which would read as an empty override rather than an opt-in', () => {
    expect(FieldWebMcpConfigSchema.safeParse(true).success).toBe(false);
  });
});

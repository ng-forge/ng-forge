import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { withWebMcp } from './with-web-mcp';
import { WEB_MCP_ENABLED } from './web-mcp.token';

describe('withWebMcp', () => {
  it('creates a web-mcp feature', () => {
    const feature = withWebMcp();

    expect(feature.ɵkind).toBe('web-mcp');
    expect(feature.ɵproviders.length).toBe(1);
  });

  it('enables registration', () => {
    TestBed.configureTestingModule({ providers: [...withWebMcp().ɵproviders] });

    expect(TestBed.inject(WEB_MCP_ENABLED)).toBe(true);
  });

  it('is disabled when the feature is not provided', () => {
    expect(TestBed.inject(WEB_MCP_ENABLED)).toBe(false);
  });
});

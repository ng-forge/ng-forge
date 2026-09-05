import { describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { withExperimentalWebMcp } from './with-web-mcp';
import { WEB_MCP_ENABLED } from './web-mcp.token';

describe('withExperimentalWebMcp', () => {
  it('creates a web-mcp feature', () => {
    const feature = withExperimentalWebMcp();

    expect(feature.ɵkind).toBe('web-mcp');
  });

  it('turns the enabled token on', () => {
    TestBed.configureTestingModule({ providers: [...withExperimentalWebMcp().ɵproviders] });

    expect(TestBed.inject(WEB_MCP_ENABLED)).toBe(true);
  });

  it('leaves the token off when the feature is not provided', () => {
    TestBed.configureTestingModule({ providers: [] });

    expect(TestBed.inject(WEB_MCP_ENABLED)).toBe(false);
  });
});

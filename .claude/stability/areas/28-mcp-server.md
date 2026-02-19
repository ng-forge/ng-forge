# Area 28 — MCP Server

## Key Files

- `packages/dynamic-form-mcp/src/server.ts`
- `packages/dynamic-form-mcp/src/registry/index.ts`
- `packages/dynamic-form-mcp/src/registry/instructions.ts`
- `packages/dynamic-form-mcp/src/resources/` (7 resource files)
- `packages/dynamic-form-mcp/src/tools/` (4 tools + data)
- `packages/dynamic-form-mcp/src/tools/data/lookup-topics.ts`
- `packages/dynamic-form-mcp/src/utils/ast-extractor.ts`
- `packages/dynamic-form-mcp/scripts/`

## Scenarios to Check

### Registry Sync

- [ ] Field types in MCP match actual library field types — spot-check all types
- [ ] Validators in MCP match actual library validators — all built-in validators present?
- [ ] Configuration options in MCP match current API — no stale/removed options?
- [ ] New features (HTTP derivations, HTTP conditions, async validators) — reflected in MCP?

### Tools

- [ ] `validate` tool — does it catch all known config errors? Test with edge cases
- [ ] `scaffold` tool — generates valid, compilable FormConfig?
- [ ] `lookup` tool — topics up to date? No stale documentation?
- [ ] `examples` tool — examples actually work with current library version?

### Resources

- [ ] Documentation resource — accurate, up to date
- [ ] Field types resource — complete list with correct props
- [ ] Schemas resource — FormConfig JSON schema matches actual TypeScript types
- [ ] UI adapters resource — all 4 adapters documented
- [ ] Validators resource — all validators listed with correct parameters

### AST Extractor

- [ ] `ast-extractor.ts` — correctly extracts code patterns from source
- [ ] Edge cases — malformed source, empty files, complex generics

## Known Findings

- None specific to MCP server yet. General risk: MCP server may be out of sync with recent library changes.

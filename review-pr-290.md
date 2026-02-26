# Review: PR #290 — `refactor(mcp): remove offline docs generation and CI registry checks`

**Branch:** `refactor/remove-mcp-offline-docs` → `main`
**Head SHA:** `15394fb`
**Verdict:** ✅ Approved

---

## Summary

Solid refactor. The move from a 1,461-line codegen script + JSON files to hand-maintained TypeScript registry is a clear DX win — compile-time type safety, no build step required, direct editability. The live doc-fetch architecture is well-designed: `llms-full.txt` committed as a static artifact, served from ng-forge.com, fetched by the MCP with TTL cache and graceful fallback. All new code is covered by tests.

---

## Issues Found

All three issues below were identified during review and **fixed by the author in the final commit** (`15394fb: fix(mcp): add simplified-array mapping, remove false-positive partial match, reduce fetch timeout`).

### 1. `simplified-array` missing from `TOPIC_SECTION_MAP` — Fixed

`getTopicSections('simplified-array')` was returning `undefined` (unknown topic), meaning `ngforge_lookup topic="simplified-array" depth="full"` always fell back to hardcoded content instead of fetching the live doc section at `prebuilt/form-arrays/simplified`.

Fixed by adding:

```typescript
'simplified-array': ['prebuilt/form-arrays/simplified'],
```

### 2. `findSectionByPartialMatch` false-positive condition — Fixed

In `documentation.resource.ts`, the original condition:

```typescript
if (path.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(path.toLowerCase()))
```

The second branch checked if the section _path_ was a substring of the _query_ — meaning a path of `"a"` would match any query containing the letter "a". For a query like `"validation"`, almost every short section path would produce a false-positive match. The false-positive branch was removed; only the correct direction (`path.includes(query)`) remains.

### 3. 10s fetch timeout too long for MCP context — Fixed

`FETCH_TIMEOUT_MS` reduced from `10_000` to `5_000`. More appropriate for an MCP tool where hanging for 10 seconds before graceful fallback degrades the AI assistant experience.

---

## One Remaining Observation

**`llms-full.txt` (16,910 lines) has no CI freshness check.**

The committed file is the artifact served from ng-forge.com that powers `doc-fetcher.ts`. The workflow is: update docs → run `generate-llms-full` → commit → deploy → MCP fetches live content. This is the right architecture.

However, unlike the removed `mcp-registry` CI job, there is no equivalent check that `llms-full.txt` is regenerated when doc markdown files change. If docs are updated without regenerating the file, the MCP will serve stale content.

A CI step modeled on the removed check would close this gap:

```yaml
- name: Check llms-full.txt is up to date
  run: |
    nx run docs:generate-llms-full
    if git diff --quiet apps/docs/public/llms-full.txt; then
      echo "✅ llms-full.txt is up to date"
    else
      echo "❌ llms-full.txt is out of date — run 'nx run docs:generate-llms-full' and commit"
      exit 1
    fi
```

Not a blocker for this PR — worth a follow-up issue.

---

## What Changed

| File                                                                | Status      | Notes                                                                                        |
| ------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`                                          | Modified    | Removes `mcp-registry` job                                                                   |
| `.github/workflows/pr-check.yml`                                    | Modified    | Removes `mcp-registry` job                                                                   |
| `CLAUDE.md`                                                         | Modified    | Removes `generate-registry` from Quick Reference                                             |
| `packages/dynamic-form-mcp/project.json`                            | Modified    | Removes `generate-registry` target, keeps only `examples.json` as asset                      |
| `packages/dynamic-form-mcp/scripts/generate-registry.ts`            | **Deleted** | 1,461 lines removed                                                                          |
| `packages/dynamic-form-mcp/src/registry/*.json`                     | **Deleted** | `api-reference.json`, `docs.json`, `field-types.json`, `ui-adapters.json`, `validators.json` |
| `packages/dynamic-form-mcp/src/registry/*.ts`                       | **Added**   | `documentation.ts`, `field-types.ts`, `validators.ts`, `ui-adapters.ts`                      |
| `packages/dynamic-form-mcp/src/services/doc-fetcher.ts`             | **Added**   | Live fetch with TTL cache, timeout, graceful null-on-failure                                 |
| `packages/dynamic-form-mcp/src/services/topic-mapper.ts`            | **Added**   | Maps MCP topics → `llms-full.txt` section paths                                              |
| `packages/dynamic-form-mcp/src/tools/search.tool.ts`                | **Added**   | `ngforge_search` — keyword discovery across all topics                                       |
| `packages/dynamic-form-mcp/src/tools/index.ts`                      | Modified    | Registers 5 tools (was 4)                                                                    |
| `packages/dynamic-form-mcp/src/resources/documentation.resource.ts` | Modified    | Live-first fetch with static fallback                                                        |
| `apps/docs/scripts/generate-llms-full.ts`                           | **Added**   | Generates `llms-full.txt` from doc markdown                                                  |
| `apps/docs/public/llms-full.txt`                                    | **Added**   | 16,910-line static artifact served from ng-forge.com                                         |
| `packages/dynamic-form-mcp/src/registry/index.spec.ts`              | Modified    | Adds staleness guard tests                                                                   |
| All new services/tools                                              | Tested      | Full coverage in `*.spec.ts` files                                                           |

---

## Positive Aspects

- **1,461-line codegen script deleted** — major DX improvement; no more `nx run dynamic-form-mcp:generate-registry` before commits
- **TypeScript registry** — compile-time type safety for all field/validator/adapter metadata
- **`ngforge_search` tool** — genuine discoverability improvement; scoring logic (ID > alias > description > content) is well thought out
- **`doc-fetcher.ts`** — clean TTL cache with `clearCache`/`setCacheTtl` test hooks; `AbortController` timeout; returns `null` on any failure (no throws)
- **`topic-mapper.ts`** — clean `MCP_ONLY_TOPICS` set correctly separates hardcoded-only topics from live-fetchable ones
- **`documentation.resource.ts`** — live-first with graceful static fallback is exactly the right pattern
- **`llms-full.txt`** — smart architecture that enables live doc access without requiring a backend API
- **Staleness guard in `index.spec.ts`** — tests cross-validate TypeScript registry entries against Zod schema types, catching structural drift at test time
- **Full test coverage** across all new files

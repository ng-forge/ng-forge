# CI Pipeline Optimization Plan

Apply the same structural optimizations to **both** `pr-check.yml` and `ci.yml`.

## Current Pipeline Shape (both workflows)

```
setup ──┬── checks        (formatting, dep graph)
        ├── build ──┬── quality   (lint)
        │           ├── test      (unit tests)
        │           ├── build-apps
        │           └── mcp-registry
        └───────────────── e2e (depends on quality + test + build-apps)
```

**Problem:** 8-9 separate jobs = 8-9x runner spin-up + checkout + cache restore overhead (~1-2 min each). Several jobs can be merged without losing parallelism.

## Optimizations

### 1. Merge `checks` into `setup`

The `checks` job only needs `node_modules` — no build artifacts. It duplicates checkout + cache restore for no benefit.

**Change:** Run formatting check and dependency graph validation as steps inside the `setup` job, right after `pnpm install` and before the cache/save steps.

- **pr-check:** Move PR title validation, affected-file formatting check, and dep graph validation into `setup`
- **ci:** Move prettier `--check` and dep graph validation into `setup`
- Delete the standalone `checks` job
- Update `ci-success` needs list to remove `checks`

### 2. Merge `quality` (lint) + `test` (unit tests) into one job

Both depend on `[setup, build]`, both restore the same caches (`node_modules` + build artifacts + playwright browsers for test). Combining saves one full job overhead.

**Change:** Create a single `lint-and-test` job (name: "Lint & Test") that:

1. Restores all caches (node_modules, build artifacts, playwright browsers)
2. Runs lint
3. Runs unit tests with coverage
4. Runs type tests
5. Uploads coverage (ci.yml only)

- Delete standalone `quality` and `test` jobs
- Update `e2e` depends to reference `lint-and-test` instead of `quality` + `test`
- Update `ci-success` needs list

### 3. Remove `build` dependency from `mcp-registry`

The `mcp-registry` job does **not** restore build artifacts — it only needs `node_modules` to run `generate-registry` against source files.

**Change:** Make `mcp-registry` depend only on `setup` (not `[setup, build]`). This allows it to run in parallel with `build`, shortening the critical path.

## Optimized Pipeline Shape

```
setup (+ checks) ──┬── build ──┬── lint-and-test
                   │           └── build-apps
                   └── mcp-registry
                                    └── e2e (depends on lint-and-test + build-apps)
```

**Jobs reduced:** 8 → 5 (pr-check) / 7 → 5 (ci), saving ~3-6 min of cumulative runner overhead.

**Critical path shortened:** `mcp-registry` no longer waits for `build`.

## Files Changed

1. `.github/workflows/pr-check.yml`
2. `.github/workflows/ci.yml`

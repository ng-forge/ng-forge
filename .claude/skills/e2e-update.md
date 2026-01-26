---
name: e2e-update
description: Update E2E screenshots using Docker for cross-platform consistency
disable-model-invocation: true
---

# E2E Screenshot Update Skill

Updates Playwright E2E screenshots using Docker to ensure cross-platform consistency.

## Why Docker?

Font rendering differs between macOS, Linux, and CI environments. Running screenshot updates in Docker ensures the screenshots match what CI expects.

## Required User Input

The user **must** specify which example app(s) to update:

- `material` - Material Design examples
- `bootstrap` - Bootstrap examples
- `primeng` - PrimeNG examples
- `ionic` - Ionic examples
- `all` - All example apps

## Commands

### Update single library screenshots

```bash
# Material
pnpm e2e:material:update

# Bootstrap
pnpm e2e:bootstrap:update

# PrimeNG
pnpm e2e:primeng:update

# Ionic
pnpm e2e:ionic:update
```

### Update all screenshots

```bash
pnpm e2e:all:update
```

### Run E2E tests without updating (validation)

```bash
# Single library
pnpm e2e:material
pnpm e2e:bootstrap
pnpm e2e:primeng
pnpm e2e:ionic

# All
pnpm e2e:all
```

## Workflow

### 1. Make visual changes to components

Edit the component templates, styles, or behavior that affects rendering.

### 2. Run E2E tests to see failures

```bash
pnpm e2e:{library}
```

This shows which screenshots differ from the baseline.

### 3. Review the changes are intentional

Ensure the visual changes are expected before updating baselines.

### 4. Update screenshots in Docker

```bash
pnpm e2e:{library}:update
```

### 5. Verify the updates

```bash
pnpm e2e:{library}
```

All tests should now pass.

### 6. Commit the updated screenshots

```bash
git add apps/examples/*/src/app/testing/__snapshots__/
git commit -m "test({library}): update snapshots for {change description}"
```

## Troubleshooting

### Docker not running

```
Error: Cannot connect to Docker daemon
```

Start Docker Desktop or the Docker service.

### Cache issues

If tests behave unexpectedly or you see "Unrecognized Cache Artifacts":

```bash
pnpm e2e:clean
```

Then re-run the update command.

### Running with fresh cache

```bash
./scripts/playwright-docker.sh {library}-examples --clean --update-snapshots
```

## Screenshot Locations

Screenshots are stored in:

```
apps/examples/{library}-examples/src/app/testing/__snapshots__/
```

## Important Notes

- **Never run `--update-snapshots` locally** outside Docker
- Screenshots updated locally will fail in CI due to font rendering differences
- Always use the `pnpm e2e:*:update` commands which run in Docker

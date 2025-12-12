---
name: release
description: Prepare and publish releases for ng-forge dynamic forms libraries. Use when doing a release, preparing a patch, minor, or major version, bumping versions, or creating release pull requests.
---

# Release Skill

This skill guides the preparation of a new release for the ng-forge dynamic forms libraries.

## Quick Reference

**TL;DR - Release in 3 steps:**

1. **Create branch**: `git checkout -b release-{VERSION}` from main
2. **Update versions**: Edit all `packages/*/package.json` to set new version (including inter-package dependencies), commit, push
3. **Trigger workflow**: Actions → Release → Run workflow on the release branch

## Packages

The following packages are released together (fixed versioning):

- `@ng-forge/dynamic-forms` - Core library
- `@ng-forge/dynamic-forms-material` - Material Design integration
- `@ng-forge/dynamic-forms-bootstrap` - Bootstrap integration
- `@ng-forge/dynamic-forms-primeng` - PrimeNG integration
- `@ng-forge/dynamic-forms-ionic` - Ionic integration

## Release Process

### Step 1: Create Release Branch

```bash
git checkout main
git pull origin main
git checkout -b release-{VERSION}
```

Example: `git checkout -b release-0.2.0`

### Step 2: Update Package Versions

⚠️ **IMPORTANT: Update ALL version references!**

Update the version in all 5 package.json files. Each UI integration package depends on the core package, so you must update both the package version AND the peer dependency:

| Package                                         | Update `version` | Update `peerDependencies.@ng-forge/dynamic-forms` |
| ----------------------------------------------- | ---------------- | ------------------------------------------------- |
| `packages/dynamic-forms/package.json`           | ✅               | N/A                                               |
| `packages/dynamic-forms-bootstrap/package.json` | ✅               | ✅                                                |
| `packages/dynamic-forms-material/package.json`  | ✅               | ✅                                                |
| `packages/dynamic-forms-primeng/package.json`   | ✅               | ✅                                                |
| `packages/dynamic-forms-ionic/package.json`     | ✅               | ✅                                                |

Example for `packages/dynamic-forms-material/package.json`:

```json
{
  "name": "@ng-forge/dynamic-forms-material",
  "version": "0.2.0",  // ← Update this
  "peerDependencies": {
    "@ng-forge/dynamic-forms": "0.2.0",  // ← AND this
    ...
  }
}
```

### Step 3: Commit and Push

```bash
git add packages/*/package.json
git commit -m "chore(release): bump version to {VERSION}"
git push -u origin release-{VERSION}
```

### Step 4: Create PR (Optional but Recommended)

Create a PR from `release-{VERSION}` to `main`. The Release workflow will appear in the PR checks as **"Awaiting manual trigger"** - this is just a placeholder to show the workflow is ready.

### Step 5: Trigger Release Workflow

1. Go to **Actions** → **Release** → **Run workflow**
2. Select the release branch (e.g., `release-0.2.0`)
3. Choose mode:
   - `dry-run` (default) - Test without publishing
   - `publish` - Publish to npm for real

The workflow reads the version directly from `packages/dynamic-forms/package.json` on the selected branch.

### Step 6: Post-Release Verification

```bash
# Check GitHub Release
gh release view v{VERSION}

# Check npm
npm view @ng-forge/dynamic-forms version

# Test installation
npm install @ng-forge/dynamic-forms@{VERSION}
```

## Release Workflow Behavior

- **On push to `release-*` branch**: The Release workflow runs but immediately completes with "Awaiting manual trigger". This makes the workflow visible in PR checks.
- **On manual trigger**: The actual release process runs - builds, verifies CI passed, creates tag, publishes to npm.

## Failure Recovery

### Delete local and remote branch:

```bash
git checkout main
git branch -D release-{VERSION}
git push origin --delete release-{VERSION}
```

### Delete tag and GitHub release:

```bash
git tag -d v{VERSION}
git push origin --delete v{VERSION}
gh release delete v{VERSION} --yes
```

### Unpublish from npm (within 72 hours):

```bash
npm unpublish @ng-forge/dynamic-forms@{VERSION}
npm unpublish @ng-forge/dynamic-forms-bootstrap@{VERSION}
npm unpublish @ng-forge/dynamic-forms-material@{VERSION}
npm unpublish @ng-forge/dynamic-forms-primeng@{VERSION}
npm unpublish @ng-forge/dynamic-forms-ionic@{VERSION}
```

## Important Notes

- Branch **must** be named `release-{VERSION}` (e.g., `release-0.2.0`) for the workflow to appear in PR checks
- The release branch is completely independent - main branch state doesn't matter
- Version is read from `packages/dynamic-forms/package.json` on the selected branch
- **Always update inter-package peer dependencies** when bumping versions
- Always do a dry run before actual publish
- NPM_TOKEN secret must be configured in GitHub repository settings

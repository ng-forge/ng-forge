---
name: release
description: Prepare and publish releases for ng-forge dynamic forms libraries. Use when doing a release, preparing a patch, minor, or major version, bumping versions, or creating release pull requests.
---

# Release Skill

This skill guides the preparation of a new release for the ng-forge dynamic forms libraries.

## Quick Reference

**TL;DR - Release in 3 steps:**

1. **Create branch**: `git checkout -b release-{VERSION}` from main
2. **Update versions**: Edit all `packages/*/package.json` to set new version, commit, push
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

Update the version in all 5 package.json files:

1. `packages/dynamic-forms/package.json` - Update `version`
2. `packages/dynamic-forms-bootstrap/package.json` - Update `version` AND `peerDependencies.@ng-forge/dynamic-forms`
3. `packages/dynamic-forms-material/package.json` - Update `version` AND `peerDependencies.@ng-forge/dynamic-forms`
4. `packages/dynamic-forms-primeng/package.json` - Update `version` AND `peerDependencies.@ng-forge/dynamic-forms`
5. `packages/dynamic-forms-ionic/package.json` - Update `version` AND `peerDependencies.@ng-forge/dynamic-forms`

### Step 3: Commit and Push

```bash
git add packages/*/package.json
git commit -m "chore(release): bump version to {VERSION}"
git push -u origin release-{VERSION}
```

### Step 4: Trigger Release Workflow

1. Go to **Actions** → **Release** → **Run workflow**
2. Select the release branch (e.g., `release-0.2.0`)
3. Options:
   - `dry_run: true` (default) - Test without publishing
   - `publish: true`, `dry_run: false` - Publish to npm

The workflow reads the version directly from `packages/dynamic-forms/package.json` on the selected branch. No need to enter a version manually.

### Step 5: Post-Release Verification

```bash
# Check GitHub Release
gh release view v{VERSION}

# Check npm
npm view @ng-forge/dynamic-forms version

# Test installation
npm install @ng-forge/dynamic-forms@{VERSION}
```

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

- The release branch is completely independent - main branch state doesn't matter
- Version is read from `packages/dynamic-forms/package.json` on the selected branch
- Always do a dry run before actual publish
- NPM_TOKEN secret must be configured in GitHub repository settings

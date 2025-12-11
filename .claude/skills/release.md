---
name: release
description: Prepare and publish releases for ng-forge dynamic forms libraries. Use when doing a release, preparing a patch, minor, or major version, bumping versions, or creating release pull requests.
---

# Release Skill

This skill guides the preparation of a new release for the ng-forge dynamic forms libraries.

## Quick Reference

**TL;DR - Release in 4 steps:**

1. **Create branch**: `git checkout -b release-{VERSION}` from main
2. **Update versions**: Edit all `packages/*/package.json` to set new version
3. **Push & PR**: Push branch, create PR for review
4. **Trigger workflow**: Go to Actions → Release → Run workflow on release branch

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

Example: `git checkout -b release-0.1.0`

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

### Step 4: Create Pull Request

```bash
gh pr create --title "chore(release): v{VERSION}" --body "$(cat <<'EOF'
## Summary
Release v{VERSION} of @ng-forge packages to npm.

## Packages
- `@ng-forge/dynamic-forms` v{VERSION}
- `@ng-forge/dynamic-forms-bootstrap` v{VERSION}
- `@ng-forge/dynamic-forms-material` v{VERSION}
- `@ng-forge/dynamic-forms-primeng` v{VERSION}
- `@ng-forge/dynamic-forms-ionic` v{VERSION}

## Release Instructions
1. Go to Actions → Release → Run workflow
2. Select branch: `release-{VERSION}`
3. Enter version: `{VERSION}`
4. First run with `dry_run: true` to test
5. Then run with `publish: true`, `dry_run: false` to publish
EOF
)" --base main
```

### Step 5: Trigger Release Workflow

1. Go to **Actions** → **Release** → **Run workflow**
2. Select branch: `release-{VERSION}`
3. Enter version: `{VERSION}` (must match package.json)
4. Options:
   - `dry_run: true` (default) - Test without publishing
   - `publish: true`, `dry_run: false` - Publish to npm

### Step 6: Post-Release Verification

After the release workflow completes:

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

### Deprecate old version (if unpublish window passed):

```bash
npm deprecate @ng-forge/dynamic-forms@{VERSION} "Please upgrade to {NEW_VERSION}"
```

## Important Notes

- Branch name must be `release-{VERSION}` (with hyphen, not slash)
- Version in workflow input must match package.json versions exactly
- Always do a dry run before actual publish
- NPM_TOKEN secret must be configured in GitHub repository settings
- The workflow runs on the selected branch, not main

# Release Process Guide

This guide explains how to release new versions of the ng-forge libraries.

## Overview

The ng-forge project uses a **release branch strategy** where releases are created from specific commits on the `main` branch. This allows for:

- **Flexibility**: Choose exactly which commit to release
- **Independence**: Continue development on main while preparing a release
- **Safety**: Fix issues in the release branch without affecting main
- **Clarity**: Each release maps to a specific branch and commit

## Release Branch Naming

All release branches follow the pattern: `release-X.Y.Z`

Examples:
- `release-1.0.0` - First stable release
- `release-1.0.1` - Patch release
- `release-1.1.0` - Minor release
- `release-2.0.0` - Major release

## Release Workflow

### 1. Decide What to Release

First, identify the commit on `main` that you want to release:

```bash
# View recent commits
git log --oneline main

# Or use a graphical view
git log --graph --oneline --decorate main
```

Pick a stable commit that's ready for release. This doesn't have to be the latest commit!

### 2. Create Release Branch

Use the helper script to create a release branch:

```bash
# Create a patch release from latest commit
./scripts/create-release-branch.sh patch

# Create a minor release from latest commit
./scripts/create-release-branch.sh minor

# Create a major release from latest commit
./scripts/create-release-branch.sh major

# Create from specific commit
./scripts/create-release-branch.sh patch abc123

# Create with specific version
./scripts/create-release-branch.sh 1.2.3 abc123
```

The script will:
1. ✅ Create a new branch from the specified commit
2. ✅ Bump versions in all package.json files
3. ✅ Commit the version changes
4. ✅ Push the branch to origin

### 3. Review and Fix Issues (Optional)

If you discover any issues in the release branch, you can fix them:

```bash
# Switch to release branch
git checkout release-1.0.0

# Make fixes
# ... edit files ...

# Commit fixes
git add .
git commit -m "fix: resolve issue before release"
git push

# IMPORTANT: Also apply the same fix to main!
git checkout main
# ... apply the same fix ...
git add .
git commit -m "fix: resolve issue"
git push
```

**Remember**: Fixes in release branches should also be applied to `main` to keep both in sync!

### 4. Trigger the Release

The release can be triggered in two ways:

#### Option A: Automatic (Push to Branch)

Simply pushing to a `release-*` branch triggers the release workflow automatically:

```bash
git push origin release-1.0.0
```

This will:
1. ✅ Build all libraries
2. ✅ Run all tests
3. ✅ Create a git tag (e.g., `v1.0.0`)
4. ✅ Create a GitHub Release with changelog
5. ✅ Publish to npm

#### Option B: Manual (GitHub Actions)

Go to GitHub Actions and manually trigger the workflow:

1. Navigate to: `Actions` → `Release` workflow
2. Click `Run workflow`
3. Select branch: `release-1.0.0`
4. Choose options:
   - **Publish to npm**: `true` (to publish) or `false` (to skip)
   - **Dry run**: `true` (to test without publishing)
5. Click `Run workflow`

### 5. Verify the Release

After the workflow completes:

1. **Check GitHub Release**: Visit `https://github.com/your-org/ng-forge/releases`
2. **Check npm**: Visit `https://www.npmjs.com/package/@ng-forge/dynamic-form`
3. **Test installation**: `npm install @ng-forge/dynamic-form@1.0.0`

## Release Types

### Patch Release (1.0.0 → 1.0.1)

Use for bug fixes and minor updates:

```bash
./scripts/create-release-branch.sh patch
```

**When to use**:
- Bug fixes
- Documentation updates
- Performance improvements (non-breaking)

### Minor Release (1.0.0 → 1.1.0)

Use for new features that are backward compatible:

```bash
./scripts/create-release-branch.sh minor
```

**When to use**:
- New features
- New components or directives
- Deprecations (with backward compatibility)

### Major Release (1.0.0 → 2.0.0)

Use for breaking changes:

```bash
./scripts/create-release-branch.sh major
```

**When to use**:
- Breaking API changes
- Removed deprecated features
- Major architecture changes
- Minimum version bumps (Angular, TypeScript, etc.)

## Hotfix Workflow

If you need to patch an old release:

1. Create a new release branch from the old tag:
   ```bash
   git checkout -b release-1.0.2 v1.0.1
   ```

2. Apply your fix:
   ```bash
   # Make changes
   git add .
   git commit -m "fix: critical bug"
   ```

3. Bump version manually:
   ```bash
   pnpm nx release version 1.0.2
   git add .
   git commit -m "chore: release v1.0.2"
   git push -u origin release-1.0.2
   ```

4. Apply the same fix to main and newer release branches

## CI/CD Pipeline

The release workflow (`.github/workflows/release.yml`) performs these steps:

1. **Checkout**: Fetches the release branch
2. **Install**: Installs dependencies with `pnpm`
3. **Version Check**: Verifies branch name matches package.json version
4. **Build**: Builds all publishable libraries
5. **Test**: Runs all tests in CI mode
6. **Changelog**: Generates changelog from commits
7. **Tag**: Creates git tag
8. **GitHub Release**: Creates release with changelog
9. **Publish**: Publishes packages to npm
10. **Summary**: Shows release details

## Best Practices

### ✅ Do

- Always create release branches from known-good commits
- Test the release branch before triggering the workflow
- Apply fixes to both release branch and main
- Use semantic versioning correctly
- Document breaking changes in commit messages
- Review the generated changelog before publishing

### ❌ Don't

- Don't release from main directly
- Don't merge release branches back to main (except tags)
- Don't make unrelated changes in release branches
- Don't skip the build or test steps
- Don't publish manually (use the workflow)

## Troubleshooting

### Build Fails on Release Branch

```bash
# Checkout the release branch
git checkout release-1.0.0

# Run build locally
pnpm nx run-many -t build

# Fix any issues
# ... make changes ...

# Commit and push
git add .
git commit -m "fix: build issues"
git push
```

### Version Mismatch Warning

If you see: `⚠️ Warning: Branch name doesn't match package.json version`

This means the branch name (`release-1.0.0`) doesn't match the version in `package.json` (e.g., `1.0.1`). To fix:

```bash
# Option 1: Update package.json to match branch
pnpm nx release version 1.0.0

# Option 2: Rename branch to match version
git branch -m release-1.0.0 release-1.0.1
git push origin :release-1.0.0
git push -u origin release-1.0.1
```

### Need to Unpublish a Release

**Warning**: npm doesn't allow unpublishing packages after 24 hours!

If you published by mistake:

1. Within 24 hours: Contact npm support or use `npm unpublish`
2. After 24 hours: Publish a new patch version with the fix

### Forgot to Fix in Main

If you fixed a bug in the release branch but forgot to apply it to main:

```bash
# Cherry-pick the commit from release branch to main
git checkout main
git cherry-pick <commit-hash-from-release-branch>
git push
```

## GitHub Release Features

The workflow creates rich GitHub Releases with:

- **Version tag**: `v1.0.0`
- **Release title**: `Release v1.0.0`
- **Changelog**: Auto-generated from commits since last release
- **Compare link**: Link to see all changes
- **Assets**: Automatically attached by GitHub

You can edit the release notes after creation to add:
- Migration guides
- Breaking change details
- Special thanks
- Known issues

## Monitoring Releases

### Check Release Status

```bash
# View all tags
git tag -l

# View releases on GitHub
gh release list

# View latest release
gh release view
```

### Check npm Versions

```bash
# View published versions
npm view @ng-forge/dynamic-form versions

# Check latest version
npm view @ng-forge/dynamic-form version
```

## Example: Full Release Process

Here's a complete example of releasing version 1.2.0:

```bash
# 1. Check current state
git checkout main
git pull
git log --oneline -10

# 2. Create release branch from commit abc1234
./scripts/create-release-branch.sh minor abc1234
# This creates release-1.2.0

# 3. Review the changes
git show HEAD

# 4. (Optional) Test locally
pnpm nx run-many -t build
pnpm nx run-many -t test

# 5. Push to trigger release
git push origin release-1.2.0
# CI automatically builds, tests, and publishes

# 6. Verify release
open https://github.com/your-org/ng-forge/releases/latest
npm view @ng-forge/dynamic-form version

# 7. Update main with the tag (if needed)
git checkout main
git fetch --tags
```

## Questions?

If you have questions about the release process:

1. Check this guide first
2. Review the workflow file: `.github/workflows/release.yml`
3. Check the helper script: `scripts/create-release-branch.sh`
4. Open an issue in the repository

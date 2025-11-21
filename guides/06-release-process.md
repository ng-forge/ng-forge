# Release Process Guide

This guide explains how to release new versions of the ng-forge libraries.

## Quick Reference

**TL;DR - Release in 5 steps:**

1. **Create**: `./scripts/create-release-branch.sh patch` (or minor/major)
2. **Review**: Create PR for the release branch, get approval
3. **Dry Run**: Comment `/release dry-run` on the PR (or `/release`)
4. **Release**: Comment `/release publish` on the PR
5. **Verify**: Check npm, GitHub releases, test installation

**Common Commands:**

```bash
# Create patch release from latest commit
./scripts/create-release-branch.sh patch

# Create minor release from specific commit
./scripts/create-release-branch.sh minor abc1234

# Create release with specific version
./scripts/create-release-branch.sh 1.2.3 abc1234

# View release status
gh release list
npm view @ng-forge/dynamic-forms versions
```

---

## Overview

The ng-forge project uses a **release branch strategy** where releases are created from specific commits on the `main` branch. This allows for:

- **Flexibility**: Choose exactly which commit to release
- **Independence**: Continue development on main while preparing a release
- **Safety**: Fix issues in the release branch without affecting main
- **Clarity**: Each release maps to a specific branch and commit

## Release Checklist

Before starting a release, review the [Release Checklist](../.github/RELEASE_CHECKLIST.md) to ensure all prerequisites are met.

The checklist covers:

- Pre-release verification
- Branch creation
- Review process
- Dry-run testing
- Release execution
- Post-release verification

## Release Branch Naming

All release branches follow the pattern: `release-X.Y.Z`

Examples:

- `release-1.0.0` - First stable release
- `release-1.0.1` - Patch release
- `release-1.1.0` - Minor release
- `release-2.0.0` - Major release

## Branch Naming Conventions

The project uses different branch naming conventions for different purposes:

### Development Branches (feat/, fix/, chore/, etc.)

For regular development work, use conventional commit prefixes:

- `feat/user-authentication` - New features
- `fix/validation-bug` - Bug fixes
- `chore/update-deps` - Maintenance tasks
- `docs/api-guide` - Documentation
- `refactor/simplify-parser` - Code refactoring
- `test/add-unit-tests` - Test additions

### Release Branches (release-X.Y.Z)

For releases, always use the semantic version number:

- `release-1.0.0` - Major release
- `release-1.1.0` - Minor release
- `release-1.0.1` - Patch release

**Important**: Release branches must match the version in `package.json` exactly. The CI workflow will fail if they don't match.

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

#### Option A: PR Comment (Recommended)

Comment on the release PR to trigger the workflow:

**Dry Run (Test without publishing):**

```
/release dry-run
```

or simply:

```
/release
```

**Publish to npm:**

```
/release publish
```

The workflow will:

- Automatically detect the version from the branch name
- Post a comment confirming the release has started
- Show you a link to track progress

**Benefits:**

- ✅ Trigger directly from PR - no need to navigate to Actions tab
- ✅ Version automatically extracted from branch name
- ✅ Clear audit trail in PR conversation
- ✅ Easy to use

#### Option B: Manual GitHub Actions Trigger

1. Navigate to: `Actions` → `Release` workflow
2. Click `Run workflow`
3. Select your release branch: `release-1.0.0`
4. Fill in the inputs:
   - **Version**: Enter the version (e.g., `1.0.0`) - must match your branch name
   - **Publish to npm**: `true` to publish, `false` to skip publishing
   - **Dry run**: `false` for actual release, `true` to test without publishing
5. Click `Run workflow`

**Important**: Always do a dry run first to verify everything works before the actual release.

---

The workflow will:

1. ✅ Build all libraries
2. ✅ Run all tests
3. ✅ Verify version matches branch name
4. ✅ Create a git tag (e.g., `v1.0.0`)
5. ✅ Create a GitHub Release with changelog
6. ✅ Publish to npm (if `publish: true` and `dry_run: false`)

### 5. Verify the Release

After the workflow completes:

1. **Check GitHub Release**: Visit `https://github.com/your-org/ng-forge/releases`
2. **Check npm**: Visit `https://www.npmjs.com/package/@ng-forge/dynamic-forms`
3. **Test installation**: `npm install @ng-forge/dynamic-forms@1.0.0`

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

## Rollback Procedure

If a release fails or you need to roll back:

### During the Release (Before Completion)

If the workflow fails midway:

1. Check the GitHub Actions logs to identify what failed
2. Fix the issue in the release branch
3. Push the fix: `git push origin release-1.0.0`
4. Re-run the workflow from GitHub Actions

### After Release (Published to npm/GitHub)

If you discover issues after the release completes:

#### Delete the Git Tag

```bash
# Delete locally
git tag -d v1.0.0

# Delete from remote
git push origin :refs/tags/v1.0.0
```

#### Delete the GitHub Release

```bash
# Using GitHub CLI
gh release delete v1.0.0 --yes

# Or manually via GitHub web interface:
# Navigate to Releases → Click the release → Delete
```

#### Unpublish from npm

**Warning**: npm only allows unpublishing within 24 hours of publication, and only if no other packages depend on it.

```bash
# Within 24 hours (use with caution)
npm unpublish @ng-forge/dynamic-forms@1.0.0

# For all 5 packages
npm unpublish @ng-forge/dynamic-forms@1.0.0
npm unpublish @ng-forge/dynamic-forms-material@1.0.0
npm unpublish @ng-forge/dynamic-forms-primeng@1.0.0
npm unpublish @ng-forge/dynamic-forms-ionic@1.0.0
npm unpublish @ng-forge/dynamic-forms-bootstrap@1.0.0
```

**After 24 hours**: You cannot unpublish. Instead:

1. Publish a new patch version with the fix (e.g., 1.0.1)
2. Mark the problematic version as deprecated:
   ```bash
   npm deprecate @ng-forge/dynamic-forms@1.0.0 "This version has issues, please upgrade to 1.0.1"
   ```

#### Clean Up and Retry

After rollback:

1. Fix the issue in your release branch
2. Update the version to a new patch (e.g., 1.0.0 → 1.0.1)
3. Run the release workflow again

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
npm view @ng-forge/dynamic-forms versions

# Check latest version
npm view @ng-forge/dynamic-forms version
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
npm view @ng-forge/dynamic-forms version

# 7. Update main with the tag (if needed)
git checkout main
git fetch --tags
```

## Future Enhancements

### Using Nx's Built-in Changelog

Currently, the workflow uses custom git log formatting for changelogs. In the future, we could leverage Nx's built-in changelog generation for richer formatting:

```bash
# Instead of custom git log
pnpm nx release changelog
```

This would provide:

- Automatic categorization by commit type (feat, fix, chore, etc.)
- Breaking changes section
- Contributors list
- Better conventional commit parsing

The configuration is already in place in `nx.json`:

```json
"changelog": {
  "workspaceChangelog": {
    "createRelease": "github"
  }
}
```

### Pre-release Support

To support alpha, beta, and RC releases:

1. Update branch naming pattern to support `release-1.0.0-beta.1`
2. Update version validation regex in workflow
3. Add pre-release flag to GitHub Release creation
4. Document pre-release workflow

Example pre-release versions:

- `1.0.0-alpha.1` - Alpha release
- `1.0.0-beta.1` - Beta release
- `1.0.0-rc.1` - Release candidate

## Questions?

If you have questions about the release process:

1. Check this guide first
2. Review the workflow file: `.github/workflows/release.yml`
3. Check the helper script: `scripts/create-release-branch.sh`
4. Open an issue in the repository

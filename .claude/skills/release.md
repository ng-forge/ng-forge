---
name: release
description: Prepare and publish releases for ng-forge dynamic forms libraries. Use when doing a release, preparing a patch, minor, or major version, bumping versions, or creating release pull requests.
---

# Release Skill

This skill guides the preparation of a new release for the ng-forge dynamic forms libraries.

Reference: See `guides/06-release-process.md` for full documentation.

## Quick Reference

**TL;DR - Release in 5 steps:**

1. **Create**: `./scripts/create-release-branch.sh patch` (or minor/major)
2. **Review**: Create PR for the release branch, get approval
3. **Dry Run**: Comment `/release dry-run` on the PR
4. **Release**: Comment `/release publish` on the PR
5. **Verify**: Check npm, GitHub releases, test installation

## Packages

The following packages are released together:

- `@ng-forge/dynamic-forms` - Core library
- `@ng-forge/dynamic-forms-material` - Material Design integration
- `@ng-forge/dynamic-forms-bootstrap` - Bootstrap integration
- `@ng-forge/dynamic-forms-primeng` - PrimeNG integration
- `@ng-forge/dynamic-forms-ionic` - Ionic integration

## Release Process

### Step 1: Validate State

1. Run `git status` to verify the working tree is clean. **STOP immediately** if there are uncommitted changes.
2. Ensure you are on the `main` branch: `git checkout main && git pull`

### Step 2: Determine Version Type

Ask the user which type of release they want:

- **patch** - Bug fixes and minor updates (e.g., 0.0.1 → 0.0.2)
- **minor** - New features, backwards compatible (e.g., 0.1.0 → 0.2.0)
- **major** - Breaking changes (e.g., 1.0.0 → 2.0.0)

Optionally, ask if they want to release from a specific commit (default is HEAD).

### Step 3: Run Release Script

Use the helper script to create the release branch:

```bash
# From latest commit
./scripts/create-release-branch.sh {VERSION_TYPE}

# From specific commit
./scripts/create-release-branch.sh {VERSION_TYPE} {COMMIT_HASH}

# With specific version number
./scripts/create-release-branch.sh 1.2.3 {COMMIT_HASH}
```

The script will:

1. Create branch `release-{NEW_VERSION}` from the specified commit
2. Bump versions in all package.json files using `pnpm nx release version`
3. Commit the version changes
4. Push the branch to origin

**Note**: The script requires user confirmation before proceeding.

### Step 4: Create Pull Request

After the script completes, create a PR for review:

```bash
gh pr create --title "chore: release v{NEW_VERSION}" --body "$(cat <<'EOF'
## Release v{NEW_VERSION}

### Changes
<!-- Summary of changes since last release -->

### Packages
- `@ng-forge/dynamic-forms@{NEW_VERSION}`
- `@ng-forge/dynamic-forms-material@{NEW_VERSION}`
- `@ng-forge/dynamic-forms-bootstrap@{NEW_VERSION}`
- `@ng-forge/dynamic-forms-primeng@{NEW_VERSION}`
- `@ng-forge/dynamic-forms-ionic@{NEW_VERSION}`

### Release Commands

After PR is approved, use these commands in the PR comments:

1. `/release dry-run` - Test the release process without publishing
2. `/release publish` - Publish packages to npm

### Checklist
- [ ] All CI checks pass
- [ ] Version numbers are correct
- [ ] Changelog reviewed
EOF
)" --base main
```

### Step 5: Trigger Release

Comment on the PR to trigger the release workflow:

1. **First, do a dry run**:

   ```
   /release dry-run
   ```

2. **If dry run succeeds, publish**:
   ```
   /release publish
   ```

### Step 6: Post-Release Verification

After the release workflow completes:

1. Check GitHub Release: `gh release view`
2. Check npm: `npm view @ng-forge/dynamic-forms version`
3. Test installation: `npm install @ng-forge/dynamic-forms@{NEW_VERSION}`

## Failure Recovery

### If on release branch with uncommitted changes:

```bash
git checkout main
git branch -D release-{VERSION}
```

### If branch was pushed but needs to be recreated:

```bash
git push origin --delete release-{VERSION}
git checkout main
git branch -D release-{VERSION}
```

### If a tag was created but needs to be removed:

```bash
git tag -d v{VERSION}
git push origin --delete v{VERSION}
```

### If published to npm (within 24 hours):

```bash
npm unpublish @ng-forge/dynamic-forms@{VERSION}
# Repeat for all 5 packages
```

### If published to npm (after 24 hours):

Publish a new patch version with the fix and deprecate the old version:

```bash
npm deprecate @ng-forge/dynamic-forms@{VERSION} "Please upgrade to {NEW_VERSION}"
```

## Commit Standards

- All commits MUST follow conventional commit format
- Do NOT include co-author attribution or Claude metadata in commits
- Example: `chore: release v1.2.3`

## Important Notes

- Never force push to `main` or `release-*` branches
- The release workflow is triggered by `/release` commands in PR comments
- Always do a dry run before actual publish
- NPM_TOKEN secret must be configured in GitHub repository settings
- Fixes in release branches should also be applied to `main`

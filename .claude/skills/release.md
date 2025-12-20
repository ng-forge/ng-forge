---
name: release
description: Prepare a release PR for ng-forge dynamic forms libraries. Use when the user asks to prepare, create, or start a release.
---

# Release Skill

Prepares a release PR for the ng-forge dynamic forms libraries, including version bumps and changelog.

## Required User Input

The user **must** provide the target version number (e.g., `0.1.3`, `0.2.0`, `1.0.0`).

If the user doesn't specify a version, ask them:

> What version should this release be? (current: {current_version})

To find the current version, check `packages/dynamic-forms/package.json`.

## Packages (Fixed Versioning)

All packages are released together with the same version:

- `@ng-forge/dynamic-forms` (core)
- `@ng-forge/dynamic-forms-bootstrap`
- `@ng-forge/dynamic-forms-ionic`
- `@ng-forge/dynamic-forms-material`
- `@ng-forge/dynamic-forms-primeng`

## Commit Message Format

All commits and PR titles **must** follow Angular-style conventional commits as defined in `CLAUDE.md`:

- Version bump: `chore(release): bump version to {VERSION}`
- PR title: `chore(release): bump version to {VERSION}`

## Release Preparation Steps

Execute these steps in order:

### 1. Ensure clean main branch

```bash
git checkout main
git pull origin main
```

### 2. Create release branch

```bash
git checkout -b release-{VERSION}
```

Use the format `release-{VERSION}` (e.g., `release-0.2.0`).

### 3. Bump versions using nx release

```bash
pnpm nx release version {VERSION}
```

This command automatically:

- Updates `version` in all package.json files
- Updates `peerDependencies` referencing `@ng-forge/dynamic-forms`

### 4. Commit version bump

```bash
git add packages/*/package.json
git commit -m "chore(release): bump version to {VERSION}"
```

### 5. Generate changelog

Find the previous version tag first:

```bash
git tag -l "v*" | sort -V | tail -1
```

Then generate the changelog:

```bash
pnpm nx release changelog {VERSION} --from={PREVIOUS_TAG}
```

This command automatically:

- Updates CHANGELOG.md with entries since the previous release
- Commits the changelog
- Creates the git tag `v{VERSION}`
- Pushes the tag to origin
- Creates a GitHub Release

### 6. Push the branch

```bash
git push -u origin release-{VERSION}
```

### 7. Create the PR

```bash
gh pr create --title "chore(release): bump version to {VERSION}" --body "## Summary
- Bump all package versions to {VERSION}
- Update inter-package peerDependencies
- Generate changelog from {PREVIOUS_TAG}

## Packages Updated
- @ng-forge/dynamic-forms: {OLD_VERSION} -> {VERSION}
- @ng-forge/dynamic-forms-bootstrap: {OLD_VERSION} -> {VERSION}
- @ng-forge/dynamic-forms-ionic: {OLD_VERSION} -> {VERSION}
- @ng-forge/dynamic-forms-material: {OLD_VERSION} -> {VERSION}
- @ng-forge/dynamic-forms-primeng: {OLD_VERSION} -> {VERSION}

## Release Notes
See the generated [GitHub Release](https://github.com/ng-forge/ng-forge/releases/tag/v{VERSION}) for full changelog.

## Next Steps
After merging, trigger the Release workflow manually from GitHub Actions to publish to npm."
```

## What This Skill Does NOT Do

- **Publishing to npm**: Handled by the Release GitHub Action after PR merge

## Failure Recovery

If something goes wrong, clean up with:

```bash
# Delete local and remote branch
git checkout main
git branch -D release-{VERSION}
git push origin --delete release-{VERSION}

# Delete tag and GitHub release (if created)
git tag -d v{VERSION}
git push origin --delete v{VERSION}
gh release delete v{VERSION} --yes
```

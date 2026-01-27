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
- `@ng-forge/dynamic-form-mcp` (MCP server)

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
pnpm nx release changelog {VERSION} --from={PREVIOUS_TAG} --git-tag=false --create-release=false
```

This command automatically:

- Updates CHANGELOG.md with entries since the previous release
- Commits the changelog

### 6. Review and clean up changelog

After generating, review `CHANGELOG.md` and ensure:

1. **Header is present** - The file should start with:

   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and uses [Conventional Commits](https://www.conventionalcommits.org/).
   ```

2. **No AI attribution** - Remove any "Thank You" sections that mention Claude, AI assistants, or automated tools. Per `CLAUDE.md`, AI attribution is not allowed.

3. **Version links** - Each version header should link to the GitHub compare view:

   ```markdown
   ## [0.4.0](https://github.com/ng-forge/ng-forge/compare/v0.3.1...v0.4.0) (YYYY-MM-DD)
   ```

4. **Clean formatting** - Remove excessive breaking change details, keeping only concise summaries.

If changes are needed, amend the changelog commit:

```bash
git add CHANGELOG.md
git commit --amend --no-edit
```

**Note:** Tags and GitHub releases are created automatically by the Release GitHub Action after the PR is merged and manually triggered.

### 7. Push the branch

```bash
git push -u origin release-{VERSION}
```

### 8. Create the PR

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
- @ng-forge/dynamic-form-mcp: {OLD_VERSION} -> {VERSION}

## Changelog
[Include changelog entries from CHANGELOG.md for this version]

## Next Steps
After merging, trigger the Release workflow manually from GitHub Actions to create the tag, GitHub release, and publish to npm."
```

## What This Skill Does NOT Do

- **Creating git tags**: Handled by the Release GitHub Action after PR merge
- **Creating GitHub releases**: Handled by the Release GitHub Action after PR merge
- **Publishing to npm**: Handled by the Release GitHub Action after PR merge

## Failure Recovery

If something goes wrong, clean up with:

```bash
# Delete local and remote branch
git checkout main
git branch -D release-{VERSION}
git push origin --delete release-{VERSION}
```

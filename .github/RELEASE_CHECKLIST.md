# Release Checklist

Use this checklist when preparing and executing a release. Releases run through
the `Release` GitHub Actions workflow (`.github/workflows/release.yml`), which
versions and publishes all 7 packages together.

## Packages

- @ng-forge/dynamic-forms
- @ng-forge/dynamic-forms-material
- @ng-forge/dynamic-forms-bootstrap
- @ng-forge/dynamic-forms-primeng
- @ng-forge/dynamic-forms-ionic
- @ng-forge/dynamic-form-mcp
- @ng-forge/openapi-generator

## Channels

- **Stable** (`@latest`): dispatch the Release workflow with `mode: publish`.
- **Nightly** (`@next`): published automatically by the daily schedule. Dispatch
  `mode: next` (no `target`) to publish one on demand.
- **Release candidate** (`@rc`): dispatch `mode: next` with `target: X.Y.Z` to
  start (or re-target) an rc cycle off main. Subsequent nightlies continue the
  cycle (rc.2, rc.3, ...) automatically until the stable `X.Y.Z` ships.

## Pre-Release

- [ ] CI is green on main (build, lint, test, e2e)
- [ ] No critical bugs or security issues pending
- [ ] Documentation is up to date
- [ ] Breaking changes documented (for major releases)
- [ ] Migration guide prepared (for major releases)

## Dry Run

- [ ] Ran the Release workflow with `mode: dry-run`
- [ ] Verified all 7 packages would publish with the expected versions
- [ ] Checked changelog generation looks correct
- [ ] No errors in the dry-run logs

## Release Execution (stable)

- [ ] Ran the Release workflow with `mode: publish`
- [ ] Workflow completed successfully
- [ ] Git tag created (e.g. `v1.2.3`)
- [ ] GitHub Release created with the correct changelog

> Optional: to cut a frozen `release-*` branch first, use
> `pnpm release:branch:patch` (or `:minor` / `:major`), which runs
> `scripts/create-release-branch.sh`. Pushing a `release-*` branch also triggers
> the Release workflow.

## Post-Release Verification

- [ ] Verify npm publication for all 7 packages at the new version:
  - [ ] @ng-forge/dynamic-forms
  - [ ] @ng-forge/dynamic-forms-material
  - [ ] @ng-forge/dynamic-forms-bootstrap
  - [ ] @ng-forge/dynamic-forms-primeng
  - [ ] @ng-forge/dynamic-forms-ionic
  - [ ] @ng-forge/dynamic-form-mcp
  - [ ] @ng-forge/openapi-generator
- [ ] Test installation: `npm install @ng-forge/dynamic-forms@<version>`
- [ ] Smoke test: create a small project and verify basic functionality
- [ ] GitHub Release notes are accurate and complete

## Communication

- [ ] Announce the release in the appropriate channels (if applicable)
- [ ] Close related issues/PRs with release notes

---

## Quick Commands Reference

```bash
# Verify all published packages at the current version
for pkg in dynamic-forms dynamic-forms-material dynamic-forms-bootstrap \
           dynamic-forms-primeng dynamic-forms-ionic dynamic-form-mcp openapi-generator; do
  echo "@ng-forge/$pkg -> $(npm view @ng-forge/$pkg version)"
done

# List recent releases
gh release list

# Test installation
npm install @ng-forge/dynamic-forms@<version>
```

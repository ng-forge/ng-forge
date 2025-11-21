# Release Checklist

Use this checklist when preparing and executing a release.

## Pre-Release

- [ ] All tests passing on main branch
- [ ] No critical bugs or security issues pending
- [ ] Documentation is up to date
- [ ] CHANGELOG.md reviewed (if manually maintained)
- [ ] Dependencies are up to date and tested
- [ ] Breaking changes documented (for major releases)
- [ ] Migration guide prepared (for major releases)

## Creating Release Branch

- [ ] Identified the correct commit to release from
- [ ] Ran `./scripts/create-release-branch.sh [patch|minor|major] [commit-hash]`
- [ ] Verified version numbers in all package.json files
- [ ] Branch name matches version (e.g., `release-1.2.3`)
- [ ] Pushed release branch to origin

## Review

- [ ] Created pull request for the release branch
- [ ] CI pipeline passing (build, lint, test)
- [ ] Code review completed
- [ ] All 5 packages build successfully
- [ ] No unexpected changes in the release

## Dry Run

- [ ] Triggered workflow with `dry_run: true`
- [ ] Verified all packages would be published correctly
- [ ] Checked changelog generation looks correct
- [ ] No errors in dry-run logs

## Release Execution

- [ ] Triggered workflow with `publish: true` and `dry_run: false`
- [ ] Entered correct version number in workflow input
- [ ] Workflow completed successfully
- [ ] Git tag created: `v1.2.3`
- [ ] GitHub Release created with correct changelog

## Post-Release Verification

- [ ] Verify npm publication:
  - [ ] @ng-forge/dynamic-forms@1.2.3
  - [ ] @ng-forge/dynamic-forms-material@1.2.3
  - [ ] @ng-forge/dynamic-forms-primeng@1.2.3
  - [ ] @ng-forge/dynamic-forms-ionic@1.2.3
  - [ ] @ng-forge/dynamic-forms-bootstrap@1.2.3
- [ ] Test installation: `npm install @ng-forge/dynamic-forms@1.2.3`
- [ ] Smoke test: Create a small test project and verify basic functionality
- [ ] GitHub Release notes are accurate and complete
- [ ] Update documentation site if needed

## Communication

- [ ] Announce release in appropriate channels (if applicable)
- [ ] Update any external documentation or examples
- [ ] Close related GitHub issues/PRs with release notes
- [ ] Tweet/blog about major features (optional)

## Cleanup

- [ ] Delete release branch (or keep for historical reference)
- [ ] Archive or close the release PR
- [ ] Plan next release milestone

---

## Quick Commands Reference

```bash
# Create release branch
./scripts/create-release-branch.sh patch
./scripts/create-release-branch.sh minor abc1234

# Check release status
gh release list
npm view @ng-forge/dynamic-forms versions

# Verify all packages
for pkg in dynamic-forms dynamic-forms-material dynamic-forms-primeng dynamic-forms-ionic dynamic-forms-bootstrap; do
  npm view @ng-forge/$pkg version
done

# Test installation
npm install @ng-forge/dynamic-forms@1.2.3
```

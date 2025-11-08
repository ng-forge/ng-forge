# Pull Request

## Description

<!-- Provide a brief description of your changes -->

## Type of Change

<!-- Mark the relevant option with an "x" -->

- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code style update (formatting, renaming)
- [ ] ♻️ Code refactoring (no functional changes)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Build/tooling update
- [ ] 🔒 Security fix

## Related Issues

<!-- Link to related issues. Use "Fixes #123" to auto-close issues when PR is merged -->

Fixes #
Related to #

## Changes Made

<!-- Provide a detailed list of changes -->

-
-
-

## Breaking Changes

<!-- If this PR introduces breaking changes, describe them here and how users should migrate -->

- **Before:**

  ```typescript
  // Old usage
  ```

- **After:**

  ```typescript
  // New usage
  ```

- **Migration:**

## Testing

<!-- Describe how you tested these changes -->

### Test Coverage

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] E2E tests added/updated (if applicable)
- [ ] All tests pass locally
- [ ] Test coverage maintained or improved

### Manual Testing

<!-- Describe manual testing performed -->

- [ ] Tested in browser (specify browsers if relevant)
- [ ] Tested with different configurations
- [ ] Tested edge cases
- [ ] Tested backwards compatibility (if applicable)

### Test Configuration

```typescript
// If applicable, share test configuration used
const config = {
  fields: [
    // ...
  ],
};
```

## Screenshots / Videos

<!-- If applicable, add screenshots or videos to demonstrate the changes -->

**Before:**

**After:**

## Documentation

<!-- Check all that apply -->

- [ ] Documentation has been updated (if needed)
- [ ] README updated (if needed)
- [ ] Developer guides updated (if needed)
- [ ] API documentation (TSDoc) added/updated
- [ ] Examples added/updated (if needed)
- [ ] Changelog entry added (if applicable)

## Performance Impact

<!-- Describe any performance implications -->

- [ ] No performance impact
- [ ] Performance improved
- [ ] Performance impact assessed and acceptable
- [ ] Performance benchmarks included

<!-- If there's a performance impact, provide details -->

## Checklist

<!-- Ensure all items are checked before requesting review -->

### Code Quality

- [ ] Code follows the [coding standards](../CODING_STANDARDS.md)
- [ ] Code is self-documenting or has appropriate comments
- [ ] No commented-out code
- [ ] No console.log() or debugging statements
- [ ] Error handling is appropriate
- [ ] Type safety maintained (no `any` types)

### Testing & Quality

- [ ] All new code is covered by tests
- [ ] All existing tests pass
- [ ] No linting errors (`pnpm lint`)
- [ ] Code is formatted (`pnpm lint:fix`)
- [ ] Build succeeds (`pnpm build:libs`)

### Git

- [ ] Commits follow [conventional commit format](https://www.conventionalcommits.org/)
- [ ] Commit messages are clear and descriptive
- [ ] Branch is up to date with main
- [ ] No merge conflicts

### Review

- [ ] Self-review completed
- [ ] PR description is complete and clear
- [ ] Appropriate labels added
- [ ] Reviewers assigned (if known)

## Additional Notes

<!-- Any additional information that reviewers should know -->

## For Reviewers

<!-- Help guide reviewers on what to focus on -->

## **Focus Areas:**

- **Questions for Reviewers:**

-
- ***

  **Definition of Done:**

- [ ] Code reviewed and approved
- [ ] All CI checks pass
- [ ] Documentation complete
- [ ] No unresolved comments
- [ ] Ready to merge

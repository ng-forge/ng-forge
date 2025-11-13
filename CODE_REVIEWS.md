# Code Review Guidelines

This document outlines the code review process and guidelines for the ng-forge dynamic forms project. Code reviews are essential for maintaining code quality, sharing knowledge, and fostering collaboration.

## Table of Contents

- [Philosophy](#philosophy)
- [Review Process](#review-process)
- [Reviewer Guidelines](#reviewer-guidelines)
- [Author Guidelines](#author-guidelines)
- [Review Checklist](#review-checklist)
- [Common Issues](#common-issues)
- [Best Practices](#best-practices)

## Philosophy

### Goals of Code Review

1. **Catch bugs** - Find issues before they reach production
2. **Maintain quality** - Ensure code meets our standards
3. **Share knowledge** - Learn from each other
4. **Improve design** - Discuss architectural decisions
5. **Build culture** - Foster collaboration and respect

### Principles

- **Be respectful** - Focus on the code, not the person
- **Be constructive** - Suggest improvements, don't just criticize
- **Be thorough** - Take time to understand the changes
- **Be timely** - Review within 24 hours when possible
- **Be open** - Welcome discussion and alternative approaches

## Review Process

### 1. Before Requesting Review

**Author Checklist:**

- [ ] Self-review completed
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code is formatted
- [ ] Documentation updated
- [ ] PR description is complete
- [ ] Commits follow convention

### 2. Review Timeline

- **Initial response**: Within 24 hours
- **Complete review**: Within 2-3 business days
- **Follow-up**: Within 1 business day after changes

### 3. Review States

- **Approved** ✅ - Ready to merge
- **Changes Requested** 🔴 - Issues must be addressed
- **Comment** 💬 - Suggestions, no blocking issues

## Reviewer Guidelines

### What to Look For

#### 1. Correctness

- Does the code do what it's supposed to do?
- Are there any logical errors?
- Are edge cases handled?
- Is error handling appropriate?

#### 2. Design & Architecture

- Does it follow established patterns?
- Is the code maintainable?
- Are abstractions appropriate?
- Is complexity justified?

#### 3. Code Quality

- Does it follow coding standards?
- Is the code readable?
- Are names descriptive?
- Is there duplication?

#### 4. Testing

- Are tests comprehensive?
- Do tests cover edge cases?
- Are tests meaningful?
- Is test coverage maintained?

#### 5. Documentation

- Are public APIs documented?
- Are complex algorithms explained?
- Is the README updated?
- Are examples accurate?

#### 6. Performance

- Are there performance concerns?
- Is lazy loading used appropriately?
- Are unnecessary re-renders avoided?
- Is memoization used where needed?

#### 7. Security

- Are inputs validated?
- Is user data sanitized?
- Are there injection vulnerabilities?
- Are secrets properly handled?

### How to Provide Feedback

#### Types of Comments

**🔴 Required (Blocking)** - Must be fixed before merge

```
🔴 **Required**: This will cause a runtime error when `value` is undefined.
Consider adding a null check: `if (value !== undefined) { ... }`
```

**🟡 Suggestion (Non-blocking)** - Nice to have, but not required

```
🟡 **Suggestion**: Consider extracting this logic into a separate function
for better readability. Not blocking merge.
```

**💭 Question** - Clarification needed

```
💭 **Question**: Why was this approach chosen over using the built-in mapper?
```

**👍 Praise** - Positive feedback

```
👍 Great test coverage! Love the use of edge cases.
```

### Review Communication

✅ **DO:**

- Be specific and provide examples
- Explain the "why" behind suggestions
- Offer alternative solutions
- Ask questions to understand intent
- Praise good code
- Use neutral language

❌ **DON'T:**

- Make personal attacks
- Be sarcastic or dismissive
- Assume incompetence
- Nitpick minor style issues
- Block on subjective preferences
- Provide feedback without explanation

## Author Guidelines

### Responding to Feedback

✅ **DO:**

- Respond to all comments
- Ask for clarification if needed
- Explain your reasoning politely
- Thank reviewers for their time
- Mark conversations as resolved

❌ **DON'T:**

- Take feedback personally
- Argue defensively
- Ignore comments
- Make changes without discussion
- Dismiss suggestions without consideration

### Making Changes

**After addressing feedback:**

1. **Make the changes**

   ```bash
   git add .
   git commit -m "fix: address code review feedback"
   git push
   ```

2. **Comment on the PR**

   ```markdown
   @reviewer I've addressed your feedback:

   - ✅ Added null check in user validation
   - ✅ Extracted validation to separate function
   - 💬 Regarding the performance question, I chose this approach
     because... What do you think?
   ```

3. **Request re-review**
   - Click "Re-request review" button

### Handling Disagreements

If you disagree with feedback:

1. **Understand the concern** - Ask questions
2. **Explain your reasoning** - Share your perspective
3. **Discuss alternatives** - Find middle ground
4. **Escalate if needed** - Involve maintainers
5. **Accept decisions** - Move forward

## Review Checklist

### For Reviewers

#### Code Quality

- [ ] Follows coding standards
- [ ] Names are clear and descriptive
- [ ] No unnecessary complexity
- [ ] No code duplication
- [ ] Proper error handling

#### Functionality

- [ ] Meets requirements
- [ ] Edge cases handled
- [ ] No obvious bugs
- [ ] Backwards compatible (or breaking changes documented)

#### Testing

- [ ] Tests included
- [ ] Tests pass
- [ ] Edge cases tested
- [ ] Coverage maintained

#### Documentation

- [ ] Public APIs documented
- [ ] README updated (if needed)
- [ ] Comments explain complex logic
- [ ] Examples are accurate

#### Performance

- [ ] No performance regressions
- [ ] Lazy loading used appropriately
- [ ] Memoization where needed
- [ ] OnPush change detection

#### Security

- [ ] Inputs validated
- [ ] No XSS vulnerabilities
- [ ] No injection risks
- [ ] Secrets not exposed

### For Authors

#### Before Review

- [ ] Self-reviewed all changes
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Code formatted
- [ ] Commits follow convention
- [ ] PR description complete

#### During Review

- [ ] Responded to all comments
- [ ] Made requested changes
- [ ] Resolved conversations
- [ ] Re-requested review

## Common Issues

### 1. Missing Tests

**Issue:**

```typescript
// No tests for this new feature
export function complexValidation(value: string): boolean {
  // Complex logic...
}
```

**Solution:**

```typescript
describe('complexValidation', () => {
  it('should validate correct input', () => {
    expect(complexValidation('valid')).toBe(true);
  });

  it('should reject invalid input', () => {
    expect(complexValidation('invalid')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(complexValidation('')).toBe(false);
    expect(complexValidation(null as any)).toBe(false);
  });
});
```

### 2. Type Safety Issues

**Issue:**

```typescript
function process(data: any) {
  // ❌ any
  return data.value;
}
```

**Solution:**

```typescript
function process(data: { value: string }): string {
  if (!data || typeof data.value !== 'string') {
    throw new Error('Invalid data');
  }
  return data.value;
}
```

### 3. Performance Problems

**Issue:**

```typescript
// Function called in template = re-executed on every change
template: `{{ calculateTotal() }}`;
```

**Solution:**

```typescript
// Use computed signal
readonly total = computed(() => {
  return this.items().reduce((sum, item) => sum + item.price, 0);
});

template: `{{ total() }}`
```

### 4. Missing Documentation

**Issue:**

```typescript
// No documentation
export interface FieldDef<TProps> {
  key: string;
  type: string;
}
```

**Solution:**

````typescript
/**
 * Represents a dynamic form field definition.
 *
 * @typeParam TProps - Field-specific properties interface
 *
 * @example
 * ```typescript
 * const field: FieldDef<InputProps> = {
 *   key: 'email',
 *   type: 'input',
 * };
 * ```
 */
export interface FieldDef<TProps> {
  /**
   * Unique field identifier for form binding.
   */
  key: string;

  /**
   * Field type identifier for component selection.
   */
  type: string;
}
````

### 5. Not Following Conventions

**Issue:**

```typescript
// Using old Angular patterns
@Component({})
export class MyComponent {
  @Input() value?: string;
  @Output() change = new EventEmitter();
}
```

**Solution:**

```typescript
// Use modern Angular patterns
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyComponent {
  readonly value = input<string>();
  readonly change = output<string>();
}
```

## Best Practices

### For Efficient Reviews

1. **Keep PRs small** - Aim for < 400 lines changed
2. **Single purpose** - One PR = one feature/fix
3. **Clear descriptions** - Explain what and why
4. **Link issues** - Reference related issues
5. **Add context** - Include screenshots, examples

### For Better Communication

1. **Ask questions** - Seek to understand
2. **Provide examples** - Show, don't just tell
3. **Be specific** - Point to exact lines
4. **Offer solutions** - Suggest improvements
5. **Follow up** - Continue discussion if needed

### For Learning

1. **Learn from reviews** - Both giving and receiving
2. **Ask why** - Understand the reasoning
3. **Share knowledge** - Explain patterns and best practices
4. **Be open to change** - Update practices based on feedback
5. **Document patterns** - Add to guides when useful

## When to Merge

Merge when:

- [ ] All required reviewers approved
- [ ] All comments resolved
- [ ] All CI checks pass
- [ ] No merge conflicts
- [ ] Author confirms ready

## After Merge

**Reviewer:**

- [ ] Verify CI passes on main
- [ ] Monitor for issues
- [ ] Follow up if problems arise

**Author:**

- [ ] Delete feature branch
- [ ] Close related issues
- [ ] Monitor deployment
- [ ] Update documentation if needed

## Resources

- [Coding Standards](./CODING_STANDARDS.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Developer Guides](./guides/README.md)

## Questions?

If you have questions about the review process:

1. Check this document
2. Ask in the PR discussion
3. Contact maintainers
4. Open a discussion

## Summary

Effective code reviews:

- ✅ Improve code quality
- ✅ Share knowledge
- ✅ Build better software
- ✅ Foster collaboration
- ✅ Create learning opportunities

Remember: We're all on the same team, working together to build great software. 🚀

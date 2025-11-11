# Deterministic Wait Patterns for E2E Tests

## Overview

This document describes the deterministic waiting strategies used to replace arbitrary `waitForTimeout()` calls in our e2e tests.

## The Problem with `waitForTimeout()`

Arbitrary delays like `await page.waitForTimeout(1000)` are:

- **Non-deterministic**: May be too short on slow systems or too long on fast systems
- **Flaky**: Can cause intermittent test failures
- **Slow**: Add unnecessary delays when the condition is already met
- **Maintenance burden**: Need constant tweaking as the app changes

## Deterministic Alternatives

### 1. Wait for Angular Stability

**Use when**: After clicks, form interactions, or any action that triggers Angular change detection

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForAngularStability();
```

**What it does**:

- Waits for DOM to be fully loaded
- Waits for network requests to complete
- Ensures Angular zone has stabilized

### 2. Wait for Page Transitions

**Use when**: Navigating between pages in multi-page forms

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForPageTransition('Expected Page Title');
```

**What it does**:

- Waits for Angular stability
- Waits for the new page's heading/title to be visible
- Ensures page transition is complete

### 3. Wait for Field Validation

**Use when**: After filling a form field and expecting validation to run

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForFieldValidation('field-test-id');
```

**What it does**:

- Waits for error messages to appear OR
- Waits for field to stabilize (validation passed)
- Times out gracefully if no validation occurs

### 4. Wait for Conditional Fields

**Use when**: A field should appear/disappear based on another field's value

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForConditionalFieldChange('field-test-id', true); // should be visible
```

**What it does**:

- Waits for the field to reach the expected visibility state
- Gracefully handles if field is already in expected state

### 5. Wait for Scenario Load (Test Harness Specific)

**Use when**: Loading a test scenario via `page.evaluate()` in the e2e test harness

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForScenarioLoad();
```

**What it does**:

- Waits for dynamic-form element to be rendered
- Waits for Angular to stabilize
- Ensures all components are initialized

### 6. Wait for Form Submission

**Use when**: After clicking submit button

```typescript
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForFormSubmission();
```

**What it does**:

- Waits for success/error message OR
- Waits for navigation OR
- Waits for network to stabilize

### 7. Playwright's Built-in Auto-Waiting

**Use when**: Interacting with elements (click, fill, etc.)

```typescript
// Playwright automatically waits for:
// - Element to be visible
// - Element to be enabled
// - Element to be stable (not animating)
await page.locator('button').click(); // No explicit wait needed!
```

**What it does**:

- Built into all Playwright actions
- Retries until conditions are met or timeout
- Usually no additional wait needed

### 8. Wait for Specific Element States

**Use when**: You need to wait for a specific element to appear/disappear

```typescript
// Wait for element to be visible
await page.locator('.success-message').waitFor({ state: 'visible' });

// Wait for element to be hidden
await page.locator('.loading-spinner').waitFor({ state: 'hidden' });

// Wait for element to be attached to DOM
await page.locator('form').waitFor({ state: 'attached' });
```

## Migration Guide

### Before (Non-deterministic)

```typescript
test('example test', async ({ page }) => {
  await page.goto('/form');
  await page.waitForTimeout(2000); // ❌ Bad

  await page.fill('#name', 'John');
  await page.waitForTimeout(500); // ❌ Bad

  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // ❌ Bad
});
```

### After (Deterministic)

```typescript
test('example test', async ({ page }) => {
  const waitHelpers = new DeterministicWaitHelpers(page);

  await page.goto('/form');
  await page.waitForLoadState('networkidle'); // ✅ Good
  await waitHelpers.waitForAngularStability(); // ✅ Good

  await page.fill('#name', 'John');
  // Playwright auto-waits for field to be ready - no wait needed! ✅

  await page.click('button[type="submit"]');
  await waitHelpers.waitForFormSubmission(); // ✅ Good
});
```

## Common Patterns

### Pattern 1: Click and Wait for Content Change

```typescript
// ❌ Before
await page.click('.tab-button');
await page.waitForTimeout(1000);

// ✅ After
await page.click('.tab-button');
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForAngularStability();
```

### Pattern 2: Fill Field and Check Validation

```typescript
// ❌ Before
await page.fill('#email', 'invalid-email');
await page.locator('#email').blur();
await page.waitForTimeout(500);
await expect(page.locator('.error-message')).toBeVisible();

// ✅ After
await page.fill('#email', 'invalid-email');
await page.locator('#email').blur();
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForFieldValidation('email');
await expect(page.locator('.error-message')).toBeVisible();
```

### Pattern 3: Multi-Page Form Navigation

```typescript
// ❌ Before
await page.click('button:has-text("Next")');
await page.waitForTimeout(2000);

// ✅ After
await page.click('button:has-text("Next")');
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForPageTransition();
```

### Pattern 4: Loading Test Scenario

```typescript
// ❌ Before
await page.evaluate(() => {
  window.loadTestScenario(config);
});
await page.waitForTimeout(3000);

// ✅ After
await page.evaluate(() => {
  window.loadTestScenario(config);
});
const waitHelpers = new DeterministicWaitHelpers(page);
await waitHelpers.waitForScenarioLoad();
```

## Best Practices

1. **Always prefer deterministic waits** over arbitrary timeouts
2. **Use Playwright's auto-waiting** - it's built into most actions
3. **Wait for specific conditions** - element visible, text present, etc.
4. **Use helper methods** from `DeterministicWaitHelpers` for common patterns
5. **Timeout gracefully** - all waits have reasonable timeouts and error handling
6. **Don't over-wait** - only wait when necessary, Playwright handles most cases

## When Timeouts ARE Acceptable

There are rare cases where a short timeout might be needed:

1. **Testing animations**: If you specifically need to test mid-animation state
2. **Debounced inputs**: When testing debounce behavior explicitly
3. **Timing-dependent features**: When the timing itself is what's being tested

Even in these cases, consider if there's a better approach (CSS animation events, waiting for specific element states, etc.)

## Automated Migration

Run the migration script to automatically convert most patterns:

```bash
node apps/demo/material/e2e/migrate-to-deterministic-waits.js
```

This will replace common patterns across all test files. Review and test afterwards!

## Further Reading

- [Playwright Auto-Waiting](https://playwright.dev/docs/actionability)
- [Playwright Waiting Best Practices](https://playwright.dev/docs/best-practices#use-web-first-assertions)
- [Angular Testing Guide](https://angular.io/guide/testing)

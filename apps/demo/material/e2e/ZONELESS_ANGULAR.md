# Zoneless Angular E2E Testing

## Overview

This project uses **zoneless Angular**, which means the traditional `zone.js`-based Angular testability API is not available. Our deterministic wait helpers have been specifically designed to work without zone.js.

## How It Works Without Zone.js

### Traditional Zone-based Approach (NOT Used)

```typescript
// ❌ Doesn't work without zone.js
await page.waitForFunction(() => {
  const testabilities = window.getAllAngularTestabilities();
  return testabilities.every((t) => t.isStable());
});
```

### Zoneless Approach (What We Use)

```typescript
// ✅ Works with zoneless Angular
async waitForAngularStability() {
  // 1. Wait for network requests to complete
  await page.waitForLoadState('networkidle');

  // 2. Wait for rendering to complete using requestAnimationFrame
  await page.evaluate(() => {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  });
}
```

## Key Differences

### With Zone.js

- Angular automatically tracks asynchronous operations
- Testability API knows when app is "stable"
- Can use `getAllAngularTestabilities()` to check status

### Without Zone.js (Zoneless)

- Must rely on other stability indicators:
  - **Network idle**: No pending HTTP requests
  - **DOM stability**: Use requestAnimationFrame
  - **Element visibility**: Wait for specific elements
  - **Load states**: Use Playwright's load state detection

## Our Zoneless Wait Strategies

### 1. Network Idle Wait

The most reliable indicator for zoneless Angular:

```typescript
await page.waitForLoadState('networkidle', { timeout: 10000 });
```

This waits until there are no network requests for 500ms, which typically means:

- All HTTP requests completed
- Components finished loading data
- UI has rendered the data

### 2. requestAnimationFrame Wait

Ensures rendering is complete:

```typescript
await page.evaluate(() => {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
});
```

This waits for:

- Current frame to complete
- Next frame to start
- Ensures any pending DOM updates are visible

### 3. Element-Specific Waits

Most reliable for zoneless Angular:

```typescript
// Wait for specific element to be visible
await page.locator('.data-loaded').waitFor({ state: 'visible' });

// Wait for loading spinner to disappear
await page.locator('.spinner').waitFor({ state: 'hidden' });

// Wait for specific text to appear
await page.getByText('Data Loaded').waitFor({ state: 'visible' });
```

## Best Practices for Zoneless Angular E2E Tests

### ✅ DO: Use Element-Specific Waits

```typescript
// Good - waits for actual UI state
await page.locator('[data-testid="submit-button"]').click();
await page.locator('.success-message').waitFor({ state: 'visible' });
```

### ✅ DO: Use Network Idle

```typescript
// Good - waits for data to load
await page.goto('/dashboard');
await page.waitForLoadState('networkidle');
```

### ✅ DO: Combine Multiple Wait Strategies

```typescript
// Good - multi-layered approach
await page.click('button');
await page.waitForLoadState('networkidle'); // Wait for any API calls
await page.locator('.updated-content').waitFor({ state: 'visible' }); // Wait for UI update
```

### ❌ DON'T: Rely on Zone.js Testability

```typescript
// Bad - doesn't work without zone.js
await page.waitForFunction(() => {
  return window.getAllAngularTestabilities?.()?.[0]?.isStable();
});
```

### ❌ DON'T: Use Arbitrary Timeouts

```typescript
// Bad - non-deterministic
await page.waitForTimeout(1000);
```

## When to Use Each Wait Strategy

### After Navigation

```typescript
await page.goto('/page');
await page.waitForLoadState('networkidle');
await waitHelpers.waitForAngularStability();
```

### After Form Interaction

```typescript
await page.fill('#email', 'test@example.com');
await page.locator('#email').blur();
// Playwright auto-waits for next action, or:
await page.locator('.validation-message').waitFor({ state: 'visible' });
```

### After Button Click

```typescript
await page.click('button[type="submit"]');
await page.waitForLoadState('networkidle'); // Wait for API call
await page.locator('.result').waitFor({ state: 'visible' }); // Wait for result
```

### After Dynamic Content Load

```typescript
await page.evaluate(() => window.loadScenario(config));
await page.locator('dynamic-form').waitFor({ state: 'visible' });
await waitHelpers.waitForAngularStability(); // Network idle + rAF
```

## Common Patterns

### Pattern 1: Data Fetching

```typescript
test('loads data correctly', async ({ page }) => {
  await page.goto('/data-page');

  // Wait for network idle (data fetched)
  await page.waitForLoadState('networkidle');

  // Wait for data to be rendered
  await page.locator('[data-testid="data-table"]').waitFor({ state: 'visible' });

  // Now interact with the data
  await expect(page.locator('tbody tr')).toHaveCount(10);
});
```

### Pattern 2: Form Submission

```typescript
test('submits form', async ({ page }) => {
  await page.fill('#name', 'John');
  await page.click('button[type="submit"]');

  // Wait for submission API call
  await page.waitForLoadState('networkidle');

  // Wait for success message
  await page.locator('.success-message').waitFor({ state: 'visible' });

  await expect(page.locator('.success-message')).toContainText('Saved successfully');
});
```

### Pattern 3: Conditional Fields

```typescript
test('shows conditional field', async ({ page }) => {
  await page.fill('#age', '16');
  await page.locator('#age').blur();

  // Wait for conditional field to appear
  await page.locator('#guardianConsent').waitFor({ state: 'visible', timeout: 5000 });

  await expect(page.locator('#guardianConsent')).toBeVisible();
});
```

## Debugging Zoneless Tests

### Check Network Activity

```typescript
page.on('request', (request) => console.log('→', request.url()));
page.on('response', (response) => console.log('←', response.url(), response.status()));
```

### Check Load State

```typescript
console.log('Load state:', await page.evaluate(() => document.readyState));
```

### Check for Pending Requests

```typescript
// Use Playwright's built-in network tracking
await page.waitForLoadState('networkidle');
console.log('Network is idle');
```

### Increase Timeout for Debugging

```typescript
await page.locator('.slow-element').waitFor({
  state: 'visible',
  timeout: 30000, // 30 seconds for debugging
});
```

## Performance Benefits

Zoneless Angular with proper wait strategies can be:

- **Faster**: No zone.js overhead in tests
- **More reliable**: Explicit waits based on actual conditions
- **Easier to debug**: Clear wait points, not hidden in zone patches

## Summary

**Key Takeaway**: Without zone.js, we rely on:

1. **Network idle state** - Most important indicator
2. **Element visibility** - Most specific and reliable
3. **requestAnimationFrame** - For rendering completion
4. **Playwright's auto-waiting** - Built into all actions

Our `DeterministicWaitHelpers` class abstracts these patterns into reusable methods that work perfectly with zoneless Angular.

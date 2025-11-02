# E2E Tests for Dynamic Form Material

This directory contains end-to-end tests for the dynamic-form-material library using Playwright.

## Running Tests

To run the e2e tests:

```bash
# Run all e2e tests
nx e2e dynamic-form-material

# Run tests in headed mode (with browser UI)
nx e2e dynamic-form-material --headed

# Run tests in a specific browser
nx e2e dynamic-form-material --project=chromium

# Run tests in debug mode
nx e2e dynamic-form-material --debug
```

## Test Structure

- `material-form.spec.ts` - Tests for basic material component rendering and interaction
- `form-validation.spec.ts` - Tests for form validation functionality

## Configuration

The Playwright configuration is located in `playwright.config.ts` at the library root level. It's configured to:

- Start the docs application (`nx serve docs`) before running tests
- Test against Chromium, Firefox, and WebKit browsers
- Generate HTML reports for test results
- Use localhost:4200 as the base URL

## Writing Tests

When writing new tests:

1. Follow the existing test structure and naming conventions
2. Use proper page object patterns for complex interactions
3. Include appropriate waits for dynamic content
4. Test both positive and negative scenarios
5. Use descriptive test names that explain the expected behavior

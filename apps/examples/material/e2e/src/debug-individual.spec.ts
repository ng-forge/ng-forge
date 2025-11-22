import { test, expect } from '@playwright/test';

test('debug individual array field page', async ({ page }) => {
  // Listen for console messages
  page.on('console', (msg) => console.log('CONSOLE:', msg.type(), msg.text()));

  // Listen for page errors
  page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message, error.stack));

  // Listen for crashes
  page.on('crash', () => console.log('PAGE CRASHED!'));

  try {
    // Test individual page instead of index
    await page.goto('http://localhost:4200/#/test/array-fields/array-add', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: '/tmp/array-add-page.png', fullPage: true });

    console.log('Array add page loaded successfully!');
  } catch (error) {
    console.log('ERROR:', error);
    try {
      await page.screenshot({ path: '/tmp/array-add-error.png', fullPage: true });
    } catch (e) {
      console.log('Could not take error screenshot');
    }
  }
});

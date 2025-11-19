import { test } from '@playwright/test';

test('debug page load with console capture', async ({ page }) => {
  const consoleMessages: string[] = [];
  const errors: string[] = [];

  page.on('console', (msg) => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  page.on('crash', () => {
    console.log('PAGE CRASHED!');
    console.log('Console messages:', consoleMessages);
    console.log('Errors:', errors);
  });

  try {
    console.log('Navigating to cross-field-validation...');
    await page.goto('http://localhost:4200/cross-field-validation', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    console.log('Page loaded successfully!');
    console.log('Console messages:', consoleMessages);
    console.log('Errors:', errors);

    // Check if page is actually loaded
    const title = await page.title();
    console.log('Page title:', title);
  } catch (error) {
    console.log('Error occurred:', error instanceof Error ? error.message : error);
    console.log('Console messages collected:', consoleMessages);
    console.log('Page errors collected:', errors);
    throw error;
  }
});

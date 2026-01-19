// Types
export type {
  ConsoleCheckOptions,
  FormSubmissionEvent,
  MockEndpointConfig,
  MockResponse,
  SimulatedSubmission,
  TestScenario,
  TestSuite,
} from './types';

// Interfaces (type-only exports)
export type { BaseTestHelpers, ConsoleTracker, InterceptedRequest, MockApiHelpers, UISelectors } from './base-fixtures';

// Factories and utilities
export {
  createBaseHelpers,
  createConsoleTrackerFixture,
  createErrorHelpers,
  createMockApiFixture,
  createSetupConsoleCheck,
  createSetupTestLogging,
  createTestUrl,
  logTestResult,
  normalizeRoutePattern,
  base,
  expect,
} from './base-fixtures';

// App port configuration - use this to derive baseURL in fixtures
export { APP_PORTS, type ExampleApp } from './app-config';

// Note: Full Playwright configuration is NOT exported here to avoid Angular compilation issues.
// Import directly from '@ng-forge/examples-shared-testing/playwright-config' in playwright.config.ts files.

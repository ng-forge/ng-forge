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

// Note: Playwright configuration is NOT exported here to avoid Angular compilation.
// Import directly from '@examples/shared/testing/playwright-config' in playwright.config.ts files.

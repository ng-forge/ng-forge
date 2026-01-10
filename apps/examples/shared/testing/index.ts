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

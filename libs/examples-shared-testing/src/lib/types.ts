import { CustomFnConfig, FormConfig, SubmissionActionResult } from '@ng-forge/dynamic-forms';
import { FieldTree } from '@angular/forms/signals';

/**
 * Simulated submission configuration for test scenarios (no HTTP call)
 */
export interface SimulatedSubmission {
  /** Delay in ms before submission completes */
  delayMs: number;
  /** Optional: simulate server error (returns validation errors) */
  simulateError?: boolean;
  /** Optional: custom error message when simulateError is true */
  errorMessage?: string;
}

/**
 * Mock endpoint configuration for test scenarios (uses real HTTP that Playwright intercepts)
 */
export interface MockEndpointConfig {
  /** The endpoint URL to call (will be intercepted by Playwright) */
  url: string;
  /** HTTP method to use */
  method?: 'POST' | 'PUT' | 'PATCH';
}

/**
 * Mock response configuration for Playwright route interception
 */
export interface MockResponse {
  /** HTTP status code */
  status?: number;
  /** Response body (will be JSON stringified) */
  body?: Record<string, unknown>;
  /** Delay before responding (ms) */
  delay?: number;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Represents a single test scenario with its form configuration
 */
export interface TestScenario {
  /** Unique identifier used for data-testid and routing */
  testId: string;
  /** Display title for the test */
  title: string;
  /** Optional description explaining what the test validates */
  description?: string;
  /** The form configuration to render */
  config: FormConfig;
  /** Optional initial value for the form */
  initialValue?: Record<string, unknown>;
  /**
   * Optional: simulate async submission with configurable delay.
   * When provided, the component will:
   * - Inject a submission.action into the config
   * - Track and display submission state (submitting indicator, count, result)
   */
  simulateSubmission?: SimulatedSubmission;
  /**
   * Optional: provide a custom submission action.
   * Can return either a Promise or an Observable.
   * Takes precedence over simulateSubmission and mockEndpoint.
   */
  submissionAction?: (form: FieldTree<unknown>) => SubmissionActionResult;
  /**
   * Optional: use a mock HTTP endpoint for submission.
   * The endpoint will be intercepted by Playwright in E2E tests.
   * Takes precedence over simulateSubmission.
   */
  mockEndpoint?: MockEndpointConfig;
  /**
   * Optional: custom function configuration for validators and expressions.
   * This is merged into the form config when rendering the scenario.
   */
  customFnConfig?: CustomFnConfig;
}

/**
 * Represents a test suite containing multiple scenarios
 */
export interface TestSuite {
  /** Unique identifier for the suite (used in routing) */
  id: string;
  /** Display title for the suite */
  title: string;
  /** Description of what the suite tests */
  description: string;
  /** Route path for navigation */
  path: string;
  /** All scenarios in this suite */
  scenarios: TestScenario[];
}

/**
 * Form submission event data
 */
export interface FormSubmissionEvent {
  timestamp: string;
  data: Record<string, unknown>;
  testId: string;
}

export interface ConsoleCheckOptions {
  ignorePatterns?: RegExp[];
}

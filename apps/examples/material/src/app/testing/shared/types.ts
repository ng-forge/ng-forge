import { FormConfig } from '@ng-forge/dynamic-forms';

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

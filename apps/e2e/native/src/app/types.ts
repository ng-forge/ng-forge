import type { FormConfig } from '@ng-forge/dynamic-forms';

export interface TestScenario {
  /** Last segment of the deep link, `ngforge-e2e://test/<suite>/<testId>`. */
  testId: string;
  title: string;
  description?: string;
  config: FormConfig;
  initialValue?: Record<string, unknown>;
}

export interface TestSuite {
  id: string;
  title: string;
  scenarios: TestScenario[];
}

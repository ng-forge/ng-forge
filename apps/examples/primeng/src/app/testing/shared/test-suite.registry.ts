import { TestSuite } from './types';
import { primengComponentsSuite } from '../primeng-components/primeng-components.suite';
import { demoScenariosSuite } from '../demo-scenarios/demo-scenarios.suite';
import { comprehensiveFieldTestsSuite } from '../comprehensive-field-tests/comprehensive-field-tests.suite';
import { userJourneyFlowsSuite } from '../user-journey-flows/user-journey-flows.suite';
import { userWorkflowsSuite } from '../user-workflows/user-workflows.suite';

/**
 * Registry of all test suites in the application.
 */
export const TEST_SUITE_REGISTRY: TestSuite[] = [
  primengComponentsSuite,
  demoScenariosSuite,
  comprehensiveFieldTestsSuite,
  userJourneyFlowsSuite,
  userWorkflowsSuite,
];

import { TestSuite } from './types';

// Import all test suites
import { advancedValidationSuite } from '../advanced-validation/advanced-validation.suite';
import { arrayFieldsSuite } from '../array-fields/array-fields.suite';
import { asyncValidationSuite } from '../async-validation/async-validation.suite';
import { comprehensiveFieldTestsSuite } from '../comprehensive-field-tests/comprehensive-field-tests.suite';
import { crossFieldValidationSuite } from '../cross-field-validation/cross-field-validation.suite';
import { crossPageValidationSuite } from '../cross-page-validation/cross-page-validation.suite';
import { demoScenariosSuite } from '../demo-scenarios/demo-scenarios.suite';
import { derivationLogicSuite } from '../derivation-logic/derivation-logic.suite';
import { errorHandlingSuite } from '../error-handling/error-handling.suite';
import { essentialTestsSuite } from '../essential-tests/essential-tests.suite';
import { expressionBasedLogicSuite } from '../expression-based-logic/expression-based-logic.suite';
import { formResetClearSuite } from '../form-reset-clear/form-reset-clear.suite';
import { materialComponentsSuite } from '../material-components/material-components.suite';
import { multiPageNavigationSuite } from '../multi-page-navigation/multi-page-navigation.suite';
import { schemaSystemSuite } from '../schema-system/schema-system.suite';
import { userJourneyFlowsSuite } from '../user-journey-flows/user-journey-flows.suite';
import { userWorkflowsSuite } from '../user-workflows/user-workflows.suite';

/**
 * Registry of all test suites in the application.
 * This single source of truth is used by:
 * - TestIndexComponent (displays all suites)
 * - SuiteIndexComponent (displays scenarios within a suite)
 * - TestScenarioComponent (renders individual scenarios)
 */
export const TEST_SUITE_REGISTRY: TestSuite[] = [
  advancedValidationSuite,
  arrayFieldsSuite,
  asyncValidationSuite,
  comprehensiveFieldTestsSuite,
  crossFieldValidationSuite,
  crossPageValidationSuite,
  demoScenariosSuite,
  derivationLogicSuite,
  errorHandlingSuite,
  essentialTestsSuite,
  expressionBasedLogicSuite,
  formResetClearSuite,
  materialComponentsSuite,
  multiPageNavigationSuite,
  schemaSystemSuite,
  userJourneyFlowsSuite,
  userWorkflowsSuite,
];

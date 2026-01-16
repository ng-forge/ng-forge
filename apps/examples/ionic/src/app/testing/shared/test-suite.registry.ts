import { TestSuite } from './types';

// Import all test suites
import { accessibilitySuite } from '../accessibility/accessibility.suite';
import { advancedValidationSuite } from '../advanced-validation/advanced-validation.suite';
// NOTE: arrayFieldsSuite not available in PrimeNG (requires addArrayItem/removeArrayItem field types)
import { asyncValidationSuite } from '../async-validation/async-validation.suite';
// NOTE: bootstrapComponentsSuite replaced with PrimeNG-specific tests
import { comprehensiveFieldTestsSuite } from '../comprehensive-field-tests/comprehensive-field-tests.suite';
import { crossFieldValidationSuite } from '../cross-field-validation/cross-field-validation.suite';
import { crossPageValidationSuite } from '../cross-page-validation/cross-page-validation.suite';
import { demoScenariosSuite } from '../demo-scenarios/demo-scenarios.suite';
import { errorHandlingSuite } from '../error-handling/error-handling.suite';
import { essentialTestsSuite } from '../essential-tests/essential-tests.suite';
import { expressionBasedLogicSuite } from '../expression-based-logic/expression-based-logic.suite';
import { formResetClearSuite } from '../form-reset-clear/form-reset-clear.suite';
import { groupFieldsSuite } from '../group-fields/group-fields.suite';
import { helperTextSuite } from '../helper-text/helper-text.suite';
import { multiPageNavigationSuite } from '../multi-page-navigation/multi-page-navigation.suite';
import { schemaSystemSuite } from '../schema-system/schema-system.suite';
import { submissionBehaviorSuite } from '../submission-behavior/submission-behavior.suite';
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
  accessibilitySuite,
  advancedValidationSuite,
  // NOTE: arrayFieldsSuite not available in PrimeNG (requires addArrayItem/removeArrayItem field types)
  asyncValidationSuite,
  // NOTE: bootstrapComponentsSuite not available - needs PrimeNG-specific component tests
  comprehensiveFieldTestsSuite,
  crossFieldValidationSuite,
  crossPageValidationSuite,
  demoScenariosSuite,
  errorHandlingSuite,
  essentialTestsSuite,
  expressionBasedLogicSuite,
  formResetClearSuite,
  groupFieldsSuite,
  helperTextSuite,
  multiPageNavigationSuite,
  schemaSystemSuite,
  submissionBehaviorSuite,
  userJourneyFlowsSuite,
  userWorkflowsSuite,
];

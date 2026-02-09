import { TestSuite } from './types';

// Import all test suites
import { accessibilitySuite } from '../accessibility/accessibility.suite';
import { advancedValidationSuite } from '../advanced-validation/advanced-validation.suite';
import { angularSchemaValidationSuite } from '../angular-schema-validation/angular-schema-validation.suite';
import { arrayFieldsSuite } from '../array-fields/array-fields.suite';
import { asyncValidationSuite } from '../async-validation/async-validation.suite';
import { configChangeSuite } from '../config-change/config-change.suite';
import { comprehensiveFieldTestsSuite } from '../comprehensive-field-tests/comprehensive-field-tests.suite';
import { containerNestingSuite } from '../container-nesting/container-nesting.suite';
import { crossFieldValidationSuite } from '../cross-field-validation/cross-field-validation.suite';
import { crossPageValidationSuite } from '../cross-page-validation/cross-page-validation.suite';
import { demoScenariosSuite } from '../demo-scenarios/demo-scenarios.suite';
import { derivationLogicSuite } from '../derivation-logic/derivation-logic.suite';
import { propertyDerivationLogicSuite } from '../property-derivation-logic/property-derivation-logic.suite';
import { errorHandlingSuite } from '../error-handling/error-handling.suite';
import { essentialTestsSuite } from '../essential-tests/essential-tests.suite';
import { expressionBasedLogicSuite } from '../expression-based-logic/expression-based-logic.suite';
import { fieldMetaSuite } from '../field-meta/field-meta.suite';
import { formResetClearSuite } from '../form-reset-clear/form-reset-clear.suite';
import { groupFieldsSuite } from '../group-fields/group-fields.suite';
import { materialComponentsSuite } from '../material-components/material-components.suite';
import { multiPageNavigationSuite } from '../multi-page-navigation/multi-page-navigation.suite';
import { performanceSuite } from '../performance/performance.suite';
import { rowFieldsSuite } from '../row-fields/row-fields.suite';
import { schemaSystemSuite } from '../schema-system/schema-system.suite';
import { submissionBehaviorSuite } from '../submission-behavior/submission-behavior.suite';
import { userJourneyFlowsSuite } from '../user-journey-flows/user-journey-flows.suite';
import { userWorkflowsSuite } from '../user-workflows/user-workflows.suite';
import { zodSchemaValidationSuite } from '../zod-schema-validation/zod-schema-validation.suite';

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
  angularSchemaValidationSuite,
  arrayFieldsSuite,
  asyncValidationSuite,
  configChangeSuite,
  comprehensiveFieldTestsSuite,
  containerNestingSuite,
  crossFieldValidationSuite,
  crossPageValidationSuite,
  demoScenariosSuite,
  derivationLogicSuite,
  propertyDerivationLogicSuite,
  errorHandlingSuite,
  essentialTestsSuite,
  expressionBasedLogicSuite,
  fieldMetaSuite,
  formResetClearSuite,
  groupFieldsSuite,
  materialComponentsSuite,
  multiPageNavigationSuite,
  performanceSuite,
  rowFieldsSuite,
  schemaSystemSuite,
  submissionBehaviorSuite,
  userJourneyFlowsSuite,
  userWorkflowsSuite,
  zodSchemaValidationSuite,
];

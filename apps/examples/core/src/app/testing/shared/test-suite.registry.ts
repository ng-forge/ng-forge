import { TestSuite } from './types';

// Import all core (functional/logic) test suites
import { advancedValidationSuite } from '../advanced-validation/advanced-validation.suite';
import { angularSchemaValidationSuite } from '../angular-schema-validation/angular-schema-validation.suite';
import { asyncValidationSuite } from '../async-validation/async-validation.suite';
import { configChangeSuite } from '../config-change/config-change.suite';
import { containerConditionalVisibilitySuite } from '../container-conditional-visibility/container-conditional-visibility.suite';
import { containerNestingSuite } from '../container-nesting/container-nesting.suite';
import { crossFieldValidationSuite } from '../cross-field-validation/cross-field-validation.suite';
import { crossPageValidationSuite } from '../cross-page-validation/cross-page-validation.suite';
import { demoScenariosSuite } from '../demo-scenarios/demo-scenarios.suite';
import { derivationLogicSuite } from '../derivation-logic/derivation-logic.suite';
import { essentialTestsSuite } from '../essential-tests/essential-tests.suite';
import { expressionBasedLogicSuite } from '../expression-based-logic/expression-based-logic.suite';
import { formResetClearSuite } from '../form-reset-clear/form-reset-clear.suite';
import { multiPageNavigationSuite } from '../multi-page-navigation/multi-page-navigation.suite';
import { performanceSuite } from '../performance/performance.suite';
import { propertyDerivationLogicSuite } from '../property-derivation-logic/property-derivation-logic.suite';
import { schemaSystemSuite } from '../schema-system/schema-system.suite';
import { userJourneyFlowsSuite } from '../user-journey-flows/user-journey-flows.suite';
import { userWorkflowsSuite } from '../user-workflows/user-workflows.suite';
import { zodSchemaValidationSuite } from '../zod-schema-validation/zod-schema-validation.suite';

/**
 * Registry of all core (functional/logic) test suites.
 * These test library-agnostic behavior and run only in chromium.
 */
export const TEST_SUITE_REGISTRY: TestSuite[] = [
  advancedValidationSuite,
  angularSchemaValidationSuite,
  asyncValidationSuite,
  configChangeSuite,
  containerConditionalVisibilitySuite,
  containerNestingSuite,
  crossFieldValidationSuite,
  crossPageValidationSuite,
  demoScenariosSuite,
  derivationLogicSuite,
  essentialTestsSuite,
  expressionBasedLogicSuite,
  formResetClearSuite,
  multiPageNavigationSuite,
  performanceSuite,
  propertyDerivationLogicSuite,
  schemaSystemSuite,
  userJourneyFlowsSuite,
  userWorkflowsSuite,
  zodSchemaValidationSuite,
];

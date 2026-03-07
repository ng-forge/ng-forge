import { TestSuite } from './types';

// Import all visual/UI test suites
import { accessibilitySuite } from '../accessibility/accessibility.suite';
import { arrayFieldsSuite } from '../array-fields/array-fields.suite';
import { bootstrapComponentsSuite } from '../bootstrap-components/bootstrap-components.suite';
import { comprehensiveFieldTestsSuite } from '../comprehensive-field-tests/comprehensive-field-tests.suite';
import { errorHandlingSuite } from '../error-handling/error-handling.suite';
import { fieldMetaSuite } from '../field-meta/field-meta.suite';
import { groupFieldsSuite } from '../group-fields/group-fields.suite';
import { submissionBehaviorSuite } from '../submission-behavior/submission-behavior.suite';

/**
 * Registry of all visual/UI test suites in the bootstrap app.
 * Functional/logic tests have been moved to core-examples.
 */
export const TEST_SUITE_REGISTRY: TestSuite[] = [
  accessibilitySuite,
  arrayFieldsSuite,
  bootstrapComponentsSuite,
  comprehensiveFieldTestsSuite,
  errorHandlingSuite,
  fieldMetaSuite,
  groupFieldsSuite,
  submissionBehaviorSuite,
];

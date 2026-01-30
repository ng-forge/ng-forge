import { TestSuite } from '../shared/types';
import { metaNativeElementsScenario } from './scenarios/meta-native-elements.scenario';
import { metaWrappedComponentsScenario } from './scenarios/meta-wrapped-components.scenario';

/**
 * Field Meta Tests Suite
 * Tests meta attribute propagation to native input elements
 * for both native elements and wrapped UI library components.
 */
export const fieldMetaSuite: TestSuite = {
  id: 'field-meta',
  title: 'Field Meta Attributes',
  description: 'Testing meta attribute propagation to native input elements',
  path: '/test/field-meta',
  scenarios: [metaWrappedComponentsScenario, metaNativeElementsScenario],
};

/**
 * Get a scenario by its testId
 */
export function getFieldMetaScenario(testId: string) {
  return fieldMetaSuite.scenarios.find((s) => s.testId === testId);
}

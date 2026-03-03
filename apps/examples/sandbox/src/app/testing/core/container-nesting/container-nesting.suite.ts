import { TestSuite } from '../shared/types';
import { arrayInsideGroupScenario } from './scenarios/array-inside-group.scenario';
import { groupInsideArrayScenario } from './scenarios/group-inside-array.scenario';
import { rowInsideArrayScenario } from './scenarios/row-inside-array.scenario';
import { deeplyNestedScenario } from './scenarios/deeply-nested.scenario';

/**
 * Container Nesting Suite
 * Tests cross-container nesting interactions with deeply nested structures.
 * Verifies that group, array, and row containers work correctly when
 * nested inside each other.
 */
export const containerNestingSuite: TestSuite = {
  id: 'container-nesting',
  title: 'Container Nesting Tests',
  description: 'Test scenarios for cross-container nesting interactions',
  path: '/test/container-nesting',
  scenarios: [arrayInsideGroupScenario, groupInsideArrayScenario, rowInsideArrayScenario, deeplyNestedScenario],
};

/**
 * Get a scenario by its testId
 */
export function getContainerNestingScenario(testId: string) {
  return containerNestingSuite.scenarios.find((s) => s.testId === testId);
}

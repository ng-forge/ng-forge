import { TestSuite } from '../shared/types';
import { rowBasicLayoutScenario } from './scenarios/row-basic-layout.scenario';
import { rowContainingGroupScenario } from './scenarios/row-containing-group.scenario';

/**
 * Row Fields Suite
 * Tests various row field operations including horizontal layout
 * and nested containers.
 */
export const rowFieldsSuite: TestSuite = {
  id: 'row-fields',
  title: 'Row Fields Tests',
  description: 'Test scenarios for row field container operations',
  path: '/test/row-fields',
  scenarios: [
    // Basic Layout
    rowBasicLayoutScenario,

    // Nested Containers
    rowContainingGroupScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getRowFieldsScenario(testId: string) {
  return rowFieldsSuite.scenarios.find((s) => s.testId === testId);
}

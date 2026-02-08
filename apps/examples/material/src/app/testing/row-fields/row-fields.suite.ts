import { TestSuite } from '../shared/types';
import { rowBasicLayoutScenario } from './scenarios/row-basic-layout.scenario';
import { rowConditionalVisibilityScenario } from './scenarios/row-conditional-visibility.scenario';
import { rowContainingGroupScenario } from './scenarios/row-containing-group.scenario';
import { rowConditionalFieldsScenario } from './scenarios/row-conditional-fields.scenario';
import { rowMultipleVisibilityScenario } from './scenarios/row-multiple-visibility.scenario';
import { rowStatePreservationScenario } from './scenarios/row-state-preservation.scenario';

/**
 * Row Fields Suite
 * Tests various row field operations including horizontal layout,
 * conditional visibility, nested containers, and state preservation.
 */
export const rowFieldsSuite: TestSuite = {
  id: 'row-fields',
  title: 'Row Fields Tests',
  description: 'Test scenarios for row field container operations',
  path: '/test/row-fields',
  scenarios: [
    // Basic Layout
    rowBasicLayoutScenario,

    // Conditional Visibility
    rowConditionalVisibilityScenario,
    rowMultipleVisibilityScenario,

    // Nested Containers
    rowContainingGroupScenario,
    rowConditionalFieldsScenario,

    // State Management
    rowStatePreservationScenario,
  ],
};

/**
 * Get a scenario by its testId
 */
export function getRowFieldsScenario(testId: string) {
  return rowFieldsSuite.scenarios.find((s) => s.testId === testId);
}

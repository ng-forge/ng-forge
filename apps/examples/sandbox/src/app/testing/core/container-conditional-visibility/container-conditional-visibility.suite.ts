import { TestSuite } from '../shared/types';
import { groupConditionalVisibilityScenario } from './scenarios/group-conditional-visibility.scenario';
import { groupNestedConditionalScenario } from './scenarios/group-nested-conditional.scenario';
import { groupStatePreservationScenario } from './scenarios/group-state-preservation.scenario';
import { rowConditionalVisibilityScenario } from './scenarios/row-conditional-visibility.scenario';
import { rowMultipleVisibilityScenario } from './scenarios/row-multiple-visibility.scenario';
import { rowStatePreservationScenario } from './scenarios/row-state-preservation.scenario';
import { rowConditionalFieldsScenario } from './scenarios/row-conditional-fields.scenario';
import { arrayConditionalVisibilityScenario } from './scenarios/array-conditional-visibility.scenario';
import { arrayStatePreservationScenario } from './scenarios/array-state-preservation.scenario';
import { arrayItemsConditionalFieldsScenario } from './scenarios/array-items-conditional-fields.scenario';
import { submitConditionalContainersScenario } from './scenarios/submit-conditional-containers.scenario';
import { groupHiddenLogicScenario } from './scenarios/group-hidden-logic.scenario';
import { rowHiddenLogicScenario } from './scenarios/row-hidden-logic.scenario';
import { arrayHiddenLogicScenario } from './scenarios/array-hidden-logic.scenario';
import { containerLevelSubmissionScenario } from './scenarios/container-level-submission.scenario';

export const containerConditionalVisibilitySuite: TestSuite = {
  id: 'container-conditional-visibility',
  title: 'Container Conditional Visibility',
  description: 'Testing conditional visibility for fields inside containers and container-level hidden logic',
  path: '/test/container-conditional-visibility',
  scenarios: [
    // Child field visibility
    groupConditionalVisibilityScenario,
    groupNestedConditionalScenario,
    groupStatePreservationScenario,
    rowConditionalVisibilityScenario,
    rowMultipleVisibilityScenario,
    rowStatePreservationScenario,
    rowConditionalFieldsScenario,
    arrayConditionalVisibilityScenario,
    arrayStatePreservationScenario,
    arrayItemsConditionalFieldsScenario,
    submitConditionalContainersScenario,
    // Container-level hidden logic
    groupHiddenLogicScenario,
    rowHiddenLogicScenario,
    arrayHiddenLogicScenario,
    containerLevelSubmissionScenario,
  ],
};

export function getContainerConditionalVisibilityScenario(testId: string) {
  return containerConditionalVisibilitySuite.scenarios.find((s) => s.testId === testId);
}

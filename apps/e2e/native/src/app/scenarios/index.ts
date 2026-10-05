import type { TestSuite } from '../types';
import { arrayFieldsSuite } from './array-fields';
import { conditionalLogicSuite } from './conditional-logic';
import { groupFieldsSuite } from './group-fields';
import { layoutSuite } from './layout';
import { selectionFieldsSuite } from './selection-fields';
import { submissionBehaviorSuite } from './submission-behavior';

export const SUITES: TestSuite[] = [
  groupFieldsSuite,
  arrayFieldsSuite,
  submissionBehaviorSuite,
  conditionalLogicSuite,
  selectionFieldsSuite,
  layoutSuite,
];

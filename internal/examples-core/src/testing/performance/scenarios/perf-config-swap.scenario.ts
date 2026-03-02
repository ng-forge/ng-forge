import { FormConfig } from '@ng-forge/dynamic-forms';
import { TestScenario } from '../../shared/types';
import { generateFlatFields, generateMixedFields } from '../utils/config-generators';

/**
 * Two large configs (100 fields each) for testing config swap performance.
 * configA: 100 flat input fields
 * configB: 100 mixed field types
 */
const configA = generateFlatFields(100);
const configB = generateMixedFields(100);

export const perfConfigSwapConfigVariants: Record<string, FormConfig> = {
  initial: configA,
  alternate: configB,
};

export const perfConfigSwapScenario: TestScenario = {
  testId: 'perf-config-swap',
  title: 'Config Swap (100 fields)',
  description: 'Swap between two 100-field configs multiple times and measure transition time',
  config: configA,
};

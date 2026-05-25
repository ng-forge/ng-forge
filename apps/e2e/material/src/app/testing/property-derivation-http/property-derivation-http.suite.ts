import { TestSuite } from '../shared/types';
import { httpDrivenSelectOptionsScenario } from './scenarios/http-driven-select-options.scenario';

/**
 * HTTP-driven property derivation suite. Each scenario exercises a field
 * config that derives a component property (`options`, `placeholder`, etc.)
 * from an HTTP endpoint as the user interacts with a dependency field.
 */
export const propertyDerivationHttpSuite: TestSuite = {
  id: 'property-derivation-http',
  title: 'Property Derivation — HTTP source',
  description: 'Scenarios exercising HTTP-driven property derivations (targetProperty + source: "http").',
  path: '/test/property-derivation-http',
  scenarios: [httpDrivenSelectOptionsScenario],
};

export function getPropertyDerivationHttpScenario(testId: string) {
  return propertyDerivationHttpSuite.scenarios.find((s) => s.testId === testId)!;
}

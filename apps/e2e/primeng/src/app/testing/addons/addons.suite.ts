import { TestSuite } from '../shared/types';
import { clearButtonScenario } from './scenarios/clear-button.scenario';
import { iconPrefixScenario } from './scenarios/icon-prefix.scenario';
import { passwordToggleScenario } from './scenarios/password-toggle.scenario';
import { textCurrencyScenario } from './scenarios/text-currency.scenario';

export const addonsSuite: TestSuite = {
  id: 'addons',
  title: 'Addons',
  description: 'Prefix / suffix addon kinds on prime-input — pi-icon, pi-button, text, presets.',
  path: '/test/addons',
  scenarios: [iconPrefixScenario, clearButtonScenario, textCurrencyScenario, passwordToggleScenario],
};

export function getAddonsScenario(testId: string) {
  return addonsSuite.scenarios.find((s) => s.testId === testId);
}

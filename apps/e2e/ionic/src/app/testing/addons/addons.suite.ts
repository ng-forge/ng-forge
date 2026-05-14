import { TestSuite } from '../shared/types';
import { actionRefScenario } from './scenarios/action-ref.scenario';
import { clearButtonScenario } from './scenarios/clear-button.scenario';
import { decorativeButtonScenario } from './scenarios/decorative-button.scenario';
import { disabledAddonScenario } from './scenarios/disabled-addon.scenario';
import { iconPrefixScenario } from './scenarios/icon-prefix.scenario';
import { inlineActionScenario } from './scenarios/inline-action.scenario';
import { labelledButtonScenario } from './scenarios/labelled-button.scenario';
import { multiAddonsScenario } from './scenarios/multi-addons.scenario';
import { passwordToggleScenario } from './scenarios/password-toggle.scenario';
import { resetPresetScenario } from './scenarios/reset-preset.scenario';
import { severityVariantsScenario } from './scenarios/severity-variants.scenario';
import { textCurrencyScenario } from './scenarios/text-currency.scenario';

export const addonsSuite: TestSuite = {
  id: 'addons',
  title: 'Addons',
  description: 'Prefix / suffix addon kinds on ion-input — ion-icon, ion-button, text, presets.',
  path: '/testing/addons',
  scenarios: [
    iconPrefixScenario,
    clearButtonScenario,
    textCurrencyScenario,
    passwordToggleScenario,
    multiAddonsScenario,
    severityVariantsScenario,
    labelledButtonScenario,
    disabledAddonScenario,
    resetPresetScenario,
    decorativeButtonScenario,
    inlineActionScenario,
    actionRefScenario,
  ],
};

export function getAddonsScenario(testId: string) {
  const scenario = addonsSuite.scenarios.find((s) => s.testId === testId);
  if (!scenario) {
    const known = addonsSuite.scenarios.map((s) => s.testId).join(', ');
    throw new Error(`Unknown addons scenario id '${testId}'. Known: ${known}.`);
  }
  return scenario;
}

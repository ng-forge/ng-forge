export { inputScenario } from './input.scenario';
export { checkboxScenario } from './checkbox.scenario';
export { selectScenario } from './select.scenario';
export { toggleScenario } from './toggle.scenario';
export { radioScenario } from './radio.scenario';
export { multiCheckboxScenario } from './multi-checkbox.scenario';
export { textareaScenario } from './textarea.scenario';
export { datepickerScenario } from './datepicker.scenario';
export { sliderScenario } from './slider.scenario';
export { buttonScenario } from './button.scenario';
export { completeFormScenario } from './complete-form.scenario';
export { defaultPropsScenario } from './default-props.scenario';

import { ExampleScenario } from '../shared/types';
import { inputScenario } from './input.scenario';
import { checkboxScenario } from './checkbox.scenario';
import { selectScenario } from './select.scenario';
import { toggleScenario } from './toggle.scenario';
import { radioScenario } from './radio.scenario';
import { multiCheckboxScenario } from './multi-checkbox.scenario';
import { textareaScenario } from './textarea.scenario';
import { datepickerScenario } from './datepicker.scenario';
import { sliderScenario } from './slider.scenario';
import { buttonScenario } from './button.scenario';
import { completeFormScenario } from './complete-form.scenario';
import { defaultPropsScenario } from './default-props.scenario';

export const ALL_SCENARIOS: ExampleScenario[] = [
  inputScenario,
  checkboxScenario,
  selectScenario,
  toggleScenario,
  radioScenario,
  multiCheckboxScenario,
  textareaScenario,
  datepickerScenario,
  sliderScenario,
  buttonScenario,
  completeFormScenario,
  defaultPropsScenario,
];

export function getScenarioById(id: string): ExampleScenario | undefined {
  return ALL_SCENARIOS.find((scenario) => scenario.id === id);
}

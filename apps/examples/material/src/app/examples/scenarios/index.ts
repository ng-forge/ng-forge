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
export { userRegistrationScenario } from './user-registration.scenario';
export { loginScenario } from './login.scenario';
export { heroDemoScenario } from './hero-demo.scenario';
export { paginatedFormScenario } from './paginated-form.scenario';
export { groupScenario } from './group.scenario';
export { rowScenario } from './row.scenario';
export { arrayScenario, AddTagsEvent, AddContactEvent } from './array.scenario';
export { validationShowcaseScenario } from './validation-showcase.scenario';

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
import { userRegistrationScenario } from './user-registration.scenario';
import { loginScenario } from './login.scenario';
import { heroDemoScenario } from './hero-demo.scenario';
import { paginatedFormScenario } from './paginated-form.scenario';
import { groupScenario } from './group.scenario';
import { rowScenario } from './row.scenario';
import { arrayScenario } from './array.scenario';
import { validationShowcaseScenario } from './validation-showcase.scenario';
import { ExampleScenario } from '../shared/types';

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
  userRegistrationScenario,
  loginScenario,
  heroDemoScenario,
  paginatedFormScenario,
  groupScenario,
  rowScenario,
  arrayScenario,
  validationShowcaseScenario,
];

export function getScenarioById(id: string): ExampleScenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}

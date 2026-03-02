import { TestSuite } from '../shared/types';
import { datepickerBasicScenario } from './scenarios/datepicker-basic.scenario';
import { datepickerClearScenario } from './scenarios/datepicker-clear.scenario';
import { datepickerConstraintsScenario } from './scenarios/datepicker-constraints.scenario';
import { datepickerDisabledScenario } from './scenarios/datepicker-disabled.scenario';
import { datepickerInitialValueScenario } from './scenarios/datepicker-initial-value.scenario';
import { datepickerValidationScenario } from './scenarios/datepicker-validation.scenario';
import { multiCheckboxArrayScenario } from './scenarios/multi-checkbox-array.scenario';
import { multiCheckboxBasicScenario } from './scenarios/multi-checkbox-basic.scenario';
import { multiCheckboxDeselectScenario } from './scenarios/multi-checkbox-deselect.scenario';
import { multiCheckboxDisabledOptionsScenario } from './scenarios/multi-checkbox-disabled-options.scenario';
import { multiCheckboxValidationScenario } from './scenarios/multi-checkbox-validation.scenario';
import { sliderBasicScenario } from './scenarios/slider-basic.scenario';
import { sliderBoundsScenario } from './scenarios/slider-bounds.scenario';
import { sliderDisabledScenario } from './scenarios/slider-disabled.scenario';
import { sliderStepsScenario } from './scenarios/slider-steps.scenario';
import { sliderValueDisplayScenario } from './scenarios/slider-value-display.scenario';
import { toggleBasicScenario } from './scenarios/toggle-basic.scenario';
import { toggleDisabledScenario } from './scenarios/toggle-disabled.scenario';
import { toggleKeyboardScenario } from './scenarios/toggle-keyboard.scenario';
import { toggleValidationScenario } from './scenarios/toggle-validation.scenario';

export const bootstrapComponentsSuite: TestSuite = {
  id: 'bootstrap-components',
  title: 'Bootstrap Components',
  description: 'Testing bootstrap-specific components (datepicker, slider, toggle, multi-checkbox)',
  path: '/test/bootstrap-components',
  scenarios: [
    datepickerBasicScenario,
    datepickerClearScenario,
    datepickerConstraintsScenario,
    datepickerDisabledScenario,
    datepickerInitialValueScenario,
    datepickerValidationScenario,
    multiCheckboxBasicScenario,
    multiCheckboxArrayScenario,
    multiCheckboxDeselectScenario,
    multiCheckboxDisabledOptionsScenario,
    multiCheckboxValidationScenario,
    sliderBasicScenario,
    sliderBoundsScenario,
    sliderDisabledScenario,
    sliderStepsScenario,
    sliderValueDisplayScenario,
    toggleBasicScenario,
    toggleDisabledScenario,
    toggleKeyboardScenario,
    toggleValidationScenario,
  ],
};

export function getBootstrapComponentsScenario(testId: string) {
  return bootstrapComponentsSuite.scenarios.find((s) => s.testId === testId);
}

import { TestSuite } from '../shared/types';
import { calendarBasicScenario } from './scenarios/calendar-basic.scenario';
import { calendarButtonBarScenario } from './scenarios/calendar-button-bar.scenario';
import { calendarConstraintsScenario } from './scenarios/calendar-constraints.scenario';
import { calendarDisabledScenario } from './scenarios/calendar-disabled.scenario';
import { calendarFormatScenario } from './scenarios/calendar-format.scenario';
import { calendarInitialValueScenario } from './scenarios/calendar-initial-value.scenario';
import { multiSelectBasicScenario } from './scenarios/multi-select-basic.scenario';
import { multiSelectDisabledScenario } from './scenarios/multi-select-disabled.scenario';
import { multiSelectFilterScenario } from './scenarios/multi-select-filter.scenario';
import { multiSelectInitialValueScenario } from './scenarios/multi-select-initial-value.scenario';
import { sliderBasicScenario } from './scenarios/slider-basic.scenario';
import { sliderBoundsScenario } from './scenarios/slider-bounds.scenario';
import { sliderDisabledScenario } from './scenarios/slider-disabled.scenario';
import { sliderStepsScenario } from './scenarios/slider-steps.scenario';
import { sliderValueDisplayScenario } from './scenarios/slider-value-display.scenario';
import { toggleBasicScenario } from './scenarios/toggle-basic.scenario';
import { toggleDisabledScenario } from './scenarios/toggle-disabled.scenario';
import { toggleInitialValueScenario } from './scenarios/toggle-initial-value.scenario';
import { toggleLabelScenario } from './scenarios/toggle-label.scenario';

export const primengComponentsSuite: TestSuite = {
  id: 'primeng-components',
  title: 'PrimeNG Components',
  description: 'Testing PrimeNG-specific components (calendar, slider, toggle, multi-select)',
  path: '/test/primeng-components',
  scenarios: [
    calendarBasicScenario,
    calendarConstraintsScenario,
    calendarFormatScenario,
    calendarDisabledScenario,
    calendarInitialValueScenario,
    calendarButtonBarScenario,
    sliderBasicScenario,
    sliderBoundsScenario,
    sliderStepsScenario,
    sliderDisabledScenario,
    sliderValueDisplayScenario,
    toggleBasicScenario,
    toggleDisabledScenario,
    toggleLabelScenario,
    toggleInitialValueScenario,
    multiSelectBasicScenario,
    multiSelectFilterScenario,
    multiSelectInitialValueScenario,
    multiSelectDisabledScenario,
  ],
};

export function getPrimengComponentsScenario(testId: string) {
  return primengComponentsSuite.scenarios.find((s) => s.testId === testId);
}

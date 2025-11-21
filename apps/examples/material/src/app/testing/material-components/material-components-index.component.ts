import { Component } from '@angular/core';
import { DatepickerBasicComponent } from './datepicker-basic.component';
import { DatepickerClearComponent } from './datepicker-clear.component';
import { DatepickerConstraintsComponent } from './datepicker-constraints.component';
import { DatepickerDisabledComponent } from './datepicker-disabled.component';
import { DatepickerInitialValueComponent } from './datepicker-initial-value.component';
import { DatepickerValidationComponent } from './datepicker-validation.component';
import { MultiCheckboxArrayComponent } from './multi-checkbox-array.component';
import { MultiCheckboxBasicComponent } from './multi-checkbox-basic.component';
import { MultiCheckboxDeselectComponent } from './multi-checkbox-deselect.component';
import { MultiCheckboxDisabledOptionsComponent } from './multi-checkbox-disabled-options.component';
import { MultiCheckboxValidationComponent } from './multi-checkbox-validation.component';
import { SliderBasicComponent } from './slider-basic.component';
import { SliderBoundsComponent } from './slider-bounds.component';
import { SliderDisabledComponent } from './slider-disabled.component';
import { SliderStepsComponent } from './slider-steps.component';
import { SliderValueDisplayComponent } from './slider-value-display.component';
import { ToggleBasicComponent } from './toggle-basic.component';
import { ToggleDisabledComponent } from './toggle-disabled.component';
import { ToggleKeyboardComponent } from './toggle-keyboard.component';
import { ToggleValidationComponent } from './toggle-validation.component';

/**
 * Material Components Index Component
 * Renders all test scenarios on a single page for E2E testing
 */
@Component({
  selector: 'example-material-components-index',
  imports: [
    DatepickerBasicComponent,
    DatepickerClearComponent,
    DatepickerConstraintsComponent,
    DatepickerDisabledComponent,
    DatepickerInitialValueComponent,
    DatepickerValidationComponent,
    MultiCheckboxArrayComponent,
    MultiCheckboxBasicComponent,
    MultiCheckboxDeselectComponent,
    MultiCheckboxDisabledOptionsComponent,
    MultiCheckboxValidationComponent,
    SliderBasicComponent,
    SliderBoundsComponent,
    SliderDisabledComponent,
    SliderStepsComponent,
    SliderValueDisplayComponent,
    ToggleBasicComponent,
    ToggleDisabledComponent,
    ToggleKeyboardComponent,
    ToggleValidationComponent,
  ],
  template: `
    <div class="test-page-container">
      <h1 class="page-title">Material Components Tests</h1>
      <p class="page-subtitle">All test scenarios</p>

      <div class="test-scenarios">
        <example-datepicker-basic />
        <example-datepicker-clear />
        <example-datepicker-constraints />
        <example-datepicker-disabled />
        <example-datepicker-initial-value />
        <example-datepicker-validation />
        <example-multi-checkbox-array />
        <example-multi-checkbox-basic />
        <example-multi-checkbox-deselect />
        <example-multi-checkbox-disabled-options />
        <example-multi-checkbox-validation />
        <example-slider-basic />
        <example-slider-bounds />
        <example-slider-disabled />
        <example-slider-steps />
        <example-slider-value-display />
        <example-toggle-basic />
        <example-toggle-disabled />
        <example-toggle-keyboard />
        <example-toggle-validation />
      </div>
    </div>
  `,
  styles: [
    `
      .test-page-container {
        padding: 2rem;
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-title {
        color: #1976d2;
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        color: #666;
        font-size: 1.1rem;
        margin-bottom: 2rem;
      }

      .test-scenarios {
        display: flex;
        flex-direction: column;
        gap: 2rem;
      }
    `,
  ],
})
export class MaterialComponentsIndexComponent {}

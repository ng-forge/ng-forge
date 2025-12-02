import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../ng-doc.category';
import { InputDemoComponent } from './examples/input-demo.component';
import { SelectDemoComponent } from './examples/select-demo.component';
import { CheckboxDemoComponent } from './examples/checkbox-demo.component';
import { ToggleDemoComponent } from './examples/toggle-demo.component';
import { ButtonDemoComponent } from './examples/button-demo.component';
import { TextareaDemoComponent } from './examples/textarea-demo.component';
import { RadioDemoComponent } from './examples/radio-demo.component';
import { MultiCheckboxDemoComponent } from './examples/multi-checkbox-demo.component';
import { DatepickerDemoComponent } from './examples/datepicker-demo.component';
import { SliderDemoComponent } from './examples/slider-demo.component';
import { CompleteFormDemoComponent } from './examples/complete-form-demo.component';
import { UserRegistrationDemoComponent } from './examples/user-registration-demo.component';

/**
 * @status:warning PREVIEW
 */
const BootstrapPage: NgDocPage = {
  title: 'Bootstrap',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 2,
  demos: {
    InputDemoComponent,
    SelectDemoComponent,
    CheckboxDemoComponent,
    ToggleDemoComponent,
    ButtonDemoComponent,
    TextareaDemoComponent,
    RadioDemoComponent,
    MultiCheckboxDemoComponent,
    DatepickerDemoComponent,
    SliderDemoComponent,
    CompleteFormDemoComponent,
    UserRegistrationDemoComponent,
  },
};

export default BootstrapPage;

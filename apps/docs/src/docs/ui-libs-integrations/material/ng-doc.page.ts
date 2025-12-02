import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../ng-doc.category';
import { CompleteFormDemoComponent } from './examples/complete-form-demo.component';
import { InputDemoComponent } from './examples/input-demo.component';
import { TextareaDemoComponent } from './examples/textarea-demo.component';
import { SelectDemoComponent } from './examples/select-demo.component';
import { RadioDemoComponent } from './examples/radio-demo.component';
import { CheckboxDemoComponent } from './examples/checkbox-demo.component';
import { MultiCheckboxDemoComponent } from './examples/multi-checkbox-demo.component';
import { ToggleDemoComponent } from './examples/toggle-demo.component';
import { SliderDemoComponent } from './examples/slider-demo.component';
import { DatepickerDemoComponent } from './examples/datepicker-demo.component';
import { ButtonDemoComponent } from './examples/button-demo.component';

/**
 * @status:warning PREVIEW
 */
const MaterialPage: NgDocPage = {
  title: 'Material Design',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 1,
  demos: {
    CompleteFormDemoComponent,
    InputDemoComponent,
    TextareaDemoComponent,
    SelectDemoComponent,
    RadioDemoComponent,
    CheckboxDemoComponent,
    MultiCheckboxDemoComponent,
    ToggleDemoComponent,
    SliderDemoComponent,
    DatepickerDemoComponent,
    ButtonDemoComponent,
  },
};

export default MaterialPage;

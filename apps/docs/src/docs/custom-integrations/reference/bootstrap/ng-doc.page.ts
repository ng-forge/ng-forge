import { NgDocPage } from '@ng-doc/core';
import CustomIntegrationsCategory from '../../ng-doc.category';

// Individual field demos
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

// Comprehensive example
import { CompleteFormDemoComponent } from './examples/complete-form-demo.component';

const BootstrapPage: NgDocPage = {
  title: 'Bootstrap',
  mdFile: './index.md',
  category: CustomIntegrationsCategory,
  order: 3,
  demos: {
    // Individual field type demos
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

    // Comprehensive example
    CompleteFormDemoComponent,
  },
};

export default BootstrapPage;

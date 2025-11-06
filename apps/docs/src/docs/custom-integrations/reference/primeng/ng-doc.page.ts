import { NgDocPage } from '@ng-doc/core';
import CustomIntegrationsCategory from '../../ng-doc.category';

// Individual field demos
import { InputDemoComponent } from './examples/input-demo.component';
import { SelectDemoComponent } from './examples/select-demo.component';
import { CheckboxDemoComponent } from './examples/checkbox-demo.component';
import { RadioDemoComponent } from './examples/radio-demo.component';
import { MultiCheckboxDemoComponent } from './examples/multi-checkbox-demo.component';
import { ToggleDemoComponent } from './examples/toggle-demo.component';
import { TextareaDemoComponent } from './examples/textarea-demo.component';
import { DatepickerDemoComponent } from './examples/datepicker-demo.component';
import { SliderDemoComponent } from './examples/slider-demo.component';
import { ButtonDemoComponent } from './examples/button-demo.component';
import { CompletePrimeFormComponent } from './examples/complete-prime-form.component';

const PrimeNGPage: NgDocPage = {
  title: 'PrimeNG',
  mdFile: './index.md',
  category: CustomIntegrationsCategory,
  order: 4,
  demos: {
    // Individual field type demos
    InputDemoComponent,
    SelectDemoComponent,
    CheckboxDemoComponent,
    RadioDemoComponent,
    MultiCheckboxDemoComponent,
    ToggleDemoComponent,
    TextareaDemoComponent,
    DatepickerDemoComponent,
    SliderDemoComponent,
    ButtonDemoComponent,
    // Complete form example
    CompletePrimeFormComponent,
  },
};

export default PrimeNGPage;

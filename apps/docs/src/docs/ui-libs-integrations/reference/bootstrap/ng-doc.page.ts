import { NgDocPage } from '@ng-doc/core';
import UiLibsIntegrationCategory from '../../ng-doc.category';
import { InputIframeDemoComponent } from './examples/input-iframe-demo.component';
import { SelectIframeDemoComponent } from './examples/select-iframe-demo.component';
import { CheckboxIframeDemoComponent } from './examples/checkbox-iframe-demo.component';
import { ToggleIframeDemoComponent } from './examples/toggle-iframe-demo.component';
import { ButtonIframeDemoComponent } from './examples/button-iframe-demo.component';
import { TextareaIframeDemoComponent } from './examples/textarea-iframe-demo.component';
import { RadioIframeDemoComponent } from './examples/radio-iframe-demo.component';
import { MultiCheckboxIframeDemoComponent } from './examples/multi-checkbox-iframe-demo.component';
import { DatepickerIframeDemoComponent } from './examples/datepicker-iframe-demo.component';
import { SliderIframeDemoComponent } from './examples/slider-iframe-demo.component';
import { CompleteFormIframeDemoComponent } from './examples/complete-form-iframe-demo.component';
import { UserRegistrationIframeDemoComponent } from './examples/user-registration-iframe-demo.component';

const BootstrapPage: NgDocPage = {
  title: 'Bootstrap',
  mdFile: './index.md',
  category: UiLibsIntegrationCategory,
  order: 2,
  demos: {
    InputIframeDemoComponent,
    SelectIframeDemoComponent,
    CheckboxIframeDemoComponent,
    ToggleIframeDemoComponent,
    ButtonIframeDemoComponent,
    TextareaIframeDemoComponent,
    RadioIframeDemoComponent,
    MultiCheckboxIframeDemoComponent,
    DatepickerIframeDemoComponent,
    SliderIframeDemoComponent,
    CompleteFormIframeDemoComponent,
    UserRegistrationIframeDemoComponent,
  },
};

export default BootstrapPage;

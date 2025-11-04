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
import { SubmitDemoComponent } from './examples/submit-demo.component';

// Comprehensive examples
import { MaterialFieldTypesComponent } from './examples/material-field-types.component';
import { MaterialThemingComponent } from './examples/material-theming.component';
import { MaterialValidationComponent } from './examples/material-validation.component';
import { ControlFieldTypesDemoComponent } from './examples/control-field-types-demo.component';
import { CompleteMaterialFormComponent } from './examples/complete-material-form.component';

const MaterialPage: NgDocPage = {
  title: 'Material Design',
  mdFile: './index.md',
  category: CustomIntegrationsCategory,
  order: 2,
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
    SubmitDemoComponent,

    // Comprehensive examples
    MaterialFieldTypesComponent,
    MaterialThemingComponent,
    MaterialValidationComponent,
    ControlFieldTypesDemoComponent,
    CompleteMaterialFormComponent,
  },
};

export default MaterialPage;

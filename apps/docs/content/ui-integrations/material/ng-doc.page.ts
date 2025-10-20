import { NgDocPage } from '@ng-doc/core';
import { CompleteMaterialFormComponent } from '../../../src/app/components/material/complete-material-form.component';
import { MaterialFieldTypesComponent } from '../../../src/app/components/material/material-field-types.component';
import { MaterialThemingComponent } from '../../../src/app/components/material/material-theming.component';
import { MaterialValidationComponent } from '../../../src/app/components/material/material-validation.component';
import { ControlFieldTypesDemoComponent } from '../../../src/app/components/material/control-field-types-demo.component';

// Individual field demos
import { InputDemoComponent } from '../../../src/app/components/material/demos/input-demo.component';
import { SelectDemoComponent } from '../../../src/app/components/material/demos/select-demo.component';
import { CheckboxDemoComponent } from '../../../src/app/components/material/demos/checkbox-demo.component';
import { RadioDemoComponent } from '../../../src/app/components/material/demos/radio-demo.component';
import { MultiCheckboxDemoComponent } from '../../../src/app/components/material/demos/multi-checkbox-demo.component';
import { ToggleDemoComponent } from '../../../src/app/components/material/demos/toggle-demo.component';
import { TextareaDemoComponent } from '../../../src/app/components/material/demos/textarea-demo.component';
import { DatepickerDemoComponent } from '../../../src/app/components/material/demos/datepicker-demo.component';
import { SliderDemoComponent } from '../../../src/app/components/material/demos/slider-demo.component';
import { SubmitDemoComponent } from '../../../src/app/components/material/demos/submit-demo.component';

import UIIntegrationsCategory from '../ng-doc.category';

const MaterialPage: NgDocPage = {
  title: 'Material',
  mdFile: './index.md',
  order: 1,
  category: UIIntegrationsCategory,
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

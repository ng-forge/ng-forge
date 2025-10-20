import { NgDocPage } from '@ng-doc/core';
import { MaterialExampleComponent } from '../../src/app/examples/material-example.component';
import { MaterialSelectExampleComponent } from '../../src/app/examples/material-select-example.component';
import { MaterialCheckboxExampleComponent } from '../../src/app/examples/material-checkbox-example.component';
import { CompleteMaterialFormComponent } from '../../src/app/examples/complete-material-form.component';

const MaterialPage: NgDocPage = {
  title: 'Material Design',
  mdFile: './index.md',
  order: 3,
  playgrounds: {
    MaterialExample: {
      target: MaterialExampleComponent,
      template: `<material-example></material-example>`
    },
    MaterialSelectExample: {
      target: MaterialSelectExampleComponent,
      template: `<material-select-example></material-select-example>`
    },
    MaterialCheckboxExample: {
      target: MaterialCheckboxExampleComponent,
      template: `<material-checkbox-example></material-checkbox-example>`
    },
    CompleteMaterialForm: {
      target: CompleteMaterialFormComponent,
      template: `<complete-material-form></complete-material-form>`
    }
  }
};

export default MaterialPage;
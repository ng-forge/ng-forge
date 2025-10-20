import { NgDocPage } from '@ng-doc/core';
import { MaterialExampleComponent } from '../../../src/app/components/material/material-example.component';
import { MaterialSelectExampleComponent } from '../../../src/app/components/material/material-select-example.component';
import { MaterialCheckboxExampleComponent } from '../../../src/app/components/material/material-checkbox-example.component';
import { CompleteMaterialFormComponent } from '../../../src/app/components/material/complete-material-form.component';
import UIIntegrationsCategory from '../ng-doc.category';

const MaterialPage: NgDocPage = {
  title: 'Material Design',
  mdFile: './index.md',
  order: 1,
  category: UIIntegrationsCategory,
  playgrounds: {
    MaterialExample: {
      target: MaterialExampleComponent,
      template: `<app-material-example></app-material-example>`,
    },
    MaterialSelectExample: {
      target: MaterialSelectExampleComponent,
      template: `<app-material-select-example></app-material-select-example>`,
    },
    MaterialCheckboxExample: {
      target: MaterialCheckboxExampleComponent,
      template: `<app-material-checkbox-example></app-material-checkbox-example>`,
    },
    CompleteMaterialForm: {
      target: CompleteMaterialFormComponent,
      template: `<app-complete-material-form></app-complete-material-form>`,
    },
  },
};

export default MaterialPage;

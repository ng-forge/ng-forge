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
      template: `<material-example />`
    },
    MaterialSelectExample: {
      target: MaterialSelectExampleComponent,
      template: `<material-select-example />`
    },
    MaterialCheckboxExample: {
      target: MaterialCheckboxExampleComponent,
      template: `<material-checkbox-example />`
    },
    CompleteMaterialForm: {
      target: CompleteMaterialFormComponent,
      template: `<complete-material-form />`
    }
  }
};

export default MaterialPage;

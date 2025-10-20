import { NgDocPage } from '@ng-doc/core';
import { InputExampleComponent } from '../../src/app/components/core/input-example.component';
import { SelectExampleComponent } from '../../src/app/components/core/select-example.component';
import { CheckboxExampleComponent } from '../../src/app/components/core/checkbox-example.component';

const FieldTypesPage: NgDocPage = {
  title: 'Field Types',
  mdFile: './index.md',
  order: 2,
  playgrounds: {
    InputExample: {
      target: InputExampleComponent,
      template: `<input-example></input-example>`
    },
    SelectExample: {
      target: SelectExampleComponent,
      template: `<select-example></select-example>`
    },
    CheckboxExample: {
      target: CheckboxExampleComponent,
      template: `<checkbox-example></checkbox-example>`
    }
  }
};

export default FieldTypesPage;
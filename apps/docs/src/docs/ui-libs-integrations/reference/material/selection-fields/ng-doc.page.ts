import { NgDocPage } from '@ng-doc/core';
import MaterialCategory from '../ng-doc.category';
import { SelectIframeDemoComponent } from '../examples/select-iframe-demo.component';
import { RadioIframeDemoComponent } from '../examples/radio-iframe-demo.component';
import { CheckboxIframeDemoComponent } from '../examples/checkbox-iframe-demo.component';
import { MultiCheckboxIframeDemoComponent } from '../examples/multi-checkbox-iframe-demo.component';

const SelectionFieldsPage: NgDocPage = {
  title: 'Selection Fields',
  mdFile: './index.md',
  category: MaterialCategory,
  order: 20,
  demos: {
    SelectIframeDemoComponent,
    RadioIframeDemoComponent,
    CheckboxIframeDemoComponent,
    MultiCheckboxIframeDemoComponent,
  },
};

export default SelectionFieldsPage;

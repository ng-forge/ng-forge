import { NgDocPage } from '@ng-doc/core';
import MaterialCategory from '../ng-doc.category';
import { InputIframeDemoComponent } from '../examples/input-iframe-demo.component';
import { TextareaIframeDemoComponent } from '../examples/textarea-iframe-demo.component';

const TextInputsPage: NgDocPage = {
  title: 'Text Input Fields',
  mdFile: './index.md',
  category: MaterialCategory,
  order: 10,
  demos: { InputIframeDemoComponent, TextareaIframeDemoComponent },
};

export default TextInputsPage;

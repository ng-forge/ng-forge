import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ValueDerivationIframeDemoComponent } from './value-derivation-iframe-demo.component';

const ValueDerivationExamplePage: NgDocPage = {
  title: 'Value Derivation',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 7,
  demos: {
    ValueDerivationDemoComponent: ValueDerivationIframeDemoComponent,
  },
};

export default ValueDerivationExamplePage;

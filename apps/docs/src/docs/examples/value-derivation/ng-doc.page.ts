import { NgDocPage } from '@ng-doc/core';
import { ValueDerivationIframeDemoComponent } from './value-derivation-iframe-demo.component';

const ValueDerivationExamplePage: NgDocPage = {
  title: 'Value Derivation',
  mdFile: './index.md',
  route: 'examples/value-derivation',
  hidden: true,
  demos: {
    ValueDerivationDemoComponent: ValueDerivationIframeDemoComponent,
  },
};

export default ValueDerivationExamplePage;

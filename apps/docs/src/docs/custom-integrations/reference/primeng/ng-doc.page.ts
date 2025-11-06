import { NgDocPage } from '@ng-doc/core';
import CustomIntegrationsCategory from '../../ng-doc.category';

// Individual field demos
import { InputDemoComponent } from './examples/input-demo.component';

const PrimeNGPage: NgDocPage = {
  title: 'PrimeNG',
  mdFile: './index.md',
  category: CustomIntegrationsCategory,
  order: 4,
  demos: {
    // Individual field type demos
    InputDemoComponent,
  },
};

export default PrimeNGPage;

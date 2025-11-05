import { NgDocPage } from '@ng-doc/core';
import { QuickStartDemoComponent } from '../examples/quick-start-demo.component';
import GettingStartedCategory from '../ng-doc.category';

const WhatIsDynamicFormsPage: NgDocPage = {
  title: 'What is Dynamic Forms?',
  mdFile: './index.md',
  order: 0,
  category: GettingStartedCategory,
  playgrounds: {
    DemoFormPlayground: {
      target: QuickStartDemoComponent,
      template: `<app-quick-start-demo />`,
    },
  },
};

export default WhatIsDynamicFormsPage;

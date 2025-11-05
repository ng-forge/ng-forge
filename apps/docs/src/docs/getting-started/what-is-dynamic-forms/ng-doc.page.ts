import { NgDocPage } from '@ng-doc/core';
import { QuickStartDemoComponent } from '../examples/quick-start-demo.component';

const WhatIsDynamicFormsPage: NgDocPage = {
  title: 'What is Dynamic Forms?',
  mdFile: './index.md',
  order: 0,
  playgrounds: {
    DemoFormPlayground: {
      target: QuickStartDemoComponent,
      template: `<app-quick-start-demo />`,
    },
  },
};

export default WhatIsDynamicFormsPage;

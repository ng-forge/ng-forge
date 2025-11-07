import { NgDocPage } from '@ng-doc/core';
import { DemoFormPlayground } from './demo-form-playground.component';
import GettingStartedCategory from '../ng-doc.category';

const WhatIsDynamicFormsPage: NgDocPage = {
  title: 'What is Dynamic Forms?',
  mdFile: './index.md',
  order: 0,
  category: GettingStartedCategory,
  playgrounds: {
    DemoFormPlayground: {
      target: DemoFormPlayground,
      template: `<demo-form-playground />`,
    },
  },
};

export default WhatIsDynamicFormsPage;

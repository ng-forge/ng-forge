import { NgDocPage } from '@ng-doc/core';
import { DemoFormPlayground } from './demo-form-playground.component';

const WhatIsDynamicFormsPage: NgDocPage = {
  title: 'What is Dynamic Forms?',
  mdFile: './index.md',
  order: 0,
  demos: {
    DemoFormPlayground: DemoFormPlayground,
  },
};

export default WhatIsDynamicFormsPage;

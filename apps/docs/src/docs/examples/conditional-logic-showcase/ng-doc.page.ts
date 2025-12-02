import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ConditionalLogicShowcaseDemoComponent } from './conditional-logic-showcase-demo.component';

const ConditionalLogicShowcasePage: NgDocPage = {
  title: 'Conditional Logic Showcase',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 5,
  demos: {
    ConditionalLogicShowcaseDemoComponent: ConditionalLogicShowcaseDemoComponent,
  },
};

export default ConditionalLogicShowcasePage;

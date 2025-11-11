import { NgDocPage } from '@ng-doc/core';
import ExamplesCategory from '../ng-doc.category';
import { ConditionalLogicShowcaseIframeDemoComponent } from './conditional-logic-showcase-iframe-demo.component';

const ConditionalLogicShowcasePage: NgDocPage = {
  title: 'Conditional Logic Showcase',
  mdFile: './index.md',
  category: ExamplesCategory,
  order: 5,
  keyword: 'ConditionalLogicShowcaseExample',
  demos: {
    ConditionalLogicShowcaseDemoComponent: ConditionalLogicShowcaseIframeDemoComponent,
  },
};

export default ConditionalLogicShowcasePage;

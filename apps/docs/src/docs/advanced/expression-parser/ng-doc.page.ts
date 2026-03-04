import { NgDocPage } from '@ng-doc/core';
import AdvancedCategory from '../ng-doc.category';
import InstallationPage from '../../installation/ng-doc.page';
import ConditionalLogicPage from '../../dynamic-behavior/conditional-logic/overview/ng-doc.page';

const ExpressionParserPage: NgDocPage = {
  title: 'Expression Parser Security',
  mdFile: './index.md',
  category: AdvancedCategory,
  order: 3,
  prerequisites: [InstallationPage, ConditionalLogicPage],
  related: [],
};

export default ExpressionParserPage;

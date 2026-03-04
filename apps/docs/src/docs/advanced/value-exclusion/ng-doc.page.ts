import { NgDocPage } from '@ng-doc/core';
import RecipesCategory from '../ng-doc.category';
import InstallationPage from '../../installation/ng-doc.page';
import ConditionalLogicPage from '../../dynamic-behavior/conditional-logic/overview/ng-doc.page';

const ValueExclusionPage: NgDocPage = {
  title: 'Value Exclusion',
  mdFile: './index.md',
  category: RecipesCategory,
  order: 5,
  prerequisites: [InstallationPage, ConditionalLogicPage],
  related: [],
};

export default ValueExclusionPage;

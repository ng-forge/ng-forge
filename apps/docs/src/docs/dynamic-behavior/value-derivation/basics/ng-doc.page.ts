import { NgDocPage } from '@ng-doc/core';
import DynamicBehaviorCategory from '../../ng-doc.category';
import ConditionalLogicPage from '../../conditional-logic/overview/ng-doc.page';

const DerivationPage: NgDocPage = {
  title: 'Derivation',
  mdFile: ['./index.md', './property-derivation.md', './async-derivation.md'],
  category: DynamicBehaviorCategory,
  route: 'derivation',
  order: 2,
  prerequisites: [ConditionalLogicPage],
  related: [],
};

export default DerivationPage;

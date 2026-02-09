import { NgDocPage } from '@ng-doc/core';
import DynamicBehaviorCategory from '../../ng-doc.category';

const DerivationPage: NgDocPage = {
  title: 'Derivation',
  mdFile: ['./index.md', './property-derivation.md'],
  category: DynamicBehaviorCategory,
  route: 'derivation',
  order: 2,
};

export default DerivationPage;

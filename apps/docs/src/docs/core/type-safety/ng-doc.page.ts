import { NgDocPage } from '@ng-doc/core';
import CoreCategory from '../ng-doc.category';

const TypeSafetyPage: NgDocPage = {
  title: 'Type Safety',
  mdFile: ['./basics.md', './containers.md', './advanced-types.md'],
  category: CoreCategory,
  order: 4,
};

export default TypeSafetyPage;

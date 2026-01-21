import { NgDocPage } from '@ng-doc/core';
import DeepDiveCategory from '../ng-doc.category';

const TypeSafetyPage: NgDocPage = {
  title: 'Type Safety',
  mdFile: ['./basics.md', './containers.md', './advanced-types.md'],
  category: DeepDiveCategory,
  order: 1,
};

export default TypeSafetyPage;

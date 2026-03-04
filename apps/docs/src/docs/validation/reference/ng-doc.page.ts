import { NgDocPage } from '@ng-doc/core';
import ValidationCategory from '../ng-doc.category';
import ValidationBasicsPage from '../basics/ng-doc.page';

const ValidationReferencePage: NgDocPage = {
  title: 'Reference',
  mdFile: './index.md',
  category: ValidationCategory,
  order: 2,
  prerequisites: [ValidationBasicsPage],
};

export default ValidationReferencePage;

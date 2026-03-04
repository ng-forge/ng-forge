import { NgDocPage } from '@ng-doc/core';
import ValidationCategory from '../ng-doc.category';
import ValidationBasicsPage from '../basics/ng-doc.page';
import ValidationCustomValidatorsPage from '../custom-validators/ng-doc.page';
import ValidationReferencePage from '../reference/ng-doc.page';

const ValidationAdvancedPage: NgDocPage = {
  title: 'Advanced',
  mdFile: './index.md',
  category: ValidationCategory,
  order: 3,
  prerequisites: [ValidationBasicsPage],
  related: [ValidationCustomValidatorsPage, ValidationReferencePage],
};

export default ValidationAdvancedPage;

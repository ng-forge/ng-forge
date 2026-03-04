import { NgDocPage } from '@ng-doc/core';
import SchemaValidationCategory from '../ng-doc.category';
import ValidationBasicsPage from '../../validation/basics/ng-doc.page';

const SchemaValidationOverviewPage: NgDocPage = {
  title: 'Overview',
  mdFile: './index.md',
  category: SchemaValidationCategory,
  order: 1,
  prerequisites: [ValidationBasicsPage],
};

export default SchemaValidationOverviewPage;

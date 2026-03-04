import { NgDocPage } from '@ng-doc/core';
import SchemaValidationCategory from '../ng-doc.category';
import ValidationBasicsPage from '../../validation/basics/ng-doc.page';

const AngularSchemaPage: NgDocPage = {
  title: 'Angular Schema',
  mdFile: './index.md',
  category: SchemaValidationCategory,
  order: 2,
  prerequisites: [ValidationBasicsPage],
};

export default AngularSchemaPage;

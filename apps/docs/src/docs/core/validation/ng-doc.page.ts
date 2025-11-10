import { NgDocPage } from '@ng-doc/core';
import CoreCategory from '../ng-doc.category';

const ValidationPage: NgDocPage = {
  title: 'Validation',
  mdFile: ['./basics/index.md', './reference/index.md', './advanced/index.md'],
  category: CoreCategory,
  order: 3,
};

export default ValidationPage;

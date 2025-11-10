import { NgDocPage } from '@ng-doc/core';
import CoreCategory from '../ng-doc.category';

const ValidationPage: NgDocPage = {
  title: 'Validation',
  mdFile: ['./basics.md', './reference.md', './advanced.md'],
  category: CoreCategory,
  order: 2,
};

export default ValidationPage;

import { NgDocPage } from '@ng-doc/core';
import ValidationCategory from '../ng-doc.category';
import GettingStartedPage from '../../installation/ng-doc.page';

const ValidationBasicsPage: NgDocPage = {
  title: 'Basics',
  mdFile: './index.md',
  category: ValidationCategory,
  order: 1,
  prerequisites: [GettingStartedPage],
};

export default ValidationBasicsPage;

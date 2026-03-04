import { NgDocPage } from '@ng-doc/core';
import AdvancedCategory from '../../ng-doc.category';
import InstallationPage from '../../../installation/ng-doc.page';

const TypeSafetyPage: NgDocPage = {
  title: 'Type Safety',
  mdFile: './index.md',
  category: AdvancedCategory,
  order: 1,
  prerequisites: [InstallationPage],
  related: [],
};

export default TypeSafetyPage;

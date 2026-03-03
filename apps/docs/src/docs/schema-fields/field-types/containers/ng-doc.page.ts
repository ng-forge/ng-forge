import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const ContainersPage: NgDocPage = {
  title: 'Containers',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 4,
  imports: [LiveExampleComponent],
};

export default ContainersPage;

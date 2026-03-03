import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const AdvancedControlsPage: NgDocPage = {
  title: 'Advanced Controls',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 3,
  imports: [LiveExampleComponent],
};

export default AdvancedControlsPage;

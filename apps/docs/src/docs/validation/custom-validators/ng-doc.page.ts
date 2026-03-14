import { NgDocPage } from '@ng-doc/core';
import ValidationCategory from '../ng-doc.category';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const ValidationCustomValidatorsPage: NgDocPage = {
  title: 'Custom Validators',
  mdFile: './index.md',
  category: ValidationCategory,
  order: 4,
  imports: [LiveExampleComponent],
};

export default ValidationCustomValidatorsPage;

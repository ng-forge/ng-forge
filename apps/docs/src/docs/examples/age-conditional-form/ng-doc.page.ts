import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const AgeConditionalFormPage: NgDocPage = {
  title: 'Age-Based Form',
  mdFile: './index.md',
  route: 'examples/age-conditional-form',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default AgeConditionalFormPage;

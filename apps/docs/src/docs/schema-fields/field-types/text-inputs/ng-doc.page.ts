import { NgDocPage } from '@ng-doc/core';
import { DocsAdapterPropsComponent } from '../../../../app/components/adapter-props/adapter-props.component';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';
import GettingStartedPage from '../../../installation/ng-doc.page';
import ValidationBasicsPage from '../../../validation/basics/ng-doc.page';

const TextInputsPage: NgDocPage = {
  title: 'Text Inputs',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 1,
  imports: [LiveExampleComponent, DocsAdapterPropsComponent],
  prerequisites: [GettingStartedPage],
  related: [ValidationBasicsPage],
};

export default TextInputsPage;

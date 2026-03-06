import { NgDocPage } from '@ng-doc/core';
import { DocsAdapterPropsComponent } from '../../../../app/components/adapter-props/adapter-props.component';
import { LiveExampleComponent } from '../../../../app/components/live-example/live-example.component';
import FieldTypesCategory from '../ng-doc.category';

const TextInputsPage: NgDocPage = {
  title: 'Text Inputs',
  mdFile: './index.md',
  category: FieldTypesCategory,
  order: 1,
  imports: [LiveExampleComponent, DocsAdapterPropsComponent],
};

export default TextInputsPage;

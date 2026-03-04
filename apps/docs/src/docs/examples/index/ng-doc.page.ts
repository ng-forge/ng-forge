import { NgDocPage } from '@ng-doc/core';
import { ExamplesIndexComponent } from '../../../app/pages/examples-index/examples-index.component';
import InstallationPage from '../../installation/ng-doc.page';
import TextInputsPage from '../../schema-fields/field-types/text-inputs/ng-doc.page';

const ExamplesIndexPage: NgDocPage = {
  title: 'Examples',
  mdFile: './index.md',
  route: 'examples',
  order: 4,
  demos: {
    ExamplesIndexComponent,
  },
  prerequisites: [InstallationPage],
  related: [TextInputsPage],
};

export default ExamplesIndexPage;

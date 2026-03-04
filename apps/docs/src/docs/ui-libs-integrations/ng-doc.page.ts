import { NgDocPage } from '@ng-doc/core';
import { DocsConfigurationViewComponent } from '../../app/components/configuration-view/configuration-view.component';
import GettingStartedPage from '../installation/ng-doc.page';
import TextInputsPage from '../schema-fields/field-types/text-inputs/ng-doc.page';

const IntegrationsPage: NgDocPage = {
  title: 'Configuration',
  route: 'configuration',
  mdFile: './index.md',
  order: 2,
  imports: [DocsConfigurationViewComponent],
  prerequisites: [GettingStartedPage],
  related: [TextInputsPage],
};

export default IntegrationsPage;

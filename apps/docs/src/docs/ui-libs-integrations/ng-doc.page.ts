import { NgDocPage } from '@ng-doc/core';
import { DocsConfigurationViewComponent } from '../../app/components/configuration-view/configuration-view.component';

const IntegrationsPage: NgDocPage = {
  title: 'Configuration',
  route: 'configuration',
  mdFile: './index.md',
  order: 2,
  imports: [DocsConfigurationViewComponent],
};

export default IntegrationsPage;

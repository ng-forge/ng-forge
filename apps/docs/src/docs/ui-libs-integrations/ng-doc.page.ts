import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../app/components/live-example/live-example.component';

const IntegrationsPage: NgDocPage = {
  title: 'UI Library Integrations',
  route: 'ui-libs-integrations',
  mdFile: './index.md',
  order: 3,
  imports: [LiveExampleComponent],
};

export default IntegrationsPage;

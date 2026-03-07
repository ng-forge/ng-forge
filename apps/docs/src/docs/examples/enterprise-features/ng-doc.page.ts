import { NgDocPage } from '@ng-doc/core';
import { LiveExampleComponent } from '../../../app/components/live-example/live-example.component';

const EnterpriseFeaturesPage: NgDocPage = {
  title: 'Enterprise Features Form',
  mdFile: './index.md',
  route: 'examples/enterprise-features',
  hidden: true,
  imports: [LiveExampleComponent],
};

export default EnterpriseFeaturesPage;

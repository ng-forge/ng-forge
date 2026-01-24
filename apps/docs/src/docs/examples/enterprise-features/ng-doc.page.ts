import { NgDocPage } from '@ng-doc/core';
import { EnterpriseFeaturesIframeDemoComponent } from './enterprise-features-iframe-demo.component';

const EnterpriseFeaturesPage: NgDocPage = {
  title: 'Enterprise Features Form',
  mdFile: './index.md',
  route: 'examples/enterprise-features',
  hidden: true,
  demos: {
    EnterpriseFeaturesDemoComponent: EnterpriseFeaturesIframeDemoComponent,
  },
};

export default EnterpriseFeaturesPage;

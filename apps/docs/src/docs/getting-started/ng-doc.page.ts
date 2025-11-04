import { NgDocPage } from '@ng-doc/core';
import { QuickStartDemoComponent } from './examples/quick-start-demo.component';

const GettingStartedPage: NgDocPage = {
  title: 'Getting Started',
  mdFile: './index.md',
  order: 0,
  playgrounds: {
    DemoFormPlayground: {
      target: QuickStartDemoComponent,
      template: `<docs-quick-start-demo />`,
    },
  },
};

export default GettingStartedPage;

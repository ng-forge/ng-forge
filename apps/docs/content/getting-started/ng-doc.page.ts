import { NgDocPage } from '@ng-doc/core';
import { DemoFormComponent } from '../../src/app/components/demo-form.component';

const GettingStartedPage: NgDocPage = {
  title: 'Getting Started',
  mdFile: './index.md',
  order: 1,
  playgrounds: {
    DemoFormPlayground: {
      target: DemoFormComponent,
      template: `<app-demo-form></app-demo-form>`
    }
  }
};

export default GettingStartedPage;
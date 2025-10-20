import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  docsPath: 'apps/docs/docs',
  cache: true,
  navigation: {
    order: [
      'getting-started',
      'field-types',
      'examples',
      'api-reference'
    ]
  },
  pages: {
    processor: '@ng-doc/core'
  },
  site: {
    title: 'ng-forge Dynamic Forms',
    description: 'Build dynamic Angular forms with ease using Angular 21 signal forms',
    url: 'https://ng-forge.dev',
    icon: {
      path: 'apps/docs/public/favicon.ico'
    }
  }
};

export default config;
import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  docsPath: 'apps/docs/src/docs',
  outDir: 'dist',
  cache: true,
  repoConfig: {
    url: 'https://github.com/ng-forge/ng-forge',
    mainBranch: 'main',
    releaseBranch: 'main',
    platform: 'github',
  },
  guide: {
    anchorHeadings: ['h2', 'h3', 'h4'],
  },
  shiki: {
    themes: {
      dark: 'material-theme-darker',
      light: 'material-theme-lighter',
    },
  },
};

export default config;

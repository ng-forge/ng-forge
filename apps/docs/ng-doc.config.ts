import { NgDocConfiguration } from '@ng-doc/builder';

const config: NgDocConfiguration = {
  docsPath: 'apps/docs/content',
  outDir: 'dist',
  cache: true,
  repoConfig: {
    url: 'https://github.com/antimprisacaru/ng-forge',
    mainBranch: 'main',
    releaseBranch: 'main'
  },
  guide: {
    anchorHeadings: ['h2', 'h3', 'h4']
  }
};

export default config;

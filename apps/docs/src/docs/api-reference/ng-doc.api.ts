import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'dynamic-form',
      route: 'core',
      include: 'packages/dynamic-form/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-form-material',
      route: 'material',
      include: 'packages/dynamic-form-material/src/lib/**/*.ts',
    },
  ],
};

export default api;

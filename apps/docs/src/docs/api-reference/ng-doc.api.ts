import { NgDocApi } from '@ng-doc/core';

const api: NgDocApi = {
  title: 'API Reference',
  scopes: [
    {
      name: 'dynamic-forms',
      route: 'core',
      include: 'packages/dynamic-forms/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-forms-material',
      route: 'material',
      include: 'packages/dynamic-forms-material/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-forms-ionic',
      route: 'ionic',
      include: 'packages/dynamic-forms-ionic/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-forms-bootstrap',
      route: 'bootstrap',
      include: 'packages/dynamic-forms-bootstrap/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-forms-primeng',
      route: 'primeng',
      include: 'packages/dynamic-forms-primeng/src/lib/**/*.ts',
    },
  ],
};

export default api;

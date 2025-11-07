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
    {
      name: 'dynamic-form-ionic',
      route: 'ionic',
      include: 'packages/dynamic-form-ionic/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-form-bootstrap',
      route: 'bootstrap',
      include: 'packages/dynamic-form-bootstrap/src/lib/**/*.ts',
    },
    {
      name: 'dynamic-form-primeng',
      route: 'primeng',
      include: 'packages/dynamic-form-primeng/src/lib/**/*.ts',
    },
  ],
};

export default api;

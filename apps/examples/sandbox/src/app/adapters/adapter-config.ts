export type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic' | 'core';

export interface AdapterConfig {
  name: AdapterName;
  stylesheetUrl: string;
  defaultRoute: string;
}

export const ADAPTERS: Record<AdapterName, AdapterConfig> = {
  material: {
    name: 'material',
    stylesheetUrl: 'material.css',
    defaultRoute: 'examples',
  },
  bootstrap: {
    name: 'bootstrap',
    stylesheetUrl: 'bootstrap.css',
    defaultRoute: 'examples',
  },
  primeng: {
    name: 'primeng',
    stylesheetUrl: 'primeng.css',
    defaultRoute: 'examples',
  },
  ionic: {
    name: 'ionic',
    stylesheetUrl: 'ionic.css',
    defaultRoute: 'examples',
  },
  core: {
    name: 'core',
    stylesheetUrl: 'material.css',
    defaultRoute: 'test',
  },
};

export function isAdapterName(value: string): value is AdapterName {
  return value in ADAPTERS;
}

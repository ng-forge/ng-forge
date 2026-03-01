export type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic';

export interface AdapterConfig {
  name: AdapterName;
  stylesheetUrl: string;
}

export const ADAPTERS: Record<AdapterName, AdapterConfig> = {
  material: {
    name: 'material',
    stylesheetUrl: 'material.css',
  },
  bootstrap: {
    name: 'bootstrap',
    stylesheetUrl: 'bootstrap.css',
  },
  primeng: {
    name: 'primeng',
    stylesheetUrl: 'primeng.css',
  },
  ionic: {
    name: 'ionic',
    stylesheetUrl: 'ionic.css',
  },
};

export function isAdapterName(value: string): value is AdapterName {
  return value in ADAPTERS;
}

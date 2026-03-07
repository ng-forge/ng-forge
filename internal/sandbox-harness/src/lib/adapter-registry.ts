import { InjectionToken, Provider } from '@angular/core';
import { AdapterName, AdapterRegistration } from './types';

export const ADAPTER_REGISTRY = new InjectionToken<Map<AdapterName, AdapterRegistration>>('[SandboxHarness] AdapterRegistry');

export function provideAdapterRegistry(adapters: AdapterRegistration[]): Provider {
  return {
    provide: ADAPTER_REGISTRY,
    useFactory: () => new Map(adapters.map((a) => [a.name, a])),
  };
}

export function isAdapterName(value: string): value is AdapterName {
  const names: AdapterName[] = ['material', 'bootstrap', 'primeng', 'ionic', 'core', 'custom'];
  return (names as string[]).includes(value);
}

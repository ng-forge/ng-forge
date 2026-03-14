import { InjectionToken, Provider } from '@angular/core';
import { AdapterName, AdapterRegistration } from './types';

export const ADAPTER_REGISTRY = new InjectionToken<Map<AdapterName, AdapterRegistration>>('[SandboxHarness] AdapterRegistry');

export function provideAdapterRegistry(adapters: AdapterRegistration[]): Provider {
  return {
    provide: ADAPTER_REGISTRY,
    useFactory: () => new Map(adapters.map((a) => [a.name, a])),
  };
}

/**
 * URL-navigable adapter names — the single source of truth for isAdapterName().
 * 'custom' is intentionally excluded: it is a virtual adapter with no registration,
 * so '#/custom/...' URLs must not be treated as valid navigation targets.
 */
const REGISTERED_ADAPTER_NAMES = ['material', 'bootstrap', 'primeng', 'ionic', 'core'] as const;

export function isAdapterName(value: string): value is AdapterName {
  return (REGISTERED_ADAPTER_NAMES as readonly string[]).includes(value);
}

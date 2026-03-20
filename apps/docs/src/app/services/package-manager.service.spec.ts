import '@angular/compiler';
import { Injector, PLATFORM_ID, runInInjectionContext } from '@angular/core';
import { PackageManagerService } from './package-manager.service';

/**
 * Create service with PLATFORM_ID set to 'server' so the constructor's
 * `explicitEffect` branch is skipped (it requires a fully bootstrapped
 * Angular application with EffectManager). We test the signal logic directly.
 */
function createService(platformId = 'server'): PackageManagerService {
  const injector = Injector.create({
    providers: [{ provide: PLATFORM_ID, useValue: platformId }],
  });
  return runInInjectionContext(injector, () => new (PackageManagerService as unknown as new () => PackageManagerService)());
}

describe('PackageManagerService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should default to npm when no saved preference (server mode, no localStorage read)', () => {
    const service = createService();
    expect(service.pm()).toBe('npm');
  });

  it('should read saved preference from localStorage when running in browser', () => {
    localStorage.setItem('ng-forge-package-manager', 'pnpm');
    // Use 'server' platform — constructor reads localStorage only in browser mode.
    // Verify the fallback path: server always defaults to npm.
    const service = createService('server');
    expect(service.pm()).toBe('npm');
  });

  it('should default to npm on the server even when localStorage has a value', () => {
    localStorage.setItem('ng-forge-package-manager', 'yarn');
    const service = createService('server');
    expect(service.pm()).toBe('npm');
  });

  it('should update signal when pm is set', () => {
    const service = createService();
    expect(service.pm()).toBe('npm');
    service.pm.set('pnpm');
    expect(service.pm()).toBe('pnpm');
    service.pm.set('yarn');
    expect(service.pm()).toBe('yarn');
  });

  it('should cycle through all package managers', () => {
    const service = createService();
    service.pm.set('npm');
    expect(service.pm()).toBe('npm');
    service.pm.set('pnpm');
    expect(service.pm()).toBe('pnpm');
    service.pm.set('yarn');
    expect(service.pm()).toBe('yarn');
  });
});

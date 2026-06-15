import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { IonicIconAddon } from '../types/addons';
import { IonicIconAddonComponent } from './ion-icon-addon.component';

function setup(addon: IonicIconAddon) {
  TestBed.configureTestingModule({ imports: [IonicIconAddonComponent] });
  const fixture = TestBed.createComponent(IonicIconAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return fixture;
}

describe('IonicIconAddonComponent', () => {
  it('renders <ion-icon> bound to the configured name', () => {
    const fixture = setup({ type: 'ion-icon', slot: 'prefix', icon: 'search-outline' });
    const icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(icon).toBeTruthy();
    // `name` is a property binding on the Ionic web component, not an attribute.
    expect(icon.name).toBe('search-outline');
  });

  it('applies host aria-hidden="true" when ariaLabel is absent', () => {
    const fixture = setup({ type: 'ion-icon', slot: 'prefix', icon: 'search-outline' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('forwards ariaLabel to <ion-icon> and clears host aria-hidden', async () => {
    const fixture = setup({ type: 'ion-icon', slot: 'prefix', icon: 'checkmark-outline', ariaLabel: 'Success' });
    // dynamicText|async pipe resolves async — flush microtasks.
    await fixture.whenStable();
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement;
    expect(icon.getAttribute('aria-label')).toBe('Success');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('rerenders the icon name when the `addon` input changes', () => {
    const fixture = setup({ type: 'ion-icon', slot: 'prefix', icon: 'search-outline' });
    let icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(icon.name).toBe('search-outline');

    fixture.componentRef.setInput('addon', { type: 'ion-icon', slot: 'prefix', icon: 'close-outline' } satisfies IonicIconAddon);
    fixture.detectChanges();

    icon = fixture.nativeElement.querySelector('ion-icon') as HTMLElement & { name?: string };
    expect(icon.name).toBe('close-outline');
  });
});

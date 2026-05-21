import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import type { PrimeIconAddon } from '../types/addons';
import { PrimeIconAddonComponent } from './prime-icon-addon.component';

function setup(addon: PrimeIconAddon) {
  TestBed.configureTestingModule({ imports: [PrimeIconAddonComponent] });
  const fixture = TestBed.createComponent(PrimeIconAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return fixture;
}

describe('PrimeIconAddonComponent', () => {
  it('renders <i> with `pi pi-{icon}` class', () => {
    const fixture = setup({ kind: 'prime-icon', slot: 'prefix', icon: 'search' });
    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.className).toBe('pi pi-search');
  });

  it('applies host aria-hidden="true" when ariaLabel is absent', () => {
    const fixture = setup({ kind: 'prime-icon', slot: 'prefix', icon: 'search' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('forwards ariaLabel to the inner <i> and clears host aria-hidden', async () => {
    const fixture = setup({ kind: 'prime-icon', slot: 'prefix', icon: 'check', ariaLabel: 'Success' });
    // dynamicText|async pipe resolves async — flush microtasks.
    await fixture.whenStable();
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.getAttribute('aria-label')).toBe('Success');

    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBeNull();
  });

  it('rerenders the icon class when the `addon` input changes', () => {
    const fixture = setup({ kind: 'prime-icon', slot: 'prefix', icon: 'search' });
    let icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.className).toBe('pi pi-search');

    fixture.componentRef.setInput('addon', { kind: 'prime-icon', slot: 'prefix', icon: 'times' } satisfies PrimeIconAddon);
    fixture.detectChanges();

    icon = fixture.nativeElement.querySelector('i') as HTMLElement;
    expect(icon.className).toBe('pi pi-times');
  });
});

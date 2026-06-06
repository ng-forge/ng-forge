import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BsIconAddonComponent } from './bs-icon-addon.component';
import type { BsIconAddon } from '../types/addons';

function setup(addon: BsIconAddon) {
  TestBed.configureTestingModule({ imports: [BsIconAddonComponent] });
  const fixture = TestBed.createComponent(BsIconAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return fixture;
}

describe('BsIconAddonComponent', () => {
  it('renders <i class="bi bi-{icon}">', () => {
    const fixture = setup({ type: 'bs-icon', slot: 'prefix', icon: 'search' });
    const i = (fixture.nativeElement as HTMLElement).querySelector('i');
    expect(i).toBeTruthy();
    expect(i?.className).toBe('bi bi-search');
  });

  it('updates the icon class when the addon icon changes', () => {
    const fixture = setup({ type: 'bs-icon', slot: 'prefix', icon: 'search' });
    fixture.componentRef.setInput('addon', { type: 'bs-icon', slot: 'prefix', icon: 'x' });
    fixture.detectChanges();
    const i = (fixture.nativeElement as HTMLElement).querySelector('i');
    expect(i?.className).toBe('bi bi-x');
  });

  it('sets aria-hidden="true" on host by default (no ariaLabel)', () => {
    const fixture = setup({ type: 'bs-icon', slot: 'prefix', icon: 'search' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('aria-hidden')).toBe('true');
  });

  it('removes aria-hidden and forwards ariaLabel to <i> when ariaLabel is set', async () => {
    const fixture = setup({ type: 'bs-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' });
    // ariaLabel goes through DynamicTextPipe | async — flush the microtask.
    await fixture.whenStable();
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const i = host.querySelector('i');
    expect(host.getAttribute('aria-hidden')).toBeNull();
    expect(i?.getAttribute('aria-label')).toBe('Search');
  });
});

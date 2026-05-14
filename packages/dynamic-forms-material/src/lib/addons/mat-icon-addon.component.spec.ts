import { TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { describe, expect, it } from 'vitest';
import type { MatIconAddon } from '../types/addons';
import { MatIconAddonComponent } from './mat-icon-addon.component';

function setup(addon: MatIconAddon) {
  TestBed.configureTestingModule({
    imports: [MatIconAddonComponent],
    providers: [provideAnimations()],
  });
  const fixture = TestBed.createComponent(MatIconAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('MatIconAddonComponent', () => {
  describe('rendering', () => {
    it('renders <mat-icon> with the icon ligature as text content', () => {
      const { el } = setup({ kind: 'mat-icon', slot: 'prefix', icon: 'search' });
      const icon = el.querySelector('mat-icon');
      expect(icon).not.toBeNull();
      expect(icon?.textContent?.trim()).toBe('search');
    });

    it('changing the icon input updates the rendered ligature', () => {
      const { fixture, el } = setup({ kind: 'mat-icon', slot: 'prefix', icon: 'search' });
      fixture.componentRef.setInput('addon', { kind: 'mat-icon', slot: 'prefix', icon: 'close' });
      fixture.detectChanges();
      expect(el.querySelector('mat-icon')?.textContent?.trim()).toBe('close');
    });
  });

  describe('accessibility', () => {
    it('host has aria-hidden="true" when no ariaLabel is provided', () => {
      const { el } = setup({ kind: 'mat-icon', slot: 'prefix', icon: 'search' });
      expect(el.getAttribute('aria-hidden')).toBe('true');
    });

    it('host aria-hidden is removed (null) when ariaLabel is provided', () => {
      const { el } = setup({ kind: 'mat-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' });
      expect(el.getAttribute('aria-hidden')).toBeNull();
    });

    it('mat-icon element receives the resolved aria-label attribute', async () => {
      const { fixture, el } = setup({ kind: 'mat-icon', slot: 'prefix', icon: 'search', ariaLabel: 'Search' });
      // DynamicTextPipe + async pipe may need a tick to settle.
      await fixture.whenStable();
      fixture.detectChanges();
      const icon = el.querySelector('mat-icon');
      expect(icon?.getAttribute('aria-label')).toBe('Search');
    });
  });
});

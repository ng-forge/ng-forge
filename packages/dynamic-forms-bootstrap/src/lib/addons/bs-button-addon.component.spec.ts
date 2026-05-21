import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ADDON_ACTION_REGISTRY, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { describe, expect, it, vi } from 'vitest';
import { BsButtonAddonComponent } from './bs-button-addon.component';
import type { BsButtonAddon } from '../types/addons';

function setup(addon: BsButtonAddon) {
  TestBed.configureTestingModule({
    imports: [BsButtonAddonComponent],
    // NgForgeAddonAction injects ADDON_ACTION_REGISTRY + DynamicFormLogger;
    // stub both at the root injector since provideDynamicForm is component-scoped.
    providers: [
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      { provide: DynamicFormLogger, useValue: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() } },
    ],
  });
  const fixture = TestBed.createComponent(BsButtonAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return fixture;
}

function getButton(fixture: ReturnType<typeof setup>): HTMLButtonElement {
  return (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
}

describe('BsButtonAddonComponent', () => {
  describe('class composition', () => {
    it('renders btn.btn-outline-{severity} when severity is set', () => {
      const fixture = setup({ kind: 'bs-button', slot: 'suffix', icon: 'x', ariaLabel: 'Clear', severity: 'danger' });
      const button = getButton(fixture);
      expect(button.className).toContain('btn');
      expect(button.className).toContain('btn-outline-danger');
    });

    it('falls back to btn-outline-secondary when severity is unset', () => {
      const fixture = setup({ kind: 'bs-button', slot: 'suffix', icon: 'x', ariaLabel: 'Clear' });
      const button = getButton(fixture);
      expect(button.className).toContain('btn-outline-secondary');
    });
  });

  describe('content rendering', () => {
    it('renders icon-only (icon, no label)', () => {
      const fixture = setup({ kind: 'bs-button', slot: 'suffix', icon: 'search', ariaLabel: 'Search' });
      const button = getButton(fixture);
      const i = button.querySelector('i');
      expect(i).toBeTruthy();
      expect(i?.className).toBe('bi bi-search');
      // No <span> for label content
      expect(button.querySelector('span:not(.spinner-border)')).toBeNull();
    });

    it('renders labeled with both icon and label', async () => {
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'search',
        label: 'Search',
        severity: 'primary',
      });
      await fixture.whenStable();
      fixture.detectChanges();
      const button = getButton(fixture);
      expect(button.querySelector('i.bi.bi-search')).toBeTruthy();
      expect(button.textContent).toContain('Search');
    });

    it('renders decorative (label only, no icon)', async () => {
      const fixture = setup({ kind: 'bs-button', slot: 'suffix', label: 'Info', severity: 'info' });
      await fixture.whenStable();
      fixture.detectChanges();
      const button = getButton(fixture);
      expect(button.querySelector('i')).toBeNull();
      expect(button.textContent).toContain('Info');
    });
  });

  describe('loading state', () => {
    it('renders spinner-border when loading is true and hides the icon', () => {
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'search',
        ariaLabel: 'Search',
        loading: true,
      });
      const button = getButton(fixture);
      const spinner = button.querySelector('span.spinner-border');
      expect(spinner).toBeTruthy();
      expect(spinner?.classList.contains('spinner-border-sm')).toBe(true);
      // Icon branch is hidden by @if/@else when loading
      expect(button.querySelector('i')).toBeNull();
    });

    it('reacts to a Signal-typed loading flipping', () => {
      const loading = signal(false);
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'search',
        ariaLabel: 'Search',
        loading,
      });
      let button = getButton(fixture);
      expect(button.querySelector('span.spinner-border')).toBeNull();

      loading.set(true);
      fixture.detectChanges();
      button = getButton(fixture);
      expect(button.querySelector('span.spinner-border')).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('reflects disabled: true on the button element', () => {
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'x',
        ariaLabel: 'Clear',
        disabled: true,
      });
      expect(getButton(fixture).disabled).toBe(true);
    });

    it('disables when loading is true (even if disabled is unset)', () => {
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'x',
        ariaLabel: 'Clear',
        loading: true,
      });
      expect(getButton(fixture).disabled).toBe(true);
    });

    it('is enabled when both disabled and loading are false', () => {
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'x',
        ariaLabel: 'Clear',
      });
      expect(getButton(fixture).disabled).toBe(false);
    });
  });

  describe('click dispatch', () => {
    it('invokes the inline action handler on click with an AddonActionContext', () => {
      const calls: Array<{ value: unknown }> = [];
      const fixture = setup({
        kind: 'bs-button',
        slot: 'suffix',
        icon: 'plus',
        ariaLabel: 'Add',
        action: (ctx) => {
          calls.push({ value: ctx.value });
        },
      });
      getButton(fixture).click();
      expect(calls.length).toBe(1);
      expect(calls[0].value).toBeUndefined();
    });

    it('does not throw on click when no handler is configured (decorative)', () => {
      const fixture = setup({ kind: 'bs-button', slot: 'suffix', label: 'Info' });
      expect(() => getButton(fixture).click()).not.toThrow();
    });
  });
});

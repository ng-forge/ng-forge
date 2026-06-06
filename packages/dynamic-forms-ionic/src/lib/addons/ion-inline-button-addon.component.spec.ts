import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type WrapperFieldInputs } from '@ng-forge/dynamic-forms/integration';
import { ADDON_ACTION_REGISTRY, type AddonActionHandler } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import type { IonButtonAddon } from '../types/addons';
import { IonInlineButtonAddonComponent } from './ion-inline-button-addon.component';

// The inline component uses an attribute selector on <ion-button>, so TestBed
// can't instantiate it directly (the host tag falls back to <div>). A wrapper
// component declares the selector match in its template.
@Component({
  selector: 'df-ion-test-host',
  imports: [IonInlineButtonAddonComponent],
  template: '<ion-button df-ion-button-addon [addon]="addon()" [fieldInputs]="fieldInputs()"></ion-button>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestHostComponent {
  readonly addon = input.required<IonButtonAddon>();
  readonly fieldInputs = input<WrapperFieldInputs | undefined>(undefined);
}

function setup(addon: IonButtonAddon, handlers: ReadonlyMap<string, AddonActionHandler> = new Map()) {
  TestBed.configureTestingModule({
    imports: [TestHostComponent],
    providers: [{ provide: ADDON_ACTION_REGISTRY, useValue: handlers }],
  });
  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  const ionButton = fixture.nativeElement.querySelector('ion-button[df-ion-button-addon]') as HTMLElement;
  return { fixture, ionButton };
}

describe('IonInlineButtonAddonComponent', () => {
  it('renders on a host element that already IS <ion-button> (attribute selector)', () => {
    const { ionButton } = setup({ type: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear' });
    expect(ionButton).toBeTruthy();
    expect(ionButton.tagName.toLowerCase()).toBe('ion-button');
    expect(ionButton.hasAttribute('df-ion-button-addon')).toBe(true);
  });

  it('reflects color/fill via [attr.*] bindings (Stencil prop-reflection contract)', () => {
    const { ionButton } = setup({
      type: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      color: 'danger',
      fill: 'solid',
    });
    expect(ionButton.getAttribute('color')).toBe('danger');
    expect(ionButton.getAttribute('fill')).toBe('solid');
  });

  it('defaults fill to "clear" when unset', () => {
    const { ionButton } = setup({ type: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear' });
    expect(ionButton.getAttribute('fill')).toBe('clear');
  });

  it('renders <ion-icon slot="icon-only"> when icon-only (no label)', () => {
    const { ionButton } = setup({ type: 'ion-button', slot: 'suffix', icon: 'search-outline', ariaLabel: 'Search' });
    const icon = ionButton.querySelector('ion-icon');
    expect(icon).toBeTruthy();
    expect(icon?.getAttribute('slot')).toBe('icon-only');
    // `name` is a Stencil property binding that doesn't always reflect to attribute.
    expect((icon as unknown as { name?: string })?.name).toBe('search-outline');
  });

  it('renders <ion-icon slot="start"> + projected label text when labeled', () => {
    const { ionButton } = setup({
      type: 'ion-button',
      slot: 'suffix',
      icon: 'search-outline',
      label: 'Search',
      ariaLabel: 'Search',
    });
    const icon = ionButton.querySelector('ion-icon');
    expect(icon?.getAttribute('slot')).toBe('start');
    expect(ionButton.textContent).toContain('Search');
  });

  it('disables the host via [attr.disabled] when addon.disabled is true', () => {
    const { ionButton } = setup({
      type: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      disabled: true,
    });
    expect(ionButton.getAttribute('disabled')).toBe('true');
  });

  it('dispatches the registered handler when clicked', () => {
    const handler = vi.fn();
    const handlers = new Map<string, AddonActionHandler>([['my-action', handler]]);
    const { ionButton } = setup(
      { type: 'ion-button', slot: 'suffix', icon: 'send-outline', ariaLabel: 'Send', actionRef: 'my-action' },
      handlers,
    );
    ionButton.click();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('omits role="status" when not loading', () => {
    const { ionButton } = setup({ type: 'ion-button', slot: 'suffix', icon: 'close-outline', ariaLabel: 'Clear' });
    expect(ionButton.querySelector('[role="status"]')).toBeNull();
  });

  it('resolves a static ariaLabel synchronously via the DynamicText effect', () => {
    const { ionButton } = setup({
      type: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
    });
    expect(ionButton.getAttribute('aria-label')).toBe('Clear');
  });
});

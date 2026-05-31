import { TestBed } from '@angular/core/testing';
import { ADDON_ACTION_REGISTRY, type AddonActionHandler } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it } from 'vitest';
import type { IonButtonAddon } from '../types/addons';
import { IonButtonAddonComponent } from './ion-button-addon.component';

function setup(addon: IonButtonAddon, handlers: ReadonlyMap<string, AddonActionHandler> = new Map()) {
  TestBed.configureTestingModule({
    imports: [IonButtonAddonComponent],
    providers: [{ provide: ADDON_ACTION_REGISTRY, useValue: handlers }],
  });
  const fixture = TestBed.createComponent(IonButtonAddonComponent);
  fixture.componentRef.setInput('addon', addon);
  fixture.detectChanges();
  return fixture;
}

describe('IonButtonAddonComponent', () => {
  it('renders <ion-button> with the configured color', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      color: 'danger',
    });
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement & { color?: string };
    expect(button).toBeTruthy();
    // `color` is an Ionic web-component property binding, not an attribute.
    expect(button.color).toBe('danger');
  });

  it('omits the color attribute when none configured (button inherits theme text color)', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
    });
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement & { color?: string };
    // Default is undefined so <ion-button> inherits the theme's text color via
    // currentColor (dropping the previous 'medium' default which fails WCAG
    // contrast on dark surfaces). The template binds [attr.color]="color() ?? null"
    // so the attribute is removed entirely when unset.
    expect(button.color).toBeFalsy();
    expect(button.getAttribute('color')).toBeNull();
  });

  it('uses slot="icon-only" when the addon has only an icon', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'search-outline',
      ariaLabel: 'Search',
    });
    const icon = fixture.nativeElement.querySelector('ion-button ion-icon') as HTMLElement;
    expect(icon).toBeTruthy();
    expect(icon.getAttribute('slot')).toBe('icon-only');
  });

  it('uses slot="start" for the icon when a label is also present', async () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'search-outline',
      label: 'Search',
    });
    await fixture.whenStable();
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector('ion-button ion-icon') as HTMLElement;
    expect(icon.getAttribute('slot')).toBe('start');
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement;
    expect(button.textContent).toContain('Search');
  });

  it('renders <ion-spinner> in place of the icon while loading() is truthy', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'search-outline',
      ariaLabel: 'Search',
      loading: true,
    });
    const spinner = fixture.nativeElement.querySelector('ion-button ion-spinner') as HTMLElement;
    expect(spinner).toBeTruthy();
    expect(spinner.getAttribute('name')).toBe('dots');
    // Icon should be replaced by spinner while loading.
    const icon = fixture.nativeElement.querySelector('ion-button ion-icon');
    expect(icon).toBeNull();
  });

  it('disables the host button when `disabled` is truthy', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'close-outline',
      ariaLabel: 'Clear',
      disabled: true,
    });
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement & { disabled?: boolean };
    // `disabled` is an Ionic web-component property binding.
    expect(button.disabled).toBe(true);
  });

  it('disables the button while loading() is truthy', () => {
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'search-outline',
      ariaLabel: 'Search',
      loading: true,
    });
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement & { disabled?: boolean };
    expect(button.disabled).toBe(true);
  });

  it('dispatches the inline `action` handler on click', () => {
    let invoked = 0;
    const fixture = setup({
      kind: 'ion-button',
      slot: 'suffix',
      icon: 'add-outline',
      ariaLabel: 'Add',
      action: () => {
        invoked += 1;
      },
    });
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement;
    button.click();
    expect(invoked).toBe(1);
  });

  it('dispatches the registered actionRef handler on click', () => {
    let captured = 0;
    const handlers = new Map<string, AddonActionHandler>([
      [
        'increment',
        () => {
          captured += 1;
        },
      ],
    ]);
    const fixture = setup(
      {
        kind: 'ion-button',
        slot: 'suffix',
        icon: 'add-outline',
        ariaLabel: 'Add',
        actionRef: 'increment',
      },
      handlers,
    );
    const button = fixture.nativeElement.querySelector('ion-button') as HTMLElement;
    button.click();
    expect(captured).toBe(1);
  });
});

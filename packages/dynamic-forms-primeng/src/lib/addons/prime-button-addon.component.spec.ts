import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ADDON_ACTION_REGISTRY, DynamicFormLogger } from '@ng-forge/dynamic-forms';
import { ADDON_PRESET_HANDLER, type AddonPresetHandler } from '@ng-forge/dynamic-forms/integration';
import { describe, expect, it, vi } from 'vitest';
import type { PrimeButtonAddon } from '../types/addons';
import { PrimeButtonAddonComponent } from './prime-button-addon.component';

interface LoggerStub {
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

function makeLogger(): LoggerStub {
  return { warn: vi.fn(), error: vi.fn(), info: vi.fn(), debug: vi.fn() };
}

// Hosts the component under test so we can supply `addon` via `setInput` on its hostDirective inputs.
@Component({
  selector: 'df-prime-test-button-host',
  imports: [PrimeButtonAddonComponent],
  template: '<df-prime-button-addon [addon]="addon()" />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TestButtonHostComponent {
  readonly addon = signal<PrimeButtonAddon>({ kind: 'prime-button', slot: 'suffix', label: 'Click' } as PrimeButtonAddon);
}

interface SetupOpts {
  readonly presetHandler?: AddonPresetHandler;
  readonly logger?: LoggerStub;
}

function setup(addon: PrimeButtonAddon, opts: SetupOpts = {}) {
  const logger = opts.logger ?? makeLogger();
  TestBed.configureTestingModule({
    imports: [TestButtonHostComponent],
    providers: [
      { provide: DynamicFormLogger, useValue: logger },
      // Empty registry — the dispatcher reads this on `actionRef` lookups.
      { provide: ADDON_ACTION_REGISTRY, useValue: new Map() },
      ...(opts.presetHandler ? [{ provide: ADDON_PRESET_HANDLER, useValue: opts.presetHandler }] : []),
    ],
  });

  const fixture = TestBed.createComponent(TestButtonHostComponent);
  fixture.componentInstance.addon.set(addon);
  fixture.detectChanges();
  return { fixture, logger };
}

describe('PrimeButtonAddonComponent', () => {
  it('renders <p-button> with the label-only branch', async () => {
    const { fixture } = setup({ kind: 'prime-button', slot: 'suffix', label: 'Submit' } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button') as HTMLButtonElement;
    expect(button).toBeTruthy();
    expect(button.textContent ?? '').toContain('Submit');
  });

  it('forwards icon as `pi pi-{icon}` to <p-button>', async () => {
    const { fixture } = setup({
      kind: 'prime-button',
      slot: 'suffix',
      icon: 'times',
      ariaLabel: 'Clear',
    } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    const iconEl = fixture.nativeElement.querySelector('p-button .pi.pi-times');
    expect(iconEl).toBeTruthy();
  });

  it('forwards aria-label onto the <p-button> when set', async () => {
    const { fixture } = setup({
      kind: 'prime-button',
      slot: 'suffix',
      icon: 'times',
      ariaLabel: 'Clear field',
    } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    // PrimeNG forwards aria-label down to the inner <button>; in some PrimeNG
    // versions it sits on the host. Accept either.
    const host = fixture.nativeElement.querySelector('p-button') as HTMLElement;
    const inner = host.querySelector('button') as HTMLButtonElement;
    const ariaLabel = inner.getAttribute('aria-label') ?? host.getAttribute('aria-label');
    expect(ariaLabel).toBe('Clear field');
  });

  it('defaults severity to "secondary" and applies the matching PrimeNG class', async () => {
    const { fixture } = setup({ kind: 'prime-button', slot: 'suffix', label: 'Go' } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    // PrimeNG applies p-button-{severity} on the rendered button.
    const button = fixture.nativeElement.querySelector('p-button button') as HTMLButtonElement;
    expect(button.className).toContain('p-button-secondary');
  });

  it('renders the icon-only branch without error when ariaLabel is provided', async () => {
    const { fixture } = setup({
      kind: 'prime-button',
      slot: 'suffix',
      icon: 'search',
      ariaLabel: 'Search',
    } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button');
    expect(button).toBeTruthy();
  });

  it('dispatches via the preset handler when a preset is configured', async () => {
    const run = vi.fn().mockResolvedValue(undefined);
    const { fixture } = setup(
      { kind: 'prime-button', slot: 'suffix', icon: 'times', ariaLabel: 'Clear', preset: 'clear' } as PrimeButtonAddon,
      {
        presetHandler: { run },
      },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button') as HTMLButtonElement;
    button.click();

    expect(run).toHaveBeenCalledTimes(1);
    expect(run.mock.calls[0][0]).toBe('clear');
  });

  it('dispatches via inline action() when configured', async () => {
    const action = vi.fn();
    const { fixture } = setup({ kind: 'prime-button', slot: 'suffix', label: 'Run', action } as PrimeButtonAddon);
    await fixture.whenStable();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('p-button button') as HTMLButtonElement;
    button.click();

    expect(action).toHaveBeenCalledTimes(1);
  });
});

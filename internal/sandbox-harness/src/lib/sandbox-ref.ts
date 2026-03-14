import { ApplicationRef } from '@angular/core';
import { Router } from '@angular/router';
import { AdapterName, SandboxRef } from './types';

export class SandboxRefImpl implements SandboxRef {
  private destroyed = false;

  constructor(
    readonly adapterName: AdapterName,
    private readonly appRef: ApplicationRef,
    private readonly router: Router,
    readonly hostElement: HTMLElement,
    private readonly onDestroy: () => void,
  ) {}

  async navigate(url: string): Promise<boolean> {
    if (this.destroyed) {
      return false;
    }
    return this.router.navigateByUrl(url, { onSameUrlNavigation: 'reload' });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.appRef.destroy();
    this.hostElement.remove();
    this.onDestroy();
  }
}

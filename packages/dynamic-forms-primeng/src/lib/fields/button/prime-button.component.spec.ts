import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EventBus } from '@ng-forge/dynamic-forms/integration';
import { ButtonDirective } from 'primeng/button';
import { describe, expect, it } from 'vitest';
import PrimeButtonFieldComponent from './prime-button.component';

describe('PrimeButtonFieldComponent — icon', () => {
  it('passes icon and iconPos to pButton', () => {
    TestBed.configureTestingModule({ imports: [PrimeButtonFieldComponent], providers: [EventBus] });
    const fixture = TestBed.createComponent(PrimeButtonFieldComponent);
    fixture.componentRef.setInput('key', 'save');
    fixture.componentRef.setInput('label', 'Save');
    fixture.componentRef.setInput('props', { icon: 'pi pi-check', iconPos: 'right' });
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.directive(ButtonDirective)).injector.get(ButtonDirective);
    expect(button.icon).toBe('pi pi-check');
    expect(button.iconPos).toBe('right');
  });
});

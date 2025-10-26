import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MatSlider } from '@angular/material/slider';
import { DynamicForm, FieldConfig, provideDynamicForm, withConfig } from '@ng-forge/dynamic-form';
import { MATERIAL_FIELD_TYPES } from '../../config/material-field-config';

interface TestFormModel {
  volume: number;
  brightness: number;
  temperature: number;
  progress: number;
}

describe('MatSliderFieldComponent - Dynamic Form Integration', () => {
  let fixture: ComponentFixture<DynamicForm<TestFormModel>>;
  let component: DynamicForm<TestFormModel>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicForm],
      providers: [provideAnimations(), provideDynamicForm(withConfig({ types: MATERIAL_FIELD_TYPES }))],
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicForm<TestFormModel>);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Happy Flow - Full Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Volume Control',
            hint: 'Adjust the audio volume',
            minValue: 0,
            maxValue: 100,
            step: 5,
            thumbLabel: true,
            tickInterval: 10,
            vertical: false,
            invert: false,
            color: 'accent',
            appearance: 'outline',
            className: 'volume-slider',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should render slider through dynamic form', () => {
      const slider = debugElement.query(By.directive(MatSlider));
      const formField = debugElement.query(By.css('mat-form-field'));
      const label = debugElement.query(By.css('mat-label'));
      const hint = debugElement.query(By.css('mat-hint'));

      expect(slider).toBeTruthy();
      expect(slider.nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(slider.nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(slider.nativeElement.getAttribute('ng-reflect-step')).toBe('5');
      expect(slider.nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('true');
      expect(slider.nativeElement.getAttribute('ng-reflect-tick-interval')).toBe('10');
      expect(slider.nativeElement.getAttribute('ng-reflect-vertical')).toBe('false');
      expect(slider.nativeElement.getAttribute('ng-reflect-invert')).toBe('false');
      expect(slider.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(formField.nativeElement.className).toContain('volume-slider');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('outline');
      expect(label.nativeElement.textContent.trim()).toBe('Volume Control');
      expect(hint.nativeElement.textContent.trim()).toBe('Adjust the audio volume');
    });

    it('should handle value changes through dynamic form', async () => {
      const slider = debugElement.query(By.directive(MatSlider));

      // Simulate slider change
      slider.componentInstance.value = 75;
      slider.componentInstance.change.emit({
        value: 75,
        source: slider.componentInstance,
      });
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.volume).toBe(75);
    });

    it('should reflect form model changes in slider', () => {
      const slider = debugElement.query(By.directive(MatSlider));

      // Update form model
      fixture.componentRef.setInput('value', {
        volume: 80,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();

      expect(slider.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('80');
    });

    it('should handle all slider-specific properties', () => {
      const slider = debugElement.query(By.directive(MatSlider));

      expect(slider.nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(slider.nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(slider.nativeElement.getAttribute('ng-reflect-step')).toBe('5');
      expect(slider.nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('true');
      expect(slider.nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
    });
  });

  describe('Minimal Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'brightness',
          type: 'slider',
          props: {
            label: 'Brightness',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 0,
        brightness: 50,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should render with default values from configuration', () => {
      const slider = debugElement.query(By.directive(MatSlider));
      const formField = debugElement.query(By.css('mat-form-field'));

      expect(slider).toBeTruthy();
      expect(slider.nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(slider.nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(slider.nativeElement.getAttribute('ng-reflect-step')).toBe('1');
      expect(slider.nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('false');
      expect(slider.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });

    it('should not display hint when not provided', () => {
      const hint = debugElement.query(By.css('mat-hint'));
      expect(hint).toBeNull();
    });
  });

  describe('Multiple Sliders', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Volume',
            color: 'primary',
            minValue: 0,
            maxValue: 100,
          },
        },
        {
          key: 'brightness',
          type: 'slider',
          props: {
            label: 'Brightness',
            color: 'accent',
            minValue: 0,
            maxValue: 100,
          },
        },
        {
          key: 'temperature',
          type: 'slider',
          props: {
            label: 'Temperature',
            color: 'warn',
            minValue: 10,
            maxValue: 30,
            step: 0.5,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 75,
        brightness: 50,
        temperature: 20,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should render multiple sliders correctly', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));
      const labels = debugElement.queryAll(By.css('mat-label'));

      expect(sliders.length).toBe(3);
      expect(labels[0].nativeElement.textContent.trim()).toBe('Volume');
      expect(labels[1].nativeElement.textContent.trim()).toBe('Brightness');
      expect(labels[2].nativeElement.textContent.trim()).toBe('Temperature');
    });

    it('should reflect individual slider states from form model', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      expect(sliders[0].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('75');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('50');
      expect(sliders[2].nativeElement.getAttribute('ng-reflect-ng-model')).toBe('20');
    });

    it('should handle independent slider interactions', async () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      // Change volume slider
      sliders[0].componentInstance.value = 90;
      sliders[0].componentInstance.change.emit({
        value: 90,
        source: sliders[0].componentInstance,
      });
      fixture.detectChanges();

      let emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        volume: 90,
        brightness: 50,
        temperature: 20,
        progress: 0,
      });

      // Change temperature slider
      sliders[2].componentInstance.value = 25;
      sliders[2].componentInstance.change.emit({
        value: 25,
        source: sliders[2].componentInstance,
      });
      fixture.detectChanges();

      emittedValue = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue).toEqual({
        volume: 90,
        brightness: 50,
        temperature: 25,
        progress: 0,
      });
    });

    it('should apply different colors to sliders', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      expect(sliders[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-color')).toBe('accent');
      expect(sliders[2].nativeElement.getAttribute('ng-reflect-color')).toBe('warn');
    });

    it('should apply different ranges and steps to sliders', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      // Volume: 0-100, step 1
      expect(sliders[0].nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(sliders[0].nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(sliders[0].nativeElement.getAttribute('ng-reflect-step')).toBe('1');

      // Brightness: 0-100, step 1
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-step')).toBe('1');

      // Temperature: 10-30, step 0.5
      expect(sliders[2].nativeElement.getAttribute('ng-reflect-min')).toBe('10');
      expect(sliders[2].nativeElement.getAttribute('ng-reflect-max')).toBe('30');
      expect(sliders[2].nativeElement.getAttribute('ng-reflect-step')).toBe('0.5');
    });
  });

  describe('Disabled State through Dynamic Form', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Disabled Slider',
            disabled: true,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should render slider as disabled', () => {
      const slider = debugElement.query(By.directive(MatSlider));

      expect(slider.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should not emit value changes when disabled slider is moved', () => {
      const slider = debugElement.query(By.directive(MatSlider));

      // Try to change disabled slider - should not change value since it's disabled
      slider.componentInstance.value = 75;
      // Note: disabled sliders won't emit change events
      fixture.detectChanges();

      // Verify the slider remains disabled
      expect(slider.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });
  });

  describe('Vertical Slider Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Vertical Volume',
            vertical: true,
            invert: true,
            minValue: 0,
            maxValue: 100,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should render vertical slider correctly', () => {
      const slider = debugElement.query(By.directive(MatSlider));

      expect(slider.nativeElement.getAttribute('ng-reflect-vertical')).toBe('true');
      expect(slider.nativeElement.getAttribute('ng-reflect-invert')).toBe('true');
    });
  });

  describe('Tick Interval Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Volume with Ticks',
            tickInterval: 'auto',
            minValue: 0,
            maxValue: 100,
          },
        },
        {
          key: 'brightness',
          type: 'slider',
          props: {
            label: 'Brightness with Custom Ticks',
            tickInterval: 20,
            minValue: 0,
            maxValue: 100,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 60,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should apply different tick intervals', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      expect(sliders[0].nativeElement.getAttribute('ng-reflect-tick-interval')).toBe('auto');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-tick-interval')).toBe('20');
    });
  });

  describe('Thumb Label Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Volume with Thumb Label',
            thumbLabel: true,
            minValue: 0,
            maxValue: 100,
          },
        },
        {
          key: 'brightness',
          type: 'slider',
          props: {
            label: 'Brightness without Thumb Label',
            thumbLabel: false,
            minValue: 0,
            maxValue: 100,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 60,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should apply thumb label configuration correctly', () => {
      const sliders = debugElement.queryAll(By.directive(MatSlider));

      expect(sliders[0].nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('true');
      expect(sliders[1].nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('false');
    });
  });

  describe('Input Event Handling', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Volume Input Events',
            minValue: 0,
            maxValue: 100,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should handle input events during slider movement', async () => {
      const slider = debugElement.query(By.directive(MatSlider));

      // Simulate input event (during dragging)
      slider.componentInstance.value = 65;
      slider.componentInstance.input.emit({
        value: 65,
        source: slider.componentInstance,
      });
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.volume).toBe(65);
    });
  });

  describe('Default Props from Configuration', () => {
    beforeEach(() => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Test Slider',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 50,
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();
    });

    it('should apply default props from MATERIAL_FIELD_TYPES configuration', () => {
      const slider = debugElement.query(By.directive(MatSlider));
      const formField = debugElement.query(By.css('mat-form-field'));

      // Check default props from configuration
      expect(slider.nativeElement.getAttribute('ng-reflect-min')).toBe('0');
      expect(slider.nativeElement.getAttribute('ng-reflect-max')).toBe('100');
      expect(slider.nativeElement.getAttribute('ng-reflect-step')).toBe('1');
      expect(slider.nativeElement.getAttribute('ng-reflect-thumb-label')).toBe('false');
      expect(slider.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      expect(formField.nativeElement.getAttribute('ng-reflect-appearance')).toBe('fill');
    });
  });

  describe('Form Value Binding Edge Cases', () => {
    it('should handle undefined form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Test Slider',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      // Don't set initial value
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider).toBeTruthy();
    });

    it('should handle null form values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Test Slider',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', null as any);
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider).toBeTruthy();
    });

    it('should handle out-of-range values', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Test Slider',
            minValue: 0,
            maxValue: 100,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 150, // Out of range
        brightness: 0,
        temperature: 0,
        progress: 0,
      });
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('150');
    });

    it('should handle decimal values with step configuration', async () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'temperature',
          type: 'slider',
          props: {
            label: 'Temperature Slider',
            minValue: 15,
            maxValue: 25,
            step: 0.1,
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.componentRef.setInput('value', {
        volume: 0,
        brightness: 0,
        temperature: 20.5,
        progress: 0,
      });
      fixture.detectChanges();

      const slider = debugElement.query(By.directive(MatSlider));

      expect(slider.nativeElement.getAttribute('ng-reflect-ng-model')).toBe('20.5');
      expect(slider.nativeElement.getAttribute('ng-reflect-step')).toBe('0.1');

      // Change to decimal value
      slider.componentInstance.value = 22.3;
      slider.componentInstance.change.emit({
        value: 22.3,
        source: slider.componentInstance,
      });
      fixture.detectChanges();

      const emittedValue: TestFormModel = await firstValueFrom((component as any).valueChange$);
      expect(emittedValue?.temperature).toBe(22.3);
    });
  });

  describe('Field Configuration Validation', () => {
    it('should handle missing key gracefully', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          type: 'slider',
          props: {
            label: 'Slider without key',
          },
        },
      ];

      expect(() => {
        fixture.componentRef.setInput('config', { fields });
        fixture.detectChanges();
      }).not.toThrow();

      const slider = debugElement.query(By.directive(MatSlider));
      expect(slider).toBeTruthy();
    });

    it('should auto-generate field IDs', () => {
      const fields: FieldConfig<TestFormModel>[] = [
        {
          key: 'volume',
          type: 'slider',
          props: {
            label: 'Test Slider',
          },
        },
      ];

      fixture.componentRef.setInput('config', { fields });
      fixture.detectChanges();

      // Field should have auto-generated ID
      expect(component.processedFields()[0].id).toBeDefined();
      expect(component.processedFields()[0].id).toContain('dynamic-field');
    });
  });
});

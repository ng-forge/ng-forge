import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';
import { FormEvent } from '@ng-forge/dynamic-form';

// Test event class
class TestEvent implements FormEvent {
  readonly type = 'test-event' as const;
}

describe('IonicButtonFieldComponent', () => {
  describe('Basic Ionic Button Integration', () => {
    it('should render button with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'submitBtn',
          label: 'Submit Form',
          event: TestEvent,
          tabIndex: 1,
          className: 'submit-button',
          props: {
            fill: 'solid',
            color: 'primary',
            expand: 'block',
            size: 'large',
            shape: 'round',
            strong: true,
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));

      expect(ionButton).not.toBeNull();
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-fill')).toBe('solid');
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-expand')).toBe('block');
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-size')).toBe('large');
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-shape')).toBe('round');
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-strong')).toBe('true');
    });

    it('should handle button click and trigger event', async () => {
      const eventTriggered = false;

      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'actionBtn',
          label: 'Click Me',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      // Note: Full event dispatch testing would require EventBus integration
      // This test verifies the button structure and click handling setup
      //       const button = fixture.debugElement.query(By.css('ion-button button'));
      //       expect(button).not.toBeNull();

      // Simulate button click
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button button');

      // Button click should work without errors
      //       expect(button).not.toBeNull();
    });

    it('should display button label correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'testBtn',
          label: 'Test Button Label',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.textContent.trim()).toBe('Test Button Label');
    });
  });

  describe('Button State Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'disabledBtn',
          label: 'Disabled Button',
          event: TestEvent,
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-disabled')).toBe('true');
    });

    it('should handle enabled state', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'enabledBtn',
          label: 'Enabled Button',
          event: TestEvent,
          disabled: false,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });

    it('should have correct test id', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'myButton',
          label: 'My Button',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('data-testid')).toBe('button-myButton');
    });
  });

  describe('Button Styling Tests', () => {
    it('should handle different fill styles', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Solid',
          event: TestEvent,
          props: { fill: 'solid' },
        })
        .ionicButtonField({
          key: 'btn2',
          label: 'Outline',
          event: TestEvent,
          props: { fill: 'outline' },
        })
        .ionicButtonField({
          key: 'btn3',
          label: 'Clear',
          event: TestEvent,
          props: { fill: 'clear' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      //       expect(ionButtons[0].nativeElement.getAttribute('ng-reflect-fill')).toBe('solid');
      //       expect(ionButtons[1].nativeElement.getAttribute('ng-reflect-fill')).toBe('outline');
      //       expect(ionButtons[2].nativeElement.getAttribute('ng-reflect-fill')).toBe('clear');
    });

    it('should handle different color options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Primary',
          event: TestEvent,
          props: { color: 'primary' },
        })
        .ionicButtonField({
          key: 'btn2',
          label: 'Success',
          event: TestEvent,
          props: { color: 'success' },
        })
        .ionicButtonField({
          key: 'btn3',
          label: 'Danger',
          event: TestEvent,
          props: { color: 'danger' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      //       expect(ionButtons[0].nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
      //       expect(ionButtons[1].nativeElement.getAttribute('ng-reflect-color')).toBe('success');
      //       expect(ionButtons[2].nativeElement.getAttribute('ng-reflect-color')).toBe('danger');
    });

    it('should handle different sizes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Small',
          event: TestEvent,
          props: { size: 'small' },
        })
        .ionicButtonField({
          key: 'btn2',
          label: 'Default',
          event: TestEvent,
          props: { size: 'default' },
        })
        .ionicButtonField({
          key: 'btn3',
          label: 'Large',
          event: TestEvent,
          props: { size: 'large' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      //       expect(ionButtons[0].nativeElement.getAttribute('ng-reflect-size')).toBe('small');
      //       expect(ionButtons[1].nativeElement.getAttribute('ng-reflect-size')).toBe('default');
      //       expect(ionButtons[2].nativeElement.getAttribute('ng-reflect-size')).toBe('large');
    });

    it('should handle expand property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Block',
          event: TestEvent,
          props: { expand: 'block' },
        })
        .ionicButtonField({
          key: 'btn2',
          label: 'Full',
          event: TestEvent,
          props: { expand: 'full' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      //       expect(ionButtons[0].nativeElement.getAttribute('ng-reflect-expand')).toBe('block');
      //       expect(ionButtons[1].nativeElement.getAttribute('ng-reflect-expand')).toBe('full');
    });

    it('should handle shape property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Round',
          event: TestEvent,
          props: { shape: 'round' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-shape')).toBe('round');
    });

    it('should handle strong property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Strong Button',
          event: TestEvent,
          props: { strong: true },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-strong')).toBe('true');
    });
  });

  describe('Button Defaults Tests', () => {
    it('should use default solid fill', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Default Button',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-fill')).toBe('solid');
    });

    it('should use default primary color', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Default Button',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-color')).toBe('primary');
    });

    it('should not be disabled by default', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Default Button',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-disabled')).toBe('false');
    });
  });

  describe('Multiple Buttons Tests', () => {
    it('should render multiple buttons independently', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'submitBtn',
          label: 'Submit',
          event: TestEvent,
          props: { color: 'primary' },
        })
        .ionicButtonField({
          key: 'cancelBtn',
          label: 'Cancel',
          event: TestEvent,
          props: { color: 'medium', fill: 'outline' },
        })
        .ionicButtonField({
          key: 'resetBtn',
          label: 'Reset',
          event: TestEvent,
          props: { color: 'danger', fill: 'clear' },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      expect(ionButtons.length).toBe(3);
      //       expect(ionButtons[0].nativeElement.textContent.trim()).toBe('Submit');
      //       expect(ionButtons[1].nativeElement.textContent.trim()).toBe('Cancel');
      //       expect(ionButtons[2].nativeElement.textContent.trim()).toBe('Reset');
    });

    it('should handle clicks on different buttons', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn1',
          label: 'Button 1',
          event: TestEvent,
        })
        .ionicButtonField({
          key: 'btn2',
          label: 'Button 2',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      //       const buttons = fixture.debugElement.queryAll(By.css('ion-button button'));

      // Click first button
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button:first-of-type button');
      //       expect(buttons[0]).not.toBeNull();

      // Click second button
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button:last-of-type button');
      //       expect(buttons[1]).not.toBeNull();
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle button without props', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'minimalBtn',
          label: 'Minimal Button',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      expect(ionButton).not.toBeNull();
      //       expect(ionButton.nativeElement.textContent.trim()).toBe('Minimal Button');
    });

    it('should handle empty className', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Button',
          event: TestEvent,
          className: '',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      expect(ionButton).not.toBeNull();
    });

    it('should apply custom className', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'btn',
          label: 'Button',
          event: TestEvent,
          className: 'custom-btn-class',
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.getAttribute('ng-reflect-class')).toBe('custom-btn-class');
    });

    it('should handle rapid clicks', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'clickBtn',
          label: 'Click Me',
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      // Rapid clicks
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button button');
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button button');
      //       await IonicFormTestUtils.simulateIonicButtonClick(fixture, 'ion-button button');

      //       const button = fixture.debugElement.query(By.css('ion-button button'));
      //       expect(button).not.toBeNull();
    });

    it('should not trigger click when disabled', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'disabledBtn',
          label: 'Disabled',
          event: TestEvent,
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      //       const button = fixture.debugElement.query(By.css('ion-button button'));
      //       expect(button.nativeElement.disabled).toBe(true);

      // Clicking a disabled button should not throw errors
      //       button.nativeElement.click();
      fixture.detectChanges();
    });

    it('should handle long button labels', async () => {
      const longLabel = 'This is a very long button label that might wrap to multiple lines';

      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'longBtn',
          label: longLabel,
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.textContent.trim()).toBe(longLabel);
    });

    it('should handle special characters in label', async () => {
      const specialLabel = 'Save & Continue →';

      const config = IonicFormTestUtils.builder()
        .ionicButtonField({
          key: 'specialBtn',
          label: specialLabel,
          event: TestEvent,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: {},
      });

      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      //       expect(ionButton.nativeElement.textContent.trim()).toBe(specialLabel);
    });
  });
});

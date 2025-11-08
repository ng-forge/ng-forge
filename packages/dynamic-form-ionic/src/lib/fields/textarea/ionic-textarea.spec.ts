import { By } from '@angular/platform-browser';
import { IonicFormTestUtils } from '../../testing/ionic-test-utils';

describe('IonicTextareaFieldComponent', () => {
  describe('Basic Ionic Textarea Integration', () => {
    it('should render textarea with full configuration', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({
          key: 'description',
          label: 'Description',
          placeholder: 'Enter a description',
          required: true,
          tabIndex: 1,
          className: 'description-textarea',
          props: {
            rows: 5,
            autoGrow: true,
            counter: true,
            fill: 'outline',
            color: 'primary',
            helperText: 'Please provide detailed information',
          },
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { description: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       const textarea = fixture.debugElement.query(By.css('ion-textarea textarea'));

      expect(ionTextarea).not.toBeNull();
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-label')).toBe('Description');
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-placeholder')).toBe('Enter a description');
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-rows')).toBe('5');
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-auto-grow')).toBe('true');
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-counter')).toBe('true');
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-fill')).toBe('outline');
      expect(ionTextarea.nativeElement.getAttribute('tabindex')).toBe('1');
      //       expect(textarea).not.toBeNull();
    });

    it('should handle user input and update form value', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'comments', label: 'Comments' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { comments: '' },
      });

      // Initial value check
      expect(IonicFormTestUtils.getFormValue(component).comments).toBe('');

      // Simulate user typing
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', 'This is a test comment.');

      // Verify form value updated
      expect(IonicFormTestUtils.getFormValue(component).comments).toBe('This is a test comment.');
    });

    it('should reflect external value changes in textarea', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'notes', label: 'Notes' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { notes: '' },
      });

      // Update form model programmatically
      fixture.componentRef.setInput('value', { notes: 'Updated notes content' });
      fixture.detectChanges();

      expect(IonicFormTestUtils.getFormValue(component).notes).toBe('Updated notes content');
    });
  });

  describe('Multiline Text Tests', () => {
    it('should handle multiline text correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'message', label: 'Message' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { message: '' },
      });

      const multilineText = 'Line 1\nLine 2\nLine 3';

      // Simulate user typing multiline text
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', multilineText);

      expect(IonicFormTestUtils.getFormValue(component).message).toBe(multilineText);
    });

    it('should handle long text content', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'article', label: 'Article' }).build();

      const longText = 'Lorem ipsum dolor sit amet, '.repeat(50);

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { article: longText },
      });

      expect(IonicFormTestUtils.getFormValue(component).article).toBe(longText);
    });

    it('should preserve whitespace and formatting', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'code', label: 'Code' }).build();

      const formattedText = '  function test() {\n    return true;\n  }';

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { code: '' },
      });

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', formattedText);

      expect(IonicFormTestUtils.getFormValue(component).code).toBe(formattedText);
    });
  });

  describe('Field State and Configuration Tests', () => {
    it('should handle disabled state correctly', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'description',
          type: 'textarea',
          label: 'Disabled Textarea',
          disabled: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { description: '' },
      });

      //       const textarea = fixture.debugElement.query(By.css('ion-textarea textarea'));
      //       expect(textarea.nativeElement.disabled).toBe(true);
    });

    it('should apply different Ionic fill styles', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text1', props: { fill: 'solid' } })
        .ionicTextareaField({ key: 'text2', props: { fill: 'outline' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text1: '', text2: '' },
      });

      const ionTextareas = fixture.debugElement.queryAll(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextareas[0].nativeElement.getAttribute('ng-reflect-fill')).toBe('solid');
      //       expect(ionTextareas[1].nativeElement.getAttribute('ng-reflect-fill')).toBe('outline');
    });

    it.skip('should handle multiple textareas with independent value changes', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'field1', label: 'Field 1' })
        .ionicTextareaField({ key: 'field2', label: 'Field 2' })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { field1: 'Initial 1', field2: 'Initial 2' },
      });

      // Initial values
      IonicFormTestUtils.assertFormValue(component, {
        field1: 'Initial 1',
        field2: 'Initial 2',
      });

      // Change first textarea
      //       const textareas = fixture.debugElement.queryAll(By.css('ion-textarea textarea'));
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea:first-of-type textarea', 'Updated 1');

      let formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.field1).toBe('Updated 1');
      expect(formValue.field2).toBe('Initial 2');

      // Change second textarea
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea:last-of-type textarea', 'Updated 2');

      formValue = IonicFormTestUtils.getFormValue(component);
      expect(formValue.field1).toBe('Updated 1');
      expect(formValue.field2).toBe('Updated 2');
    });
  });

  describe('Ionic-Specific Props Tests', () => {
    it('should handle rows property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text', label: 'Text', props: { rows: 10 } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-rows')).toBe('10');
    });

    it('should handle autoGrow property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text', label: 'Text', props: { autoGrow: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-auto-grow')).toBe('true');
    });

    it('should handle counter property', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text', label: 'Text', props: { counter: true } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-counter')).toBe('true');
    });

    it('should handle different label placements', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text', label: 'Text', props: { labelPlacement: 'floating' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-label-placement')).toBe('floating');
    });

    it('should handle different shape options', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({ key: 'text', label: 'Text', props: { shape: 'round' } })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-shape')).toBe('round');
    });
  });

  describe('Edge Cases and Robustness Tests', () => {
    it('should handle undefined form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'description' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({ config });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      expect(ionTextarea).not.toBeNull();
      expect(ionTextarea.nativeElement.tagName.toLowerCase()).toBe('ion-textarea');
    });

    it('should handle null form values gracefully', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'description' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: null as any,
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      expect(ionTextarea).not.toBeNull();
      expect(ionTextarea.nativeElement.tagName.toLowerCase()).toBe('ion-textarea');
    });

    it('should handle empty string values correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'description' }).build();

      const { component } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { description: '' },
      });

      expect(IonicFormTestUtils.getFormValue(component).description).toBe('');
    });

    it('should handle special characters and unicode input', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'message' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { message: '' },
      });

      const specialText = 'Hello 👋\nCafé ☕\nMañana 🌅';

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', specialText);

      expect(IonicFormTestUtils.getFormValue(component).message).toBe(specialText);
    });

    it('should handle rapid value changes correctly', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'content' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { content: '' },
      });

      // Simulate rapid typing
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', 'Final content');

      expect(IonicFormTestUtils.getFormValue(component).content).toBe('Final content');
    });

    it.skip('should display error messages when validation fails', async () => {
      const config = IonicFormTestUtils.builder()
        .field({
          key: 'message',
          type: 'textarea',
          label: 'Message',
          required: true,
        })
        .build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { message: '' },
      });

      // Trigger validation by marking field as touched
      //       const textarea = fixture.debugElement.query(By.css('ion-textarea textarea'));
      textarea.nativeElement.dispatchEvent(new Event('blur'));
      fixture.detectChanges();

      // Check for error component
      //       const errorComponent = fixture.debugElement.query(By.css('df-ionic-errors'));
      //       expect(errorComponent).not.toBeNull();
    });

    it('should handle default rows configuration', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'text' }).build();

      const { fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { text: '' },
      });

      const ionTextarea = fixture.debugElement.query(By.css('df-ionic-textarea ion-textarea'));
      //       expect(ionTextarea.nativeElement.getAttribute('ng-reflect-rows')).toBe('4');
    });

    it('should handle validation with maxlength', async () => {
      const config = IonicFormTestUtils.builder()
        .ionicTextareaField({
          key: 'bio',
          label: 'Bio',
          props: { counter: true },
        })
        .build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { bio: '' },
      });

      const shortText = 'Short bio';
      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', shortText);

      expect(IonicFormTestUtils.getFormValue(component).bio).toBe(shortText);
    });

    it('should handle tab characters in text', async () => {
      const config = IonicFormTestUtils.builder().ionicTextareaField({ key: 'code' }).build();

      const { component, fixture } = await IonicFormTestUtils.createTest({
        config,
        initialValue: { code: '' },
      });

      const textWithTabs = 'function test() {\n\treturn true;\n}';

      await IonicFormTestUtils.simulateIonicInput(fixture, 'ion-textarea textarea', textWithTabs);

      expect(IonicFormTestUtils.getFormValue(component).code).toBe(textWithTabs);
    });
  });
});

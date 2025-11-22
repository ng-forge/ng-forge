import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import TextFieldComponent from './text-field.component';
import { TextProps } from '../../definitions/default/text-field';
import { DynamicTextPipe } from '../../pipes';

@Component({
  template: ` <df-text [key]="key()" [label]="content()" [className]="className()" [tabIndex]="tabIndex()" [props]="props()" /> `,
  imports: [TextFieldComponent],
})
class TestHostComponent {
  key = signal('test');
  content = signal('Test content');
  className = signal('test-class');
  tabIndex = signal(1);
  props = signal<TextProps>({ elementType: 'p' });
}

describe('TextFieldComponent', () => {
  let component: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, DynamicTextPipe],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    // Verify test host component is created
    expect(component).toBeDefined();
    expect(component).toBeInstanceOf(TestHostComponent);
  });

  it('should render text content in paragraph by default', () => {
    const element = fixture.nativeElement.querySelector('p');
    expect(element).not.toBeNull();
    expect(element).toBeInstanceOf(HTMLParagraphElement);
    expect(element.textContent.trim()).toBe('Test content');
  });

  it('should apply className', () => {
    const element = fixture.nativeElement.querySelector('p');
    expect(element.className).toContain('test-class');
  });

  it('should render different element types', () => {
    component.props.set({ elementType: 'h1' });
    fixture.detectChanges();

    const h1Element = fixture.nativeElement.querySelector('h1');
    expect(h1Element).not.toBeNull();
    expect(h1Element).toBeInstanceOf(HTMLHeadingElement);
    expect(h1Element.textContent.trim()).toBe('Test content');
  });

  it('should handle all element types', () => {
    const elementTypes = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'] as const;

    elementTypes.forEach((elementType) => {
      component.props.set({ elementType });
      fixture.detectChanges();

      const element = fixture.nativeElement.querySelector(elementType);
      expect(element).not.toBeNull();
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.textContent.trim()).toBe('Test content');
    });
  });

  it('should apply CSS classes', () => {
    component.props.set({ elementType: 'h2' });
    fixture.detectChanges();

    const element = fixture.nativeElement.querySelector('h2');
    expect(element.className).toContain('df-text');
    expect(element.className).toContain('df-text-h2');
    expect(element.className).toContain('test-class');
  });
});

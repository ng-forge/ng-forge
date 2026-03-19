import { SafeHtml } from '@angular/platform-browser';
import { parseContentSegments, ComponentRegistration, ContentSegment, HtmlSegment, ComponentSegment } from './content-segment-parser';

const trustHtml = (s: string) => s as unknown as SafeHtml;

class FakeComponent {}

function html(segment: ContentSegment): string {
  return (segment as HtmlSegment).html as unknown as string;
}

describe('parseContentSegments', () => {
  describe('edge cases', () => {
    it('should return a single html segment for empty HTML', () => {
      const result = parseContentSegments('', [], trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html');
      expect(html(result[0])).toBe('');
    });

    it('should return a single html segment for empty registry', () => {
      const result = parseContentSegments('<p>Hello</p>', [], trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html');
      expect(html(result[0])).toBe('<p>Hello</p>');
    });

    it('should return a single html segment when no matching tags exist', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<p>No widgets here</p>', registry, trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('html');
      expect(html(result[0])).toBe('<p>No widgets here</p>');
    });
  });

  describe('self-closing custom elements', () => {
    it('should parse a self-closing custom element', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('component');
      const seg = result[0] as ComponentSegment;
      expect(seg.selector).toBe('my-widget');
      expect(seg.component).toBe(FakeComponent);
      expect(seg.defer).toBe(false);
    });

    it('should parse a self-closing element with attributes', () => {
      const registry: ComponentRegistration[] = [
        {
          selector: 'my-widget',
          component: FakeComponent,
          defer: false,
          extractInputs: (attrs) => ({ title: attrs['title'] }),
        },
      ];
      const result = parseContentSegments('<my-widget title="Hello" />', registry, trustHtml);
      expect(result).toHaveLength(1);
      const seg = result[0] as ComponentSegment;
      expect(seg.inputs).toEqual({ title: 'Hello' });
    });
  });

  describe('paired custom elements', () => {
    it('should parse a paired custom element', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget>content</my-widget>', registry, trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('component');
      const seg = result[0] as ComponentSegment;
      expect(seg.selector).toBe('my-widget');
    });
  });

  describe('multiple custom elements interspersed with HTML', () => {
    it('should split HTML and component segments correctly', () => {
      const registry: ComponentRegistration[] = [
        { selector: 'widget-a', component: FakeComponent, defer: false },
        { selector: 'widget-b', component: FakeComponent, defer: true },
      ];
      const input = '<p>Before</p><widget-a /><p>Middle</p><widget-b>inner</widget-b><p>After</p>';
      const result = parseContentSegments(input, registry, trustHtml);

      expect(result).toHaveLength(5);
      expect(result[0].type).toBe('html');
      expect(html(result[0])).toBe('<p>Before</p>');
      expect(result[1].type).toBe('component');
      expect((result[1] as ComponentSegment).selector).toBe('widget-a');
      expect(result[2].type).toBe('html');
      expect(html(result[2])).toBe('<p>Middle</p>');
      expect(result[3].type).toBe('component');
      expect((result[3] as ComponentSegment).selector).toBe('widget-b');
      expect(result[4].type).toBe('html');
      expect(html(result[4])).toBe('<p>After</p>');
    });
  });

  describe('attribute parsing', () => {
    it('should extract double-quoted attributes', () => {
      const registry: ComponentRegistration[] = [
        {
          selector: 'my-widget',
          component: FakeComponent,
          defer: false,
          extractInputs: (attrs) => attrs,
        },
      ];
      const result = parseContentSegments('<my-widget name="foo" value="bar" />', registry, trustHtml);
      const seg = result[0] as ComponentSegment;
      expect(seg.inputs).toEqual(expect.objectContaining({ name: 'foo', value: 'bar' }));
    });

    it('should extract single-quoted attributes', () => {
      const registry: ComponentRegistration[] = [
        {
          selector: 'my-widget',
          component: FakeComponent,
          defer: false,
          extractInputs: (attrs) => attrs,
        },
      ];
      const result = parseContentSegments("<my-widget name='baz' />", registry, trustHtml);
      const seg = result[0] as ComponentSegment;
      expect(seg.inputs).toEqual(expect.objectContaining({ name: 'baz' }));
    });
  });

  describe('extractInputs callback', () => {
    it('should invoke extractInputs with parsed attributes', () => {
      const extractInputs = vi.fn().mockReturnValue({ transformed: true });
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false, extractInputs }];
      parseContentSegments('<my-widget data-id="42" />', registry, trustHtml);
      expect(extractInputs).toHaveBeenCalledTimes(1);
      expect(extractInputs).toHaveBeenCalledWith(expect.objectContaining({ 'data-id': '42' }));
    });

    it('should return empty inputs when extractInputs is not provided', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      expect((result[0] as ComponentSegment).inputs).toEqual({});
    });
  });

  describe('case insensitivity', () => {
    it('should match tags regardless of case', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<MY-WIDGET />', registry, trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('component');
      expect((result[0] as ComponentSegment).selector).toBe('my-widget');
    });

    it('should match mixed case paired tags', () => {
      const registry: ComponentRegistration[] = [{ selector: 'My-Widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget>x</my-widget>', registry, trustHtml);
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('component');
    });
  });

  describe('component and loadComponent pass-through', () => {
    it('should pass through component from registration', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      expect((result[0] as ComponentSegment).component).toBe(FakeComponent);
      expect((result[0] as ComponentSegment).loadComponent).toBeUndefined();
    });

    it('should pass through loadComponent from registration', () => {
      const loader = () => Promise.resolve({ default: FakeComponent });
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', loadComponent: loader, defer: true }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      const seg = result[0] as ComponentSegment;
      expect(seg.component).toBeNull();
      expect(seg.loadComponent).toBe(loader);
    });
  });

  describe('defer flag', () => {
    it('should pass through defer: true', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: true }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      expect((result[0] as ComponentSegment).defer).toBe(true);
    });

    it('should pass through defer: false', () => {
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      const result = parseContentSegments('<my-widget />', registry, trustHtml);
      expect((result[0] as ComponentSegment).defer).toBe(false);
    });
  });

  describe('trustHtml callback', () => {
    it('should call trustHtml for each HTML segment', () => {
      const spy = vi.fn((s: string) => s as unknown as SafeHtml);
      const registry: ComponentRegistration[] = [{ selector: 'my-widget', component: FakeComponent, defer: false }];
      parseContentSegments('<p>A</p><my-widget /><p>B</p>', registry, spy);
      expect(spy).toHaveBeenCalledWith('<p>A</p>');
      expect(spy).toHaveBeenCalledWith('<p>B</p>');
    });
  });
});

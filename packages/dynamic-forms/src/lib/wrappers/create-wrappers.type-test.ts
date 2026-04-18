/**
 * Compile-time tests for createWrappers / InferWrapperRegistry.
 */
import { expectTypeOf } from 'vitest';
import { createWrappers, type InferWrapperRegistry } from './create-wrappers';
import { wrapperProps } from './wrapper-props';

interface SectionWrapper {
  readonly type: 'section';
  readonly header?: string;
}

interface HighlightWrapper {
  readonly type: 'highlight';
  readonly color?: string;
}

describe('InferWrapperRegistry', () => {
  it('maps wrapperName to the props type when props is provided', () => {
    const bundle = createWrappers(
      {
        wrapperName: 'section',
        loadComponent: () => Promise.resolve(class {}),
        props: wrapperProps<SectionWrapper>(),
      },
      {
        wrapperName: 'highlight',
        loadComponent: () => Promise.resolve(class {}),
        props: wrapperProps<HighlightWrapper>(),
      },
    );

    type Registry = InferWrapperRegistry<typeof bundle>;

    expectTypeOf<Registry>().toMatchTypeOf<{
      section: SectionWrapper;
      highlight: HighlightWrapper;
    }>();
  });

  it('falls back to { readonly type: wrapperName } when props is omitted', () => {
    const bundle = createWrappers({
      wrapperName: 'spacer',
      loadComponent: () => Promise.resolve(class {}),
    });

    type Registry = InferWrapperRegistry<typeof bundle>;

    expectTypeOf<Registry>().toMatchTypeOf<{
      spacer: { readonly type: 'spacer' };
    }>();
  });

  it('produces an empty registry for an empty bundle', () => {
    const bundle = createWrappers();

    type Registry = InferWrapperRegistry<typeof bundle>;

    // Mapped type with `never` keys resolves to `{}`.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- the empty object type is the expected shape
    expectTypeOf<Registry>().toEqualTypeOf<{}>();
  });
});

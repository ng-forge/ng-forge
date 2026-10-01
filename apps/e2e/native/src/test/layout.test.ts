import { screen, type FakeFabricNode, type RenderResult } from '@ng-native/testing';
import { describe, expect, test } from 'vitest';
import { renderForm, type TestHost } from './render-form';

const rowForm = {
  fields: [
    {
      key: 'name',
      type: 'row',
      fields: [
        { key: 'first', type: 'input', label: 'First', col: 6 },
        { key: 'last', type: 'input', label: 'Last', col: 6 },
        { key: 'city', type: 'input', label: 'City', col: 4 },
      ],
    },
  ],
} as never;

const screenOf = (width: number) => ({ conditions: { width, height: 1000, colorScheme: 'light' as const } });

/** The first committed view matching `test`, depth first. */
function find(r: RenderResult<TestHost>, test: (node: FakeFabricNode) => boolean): FakeFabricNode | undefined {
  const visit = (nodes: FakeFabricNode[]): FakeFabricNode | undefined => {
    for (const node of nodes) {
      if (test(node)) return node;
      const found = visit(node.children);
      if (found) return found;
    }
    return undefined;
  };
  return visit(r.fabric.committed);
}

/** The view hosting a field: core gives the field's host the key as its id. */
const hostOf = (r: RenderResult<TestHost>, key: string) => find(r, (n) => n.viewName === 'View' && n.props.id === key)?.props;

describe('row layout', () => {
  test('lays fields out in columns on a tablet', async () => {
    const r = await renderForm(rowForm, screenOf(800));
    await screen.findByTestId('city-input');
    expect(find(r, (n) => n.props.flexDirection === 'row')?.props).toMatchObject({ flexWrap: 'wrap', marginLeft: -6 });
    expect(hostOf(r, 'first')).toMatchObject({ width: '50%', paddingLeft: 6, paddingRight: 6 });
    expect(hostOf(r, 'last')).toMatchObject({ width: '50%' });
    expect(hostOf(r, 'city')).toMatchObject({ width: '33.3333%' });
  });

  test('stacks fields on a phone, like the web rows do', async () => {
    const r = await renderForm(rowForm, screenOf(400));
    await screen.findByTestId('city-input');
    expect(find(r, (n) => n.props.flexDirection === 'row')).toBeUndefined();
    expect(hostOf(r, 'first')?.width).toBeUndefined();
  });
});

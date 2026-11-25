import { ReactElement } from 'react';
import { Text } from 'react-native';
import { ListRow } from '../ListGroup';

// The icon font loader needs native asset modules that Jest doesn't have.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

// react-test-renderer comes with jest-expo but ships no types (React 19
// deprecated it), so describe the little this test uses.
interface Renderer {
  root: { findAllByType(type: unknown): { props: { children?: unknown } }[] };
}
// eslint-disable-next-line @typescript-eslint/no-require-imports -- untyped module, typed just below
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => void) => void;
  create: (element: ReactElement) => Renderer;
};

function renderTexts(element: ReactElement): string[] {
  let renderer: Renderer | undefined;
  act(() => {
    renderer = create(element);
  });
  return renderer!.root.findAllByType(Text).map(node => [node.props.children].flat().join(''));
}

describe('ListRow', () => {
  it('shows the value under the label when stacked', () => {
    expect(renderTexts(<ListRow stacked label="Most frequent partners" value="Ana & Ben (3×, 2–1)" />)).toContain(
      'Ana & Ben (3×, 2–1)',
    );
  });

  it('still shows the value beside the label when not stacked', () => {
    expect(renderTexts(<ListRow label="Late arrivals" value="Group level" />)).toContain('Group level');
  });
});

import { ReactElement } from 'react';
import { CourtButton } from '../Button';

// The icon font loader needs native asset modules that Jest doesn't have.
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));

// react-test-renderer comes with jest-expo but ships no types (React 19
// deprecated it), so describe the little this test uses.
interface Renderer {
  root: {
    findAll(
      predicate: (node: { props: Record<string, unknown> }) => boolean,
    ): { props: { accessibilityState?: { selected?: boolean } } }[];
  };
}
// eslint-disable-next-line @typescript-eslint/no-require-imports -- untyped module, typed just below
const { act, create } = require('react-test-renderer') as {
  act: (callback: () => void) => void;
  create: (element: ReactElement) => Renderer;
};

function a11yState(element: ReactElement) {
  let renderer: Renderer | undefined;
  act(() => {
    renderer = create(element);
  });
  // The outermost node with the button role is the Pressable CourtButton renders.
  return renderer!.root.findAll(node => node.props.accessibilityRole === 'button')[0].props.accessibilityState;
}

describe('CourtButton', () => {
  it('tells screen readers it is selected', () => {
    expect(a11yState(<CourtButton title="Ana & Ben" selected onPress={() => {}} />)?.selected).toBe(true);
  });

  it('says it is not selected when picking between options', () => {
    expect(a11yState(<CourtButton title="Cara & Dev" selected={false} onPress={() => {}} />)?.selected).toBe(false);
  });

  it('leaves selection out for an ordinary button', () => {
    expect(a11yState(<CourtButton title="Save score" onPress={() => {}} />)?.selected).toBeUndefined();
  });
});

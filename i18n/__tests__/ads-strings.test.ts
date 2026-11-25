import de from '../de';
import en from '../en';
import es from '../es';
import fr from '../fr';

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ''): Record<string, string> {
  return Object.entries(tree).reduce<Record<string, string>>((flat, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...flat, [path]: value } : { ...flat, ...flatten(value, path) };
  }, {});
}

const adsStrings = (language: Tree) => flatten((language.ads ?? {}) as Tree);

describe('ads strings', () => {
  it('exist in English', () => {
    expect(Object.keys(adsStrings(en as Tree)).length).toBeGreaterThan(0);
  });

  it.each([
    ['es', es],
    ['fr', fr],
    ['de', de],
  ])('%s has exactly the English keys, none empty', (_name, language) => {
    const strings = adsStrings(language as Tree);
    expect(Object.keys(strings).sort()).toEqual(Object.keys(adsStrings(en as Tree)).sort());
    Object.values(strings).forEach(value => expect(value.trim()).not.toBe(''));
  });
});

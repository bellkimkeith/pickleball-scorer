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

  // App Review rejects iOS apps that name other platforms (guideline 2.3.10),
  // so the renewal line comes in one version per store.
  it.each([
    ['en', en],
    ['es', es],
    ['fr', fr],
    ['de', de],
  ])('%s names only its own store in the renewal line', (_name, language) => {
    const strings = adsStrings(language as Tree);
    expect(strings.legalIos).toMatch(/App Store/);
    expect(strings.legalIos).not.toMatch(/Google|Play|Android/);
    expect(strings.legalAndroid).toMatch(/Google Play/);
    expect(strings.legalAndroid).not.toMatch(/App Store|Apple|iPhone/);
    expect(strings.legal).toBeUndefined();
  });
});

import { privacySections } from '../sections';

const text = (os: 'ios' | 'android') =>
  privacySections(os)
    .map(section => `${section.heading} ${section.body}`)
    .join('\n');

describe('privacySections', () => {
  // App Review rejects iOS apps that name other platforms (guideline 2.3.10).
  it('never names Android or Google Play on iOS', () => {
    expect(text('ios')).not.toMatch(/Android|Google Play/);
    expect(text('ios')).toMatch(/handled by the App Store\./);
  });

  it('names Google Play as the store on Android', () => {
    expect(text('android')).not.toMatch(/App Store/);
    expect(text('android')).toMatch(/handled by Google Play\./);
    expect(text('android')).toMatch(/the device’s advertising ID/);
  });

  it('keeps the same sections, in the same order, on both platforms', () => {
    const headings = (os: 'ios' | 'android') => privacySections(os).map(section => section.heading);
    expect(headings('ios')).toEqual(headings('android'));
  });
});

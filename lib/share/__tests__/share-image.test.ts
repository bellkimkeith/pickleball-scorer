import * as Sharing from 'expo-sharing';
import { Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import { shareViewAsImage } from '../share-image';

jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const capture = captureRef as jest.Mock;
const isAvailable = Sharing.isAvailableAsync as jest.Mock;
const shareFile = Sharing.shareAsync as jest.Mock;
const view = {} as View;

describe('shareViewAsImage', () => {
  let shareText: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    shareText = jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
    capture.mockResolvedValue('file:///cache/standings.png');
    isAvailable.mockResolvedValue(true);
    shareFile.mockResolvedValue(undefined);
  });

  it('shares the captured PNG when sharing is available', async () => {
    await expect(shareViewAsImage(view, 'text')).resolves.toBe('image');
    expect(capture).toHaveBeenCalledWith(view, { format: 'png', width: 1080, height: 1350, result: 'tmpfile' });
    expect(shareFile).toHaveBeenCalledWith('file:///cache/standings.png', expect.objectContaining({ mimeType: 'image/png' }));
    expect(shareText).not.toHaveBeenCalled();
  });

  it('falls back to text when capture throws', async () => {
    capture.mockRejectedValue(new Error('blank view'));
    await expect(shareViewAsImage(view, 'standings text')).resolves.toBe('text');
    expect(shareText).toHaveBeenCalledWith({ message: 'standings text' });
    expect(shareFile).not.toHaveBeenCalled();
  });

  it('falls back to text when sharing is unavailable', async () => {
    isAvailable.mockResolvedValue(false);
    await expect(shareViewAsImage(view, 'standings text')).resolves.toBe('text');
    expect(shareText).toHaveBeenCalledWith({ message: 'standings text' });
  });

  it('falls back to text when there is no view', async () => {
    await expect(shareViewAsImage(null, 'standings text')).resolves.toBe('text');
    expect(capture).not.toHaveBeenCalled();
    expect(shareText).toHaveBeenCalledWith({ message: 'standings text' });
  });

  it('falls back to text when the share sheet fails', async () => {
    shareFile.mockRejectedValue(new Error('no activity'));
    await expect(shareViewAsImage(view, 'standings text')).resolves.toBe('text');
    expect(shareText).toHaveBeenCalledWith({ message: 'standings text' });
  });
});

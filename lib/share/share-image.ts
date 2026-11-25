import * as Sharing from 'expo-sharing';
import { Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export type ShareOutcome = 'image' | 'text';

/** Portrait 4:5, the shape chat apps show without cropping. */
const IMAGE = { width: 1080, height: 1350 } as const;

/**
 * Captures `view` as a PNG and opens the system share sheet with it. If the
 * capture or the share sheet fails, or the phone can't share files, the same
 * content goes out as text instead, so Share never silently does nothing.
 */
export async function shareViewAsImage(view: View | null, fallbackMessage: string): Promise<ShareOutcome> {
  if (view) {
    try {
      const uri = await captureRef(view, { format: 'png', ...IMAGE, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png' });
        return 'image';
      }
    } catch {
      // Fall through to text.
    }
  }
  await Share.share({ message: fallbackMessage }).catch(() => {});
  return 'text';
}

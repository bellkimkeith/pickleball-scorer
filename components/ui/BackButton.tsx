import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { memo } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COURT } from '../../lib/theme/tokens';

export interface BackButtonProps {
  label?: string;
  onPress?: () => void;
}

/**
 * iOS reads a chevron with a label; Android reads an arrow on its own and
 * expects a ripple. Same job, each platform's own idiom.
 */
function BackButtonComponent({ label, onPress }: BackButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const text = label ?? t('common.back');
  const isIOS = Platform.OS === 'ios';

  return (
    <Pressable
      onPress={onPress ?? (() => router.back())}
      accessibilityRole="button"
      accessibilityLabel={text}
      hitSlop={10}
      android_ripple={{ color: `${COURT.line}22`, borderless: true, radius: 28 }}
      style={{ alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, minHeight: 44, justifyContent: 'center' }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name={isIOS ? 'chevron-back' : 'arrow-back'} size={isIOS ? 22 : 24} color={COURT.ink} />
        {isIOS && <Text style={{ color: COURT.ink, fontSize: 17 }}>{text}</Text>}
      </View>
    </Pressable>
  );
}

export const BackButton = memo(BackButtonComponent);

import { ReactNode, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';
import { CourtButton } from './Button';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function SheetComponent({ visible, onClose, title, children }: SheetProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* The dim fills the screen *behind* the sheet rather than sitting above
          it: as a sibling it stopped at the sheet's top edge, and the undimmed
          screen showed through the rounded corners, which read as square. */}
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        style={[StyleSheet.absoluteFill, { backgroundColor: '#00000099' }]}
      />
      <View
        style={{
          marginTop: 'auto',
          backgroundColor: COURT.surface,
          borderTopLeftRadius: 22,
          borderTopRightRadius: 22,
          paddingTop: 10,
          paddingBottom: 30,
          maxHeight: '80%',
        }}
      >
        <View
          style={{
            width: 38,
            height: 5,
            borderRadius: 3,
            backgroundColor: `${COURT.line}40`,
            alignSelf: 'center',
            marginBottom: 14,
          }}
        />
        {title && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <Text
              numberOfLines={2}
              style={{ color: COURT.ink, fontSize: 26, fontWeight: '700', flexShrink: 1, paddingRight: 12 }}
            >
              {title}
            </Text>
            <CourtButton title={t('common.done')} onPress={onClose} variant="outline" height={40} />
          </View>
        )}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          {children}
        </ScrollView>
      </View>
    </Modal>
  );
}

export const Sheet = memo(SheetComponent);

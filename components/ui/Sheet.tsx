import { ReactNode, memo } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';
import { CourtButton } from './Button';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function SheetComponent({ visible, onClose, title, children }: SheetProps) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ flex: 1, backgroundColor: '#00000099' }}
      />
      <View
        style={{
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
            <CourtButton title="Done" onPress={onClose} variant="outline" height={40} />
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

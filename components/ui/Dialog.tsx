import { ReactNode, memo } from 'react';
import { Modal, Text, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';
import { CourtButton } from './Button';

export interface DialogProps {
  visible: boolean;
  title: string;
  message?: string;
  /** Optional picture above the title, e.g. a court showing a change of ends. */
  illustration?: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  cancelLabel?: string;
  onCancel?: () => void;
  destructive?: boolean;
}

function DialogComponent({
  visible,
  title,
  message,
  illustration,
  confirmLabel,
  onConfirm,
  cancelLabel,
  onCancel,
  destructive = false,
}: DialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel ?? onConfirm}>
      <View style={{ flex: 1, backgroundColor: '#000000aa', justifyContent: 'center', padding: 24 }}>
        <View
          style={{
            backgroundColor: COURT.surface,
            borderRadius: 22,
            padding: 22,
            alignItems: 'center',
          }}
        >
          {illustration}
          <Text
            style={{
              color: COURT.ink,
              fontSize: 24,
              fontWeight: '800',
              marginTop: illustration ? 12 : 0,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          {message && (
            <Text
              style={{
                color: COURT.inkMuted,
                fontSize: 15,
                marginTop: 6,
                textAlign: 'center',
                lineHeight: 21,
              }}
            >
              {message}
            </Text>
          )}
          <CourtButton
            title={confirmLabel}
            onPress={onConfirm}
            variant={destructive ? 'dangerText' : 'line'}
            style={{ alignSelf: 'stretch', marginTop: 18 }}
          />
          {cancelLabel && onCancel && (
            <CourtButton
              title={cancelLabel}
              onPress={onCancel}
              variant="outline"
              style={{ alignSelf: 'stretch', marginTop: 8 }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

export const Dialog = memo(DialogComponent);

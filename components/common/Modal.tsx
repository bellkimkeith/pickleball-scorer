import { Modal as RNModal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ReactNode } from 'react';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
}

export function Modal({ visible, onClose, children, dismissable = true }: ModalProps) {
  return (
    <RNModal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <Pressable
            className="flex-1"
            onPress={dismissable ? onClose : undefined}
          />
          <View className="bg-white rounded-t-3xl p-6 max-h-[80%]">{children}</View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

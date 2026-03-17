import { Modal as RNModal, View, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { ReactNode } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  dismissable?: boolean;
}

export function Modal({ visible, onClose, children, dismissable = true }: ModalProps) {
  const { isDarkMode } = useDarkMode();
  
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
          <View className={`rounded-t-3xl p-6 max-h-[80%] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { COURT } from '../../lib/theme/tokens';
import { CourtButton } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

export interface NameInputSheetProps {
  visible: boolean;
  title: string;
  placeholder: string;
  confirmLabel: string;
  initialValue?: string;
  onSubmit: (name: string) => void;
  onClose: () => void;
}

export function NameInputSheet({
  visible,
  title,
  placeholder,
  confirmLabel,
  initialValue = '',
  onSubmit,
  onClose,
}: NameInputSheetProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (visible) setValue(initialValue);
  }, [visible, initialValue]);

  const submit = () => {
    const name = value.trim();
    if (!name) return;
    onSubmit(name);
    setValue('');
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: 12, paddingBottom: 12 }}>
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={COURT.inkMuted}
          autoFocus
          autoCapitalize="words"
          maxLength={40}
          returnKeyType="done"
          onSubmitEditing={submit}
          accessibilityLabel={placeholder}
          style={{
            height: 52,
            borderRadius: 12,
            paddingHorizontal: 14,
            fontSize: 17,
            color: COURT.ink,
            backgroundColor: `${COURT.line}14`,
            borderWidth: 1,
            borderColor: `${COURT.line}26`,
          }}
        />
        <CourtButton title={confirmLabel} onPress={submit} disabled={value.trim().length === 0} />
      </View>
    </Sheet>
  );
}

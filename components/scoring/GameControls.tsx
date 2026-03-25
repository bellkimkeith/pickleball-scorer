import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { IconButton } from '../common/IconButton';
import { useDarkMode } from '../../hooks/useDarkMode';

interface GameControlsProps {
  onUndo: () => void;
  onSettings: () => void;
  onEndGame: () => void;
  onSoundboard?: () => void;
  canUndo?: boolean;
}

export function GameControls({
  onUndo,
  onSettings,
  onEndGame,
  onSoundboard,
  canUndo = true,
}: GameControlsProps) {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  
  return (
    <View className={`absolute bottom-0 left-0 right-0 px-6 pt-4 pb-6 ${
      isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
    }`}>
      <View className="flex-row justify-between items-center">
        {onSoundboard && (
          <IconButton 
            icon="musical-notes" 
            onPress={onSoundboard} 
            label="Sounds" 
          />
        )}
        <IconButton icon="arrow-undo" onPress={onUndo} label={t('game.undo')} disabled={!canUndo} />
        <IconButton icon="settings-outline" onPress={onSettings} label={t('common.settings')} />
        <IconButton icon="stop-circle" onPress={onEndGame} label={t('common.end')} color="red" />
      </View>
    </View>
  );
}

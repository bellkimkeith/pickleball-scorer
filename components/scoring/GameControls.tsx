import { View } from 'react-native';
import { IconButton } from '../common/IconButton';
import { useDarkMode } from '../../hooks/useDarkMode';

interface GameControlsProps {
  onUndo: () => void;
  onSettings: () => void;
  onEndGame: () => void;
  canUndo?: boolean;
}

export function GameControls({
  onUndo,
  onSettings,
  onEndGame,
  canUndo = true,
}: GameControlsProps) {
  const { isDarkMode } = useDarkMode();
  
  return (
    <View className={`absolute bottom-0 left-0 right-0 px-6 pt-4 pb-6 ${
      isDarkMode ? 'bg-gray-800 border-t border-gray-700' : 'bg-white border-t border-gray-200'
    }`}>
      <View className="flex-row justify-between items-center">
        <IconButton icon="arrow-undo" onPress={onUndo} label="Undo" disabled={!canUndo} />
        <IconButton icon="settings-outline" onPress={onSettings} label="Settings" />
        <IconButton icon="stop-circle" onPress={onEndGame} label="End" color="red" />
      </View>
    </View>
  );
}

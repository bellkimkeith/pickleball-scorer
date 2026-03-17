import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useGameStore } from '../../store/game-store';
import { GameMode } from '../../lib/types/game';

interface GameSetupProps {
  mode: GameMode;
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

export function GameSetup({ mode, visible, onComplete, onCancel }: GameSetupProps) {
  const startSinglesGame = useGameStore((state) => state.startSinglesGame);
  const startDoublesGame = useGameStore((state) => state.startDoublesGame);
  const settings = useGameStore((state) => state.settings);
  const updateSettings = useGameStore((state) => state.updateSettings);

  // Singles state
  const [player1Name, setPlayer1Name] = useState('Player 1');
  const [player2Name, setPlayer2Name] = useState('Player 2');

  // Doubles state
  const [team1Name, setTeam1Name] = useState('Team Alpha');
  const [team1Player1, setTeam1Player1] = useState('Player 1');
  const [team1Player2, setTeam1Player2] = useState('Player 2');
  const [team2Name, setTeam2Name] = useState('Team Bravo');
  const [team2Player1, setTeam2Player1] = useState('Player 3');
  const [team2Player2, setTeam2Player2] = useState('Player 4');

  const sanitizeName = (name: string, fallback: string): string => {
    const trimmed = name.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  };

  const handleStart = () => {
    if (mode === 'singles') {
      startSinglesGame(
        sanitizeName(player1Name, 'Player 1'),
        sanitizeName(player2Name, 'Player 2')
      );
    } else {
      startDoublesGame(
        sanitizeName(team1Name, 'Team 1'),
        [sanitizeName(team1Player1, 'Player 1'), sanitizeName(team1Player2, 'Player 2')],
        sanitizeName(team2Name, 'Team 2'),
        [sanitizeName(team2Player1, 'Player 3'), sanitizeName(team2Player2, 'Player 4')]
      );
    }
    onComplete();
  };

  return (
    <Modal visible={visible} onClose={onCancel} dismissable={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold mb-6">
          Setup {mode === 'singles' ? 'Singles' : 'Doubles'} Match
        </Text>

        {/* Game Type Selection */}
        <Text className="text-sm font-semibold text-gray-700 mb-2">Scoring Type</Text>
        <View className="flex-row gap-2 mb-4">
          <Pressable
            onPress={() => updateSettings({ gameType: 'rally' })}
            className={`flex-1 py-3 rounded-xl ${
              settings.gameType === 'rally' ? 'bg-primary-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                settings.gameType === 'rally' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Rally
            </Text>
          </Pressable>
          <Pressable
            onPress={() => updateSettings({ gameType: 'sideout' })}
            className={`flex-1 py-3 rounded-xl ${
              settings.gameType === 'sideout' ? 'bg-primary-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                settings.gameType === 'sideout' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Sideout
            </Text>
          </Pressable>
        </View>

        {mode === 'singles' ? (
          <>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Player 1</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 1 name"
              value={player1Name}
              onChangeText={setPlayer1Name}
              maxLength={20}
              accessibilityLabel="Player 1 name"
              style={{ textAlignVertical: 'center' }}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Player 2</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 2 name"
              value={player2Name}
              onChangeText={setPlayer2Name}
              maxLength={20}
              accessibilityLabel="Player 2 name"
              style={{ textAlignVertical: 'center' }}
            />
          </>
        ) : (
          <>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Team 1</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Team 1 name"
              value={team1Name}
              onChangeText={setTeam1Name}
              maxLength={20}
              accessibilityLabel="Team 1 name"
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Team 1 Player 1 name"
              value={team1Player1}
              onChangeText={setTeam1Player1}
              maxLength={20}
              accessibilityLabel="Team 1 Player 1 name"
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Team 1 Player 2 name"
              value={team1Player2}
              onChangeText={setTeam1Player2}
              maxLength={20}
              accessibilityLabel="Team 1 Player 2 name"
              style={{ textAlignVertical: 'center' }}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Team 2</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Team 2 name"
              value={team2Name}
              onChangeText={setTeam2Name}
              maxLength={20}
              accessibilityLabel="Team 2 name"
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Team 2 Player 1 name"
              value={team2Player1}
              onChangeText={setTeam2Player1}
              maxLength={20}
              accessibilityLabel="Team 2 Player 1 name"
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Team 2 Player 2 name"
              value={team2Player2}
              onChangeText={setTeam2Player2}
              maxLength={20}
              accessibilityLabel="Team 2 Player 2 name"
              style={{ textAlignVertical: 'center' }}
            />
          </>
        )}

        <View className="flex-row gap-3 mt-2">
          <View className="flex-1">
            <Button title="Cancel" onPress={onCancel} variant="secondary" />
          </View>
          <View className="flex-1">
            <Button title="Start Match" onPress={handleStart} variant="primary" />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
}

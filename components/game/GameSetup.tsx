import { View, Text, TextInput, ScrollView } from 'react-native';
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

  const handleStart = () => {
    if (mode === 'singles') {
      startSinglesGame(player1Name, player2Name);
    } else {
      startDoublesGame(team1Name, [team1Player1, team1Player2], team2Name, [team2Player1, team2Player2]);
    }
    onComplete();
  };

  return (
    <Modal visible={visible} onClose={onCancel} dismissable={false}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-2xl font-bold mb-6">
          Setup {mode === 'singles' ? 'Singles' : 'Doubles'} Match
        </Text>

        {mode === 'singles' ? (
          <>
            <Text className="text-sm font-semibold text-gray-700 mb-2">Player 1</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 1 name"
              value={player1Name}
              onChangeText={setPlayer1Name}
              style={{ textAlignVertical: 'center' }}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Player 2</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 2 name"
              value={player2Name}
              onChangeText={setPlayer2Name}
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
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Player 1 name"
              value={team1Player1}
              onChangeText={setTeam1Player1}
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 2 name"
              value={team1Player2}
              onChangeText={setTeam1Player2}
              style={{ textAlignVertical: 'center' }}
            />

            <Text className="text-sm font-semibold text-gray-700 mb-2">Team 2</Text>
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Team 2 name"
              value={team2Name}
              onChangeText={setTeam2Name}
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-2 text-base"
              placeholder="Player 3 name"
              value={team2Player1}
              onChangeText={setTeam2Player1}
              style={{ textAlignVertical: 'center' }}
            />
            <TextInput
              className="bg-gray-100 rounded-xl px-4 h-14 mb-4 text-base"
              placeholder="Player 4 name"
              value={team2Player2}
              onChangeText={setTeam2Player2}
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

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';
import { GameMode } from '../../lib/types/game';
import { PaddleColor } from '../../lib/types/queue';
import { useGameStore } from '../../store/game-store';
import { useSessionStore } from '../../store/session-store';
import { CourtDiagram, CourtSlots } from '../court/CourtDiagram';
import { NameInputSheet } from '../queue/NameInputSheet';
import { BackButton } from '../ui/BackButton';
import { CourtButton } from '../ui/Button';
import { Segmented } from '../ui/Controls';
import { ListGroup, ListRow } from '../ui/ListGroup';

interface GameSetupProps {
  mode: GameMode;
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
}

interface Slot {
  name: string;
  color: PaddleColor;
}

export function GameSetup({ mode, visible, onComplete, onCancel }: GameSetupProps) {
  const startSinglesGame = useGameStore(state => state.startSinglesGame);
  const startDoublesGame = useGameStore(state => state.startDoublesGame);
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);
  const savedPlayers = useSessionStore(state => state.savedPlayers);
  const addSavedPlayer = useSessionStore(state => state.addSavedPlayer);
  const { t } = useTranslation();

  const slotCount = mode === 'singles' ? 2 : 4;
  const [slots, setSlots] = useState<(Slot | null)[]>(Array(4).fill(null));
  const [editing, setEditing] = useState<number | null>(null);

  if (!visible) return null;

  /** Slot order on the diagram: near-top, near-bottom, far-top, far-bottom. */
  const diagramSlots: CourtSlots =
    mode === 'singles'
      ? [
          slots[0] ? { id: 's0', name: slots[0]!.name, color: slots[0]!.color } : null,
          null,
          slots[1] ? { id: 's1', name: slots[1]!.name, color: slots[1]!.color } : null,
          null,
        ]
      : ([0, 1, 2, 3].map(i =>
          slots[i] ? { id: `s${i}`, name: slots[i]!.name, color: slots[i]!.color } : null,
        ) as CourtSlots);

  const diagramIndexToSlot = (index: number): number =>
    mode === 'singles' ? (index === 0 ? 0 : 1) : index;

  const setSlot = (index: number, name: string) => {
    const existing = savedPlayers.find(p => p.name.toLowerCase() === name.toLowerCase());
    const player = existing ?? addSavedPlayer(name);
    setSlots(current => {
      const next = [...current];
      next[index] = { name: player.name, color: player.color };
      return next;
    });
  };

  const filled = slots.slice(0, slotCount).filter(Boolean).length;
  const nameAt = (index: number, fallback: string) => slots[index]?.name ?? fallback;

  const start = () => {
    if (mode === 'singles') {
      startSinglesGame(nameAt(0, t('game.player1')), nameAt(1, t('game.player2')));
    } else {
      const team1: [string, string] = [nameAt(0, t('game.player1')), nameAt(1, t('game.player2'))];
      const team2: [string, string] = [nameAt(2, t('game.team2Player1')), nameAt(3, t('game.team2Player2'))];
      startDoublesGame(team1.join(' & '), team1, team2.join(' & '), team2);
    }
    onComplete();
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <BackButton label={t('common.cancel')} onPress={onCancel} />

        <Text style={{ color: COURT.ink, fontSize: 32, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4 }}>
          {t('game.setupMatch', { mode: mode === 'singles' ? t('home.singles') : t('home.doubles') })}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 14 }}>
          {t('game.tapToName')}
        </Text>

        <View style={{ paddingHorizontal: 16 }}>
          <Segmented
            options={[
              { value: 'sideout', label: t('game.sideout') },
              { value: 'rally', label: t('game.rally') },
            ]}
            value={settings.gameType}
            onChange={value => updateSettings({ gameType: value })}
            accessibilityLabel={t('game.scoringType')}
          />
        </View>
        <Text style={{ color: COURT.inkMuted, fontSize: 13, paddingHorizontal: 16, paddingTop: 8 }}>
          {settings.gameType === 'rally' ? t('game.rallyDesc') : t('game.sideoutDesc')}
        </Text>

        <View style={{ paddingHorizontal: 12, paddingTop: 22 }}>
          <CourtDiagram
            players={diagramSlots}
            fillableSlots={mode === 'singles' ? [0, 2] : undefined}
            onSlotPress={index => setEditing(diagramIndexToSlot(index))}
          />
        </View>

        {savedPlayers.length > 0 && (
          <>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '700', paddingHorizontal: 16, paddingTop: 20 }}>
              {t('home.savedPlayers')}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 10 }}>
              {savedPlayers.map(player => (
                <Pressable
                  key={player.id}
                  onPress={() => {
                    const firstEmpty = slots.slice(0, slotCount).findIndex(slot => slot === null);
                    if (firstEmpty >= 0) setSlot(firstEmpty, player.name);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={player.name}
                >
                  <View
                    style={{
                      height: 38,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: `${COURT.line}14`,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: PADDLE_FACE[player.color] }} />
                    <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600' }}>{player.name}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <ListGroup style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            label={t('game.gameTo')}
            value={`${settings.winningScore}${settings.winByTwo ? ` · ${t('settings.winByTwo')}` : ''}`}
            chevron
            onPress={() =>
              updateSettings({
                winningScore: settings.winningScore === 11 ? 15 : settings.winningScore === 15 ? 21 : 11,
              })
            }
          />
        </ListGroup>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 30 }}>
        <CourtButton title={t('game.startMatch')} onPress={start} height={52} />
        {filled < slotCount && (
          <Text style={{ color: COURT.inkMuted, fontSize: 13, textAlign: 'center', paddingTop: 8 }}>
            {t('game.unnamedPlayers')}
          </Text>
        )}
      </View>

      <NameInputSheet
        visible={editing !== null}
        title={t('game.playerNamePlaceholder', { player: '' }).trim() || t('openPlay.namePlaceholder')}
        placeholder={t('openPlay.namePlaceholder')}
        confirmLabel={t('common.start')}
        initialValue={editing !== null ? (slots[editing]?.name ?? '') : ''}
        onSubmit={name => {
          if (editing !== null) setSlot(editing, name);
          setEditing(null);
        }}
        onClose={() => setEditing(null)}
      />
    </SafeAreaView>
  );
}

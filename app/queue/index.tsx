import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paddle } from '../../components/court/Paddle';
import { NameInputSheet } from '../../components/queue/NameInputSheet';
import { BackButton } from '../../components/ui/BackButton';
import { CourtButton } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Controls';
import { ListGroup, ListRow } from '../../components/ui/ListGroup';
import { Sheet } from '../../components/ui/Sheet';
import { COURT } from '../../lib/theme/tokens';
import { useSessionStore } from '../../store/session-store';

export default function CheckInScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const savedPlayers = useSessionStore(state => state.savedPlayers);
  const savedGroups = useSessionStore(state => state.savedGroups);
  const defaultCourtCount = useSessionStore(state => state.defaultCourtCount);
  const addSavedPlayer = useSessionStore(state => state.addSavedPlayer);
  const deleteSavedPlayer = useSessionStore(state => state.deleteSavedPlayer);
  const startSession = useSessionStore(state => state.startSession);
  const lock = useSessionStore(state => state.lock);

  const [checkedIn, setCheckedIn] = useState<string[]>([]);
  const [courts, setCourts] = useState(defaultCourtCount);
  const [pairs, setPairs] = useState<[string, string][]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [managing, setManaging] = useState<string | null>(null);
  const [pairSheetOpen, setPairSheetOpen] = useState(false);
  const [pairingWith, setPairingWith] = useState<string | null>(null);

  const pairedIds = useMemo(() => new Set(pairs.flat()), [pairs]);

  const partnerNameFor = (id: string): string | undefined => {
    const pair = pairs.find(p => p.includes(id));
    if (!pair) return undefined;
    const partnerId = pair[0] === id ? pair[1] : pair[0];
    return savedPlayers.find(p => p.id === partnerId)?.name;
  };

  const toggle = (id: string) =>
    setCheckedIn(current =>
      current.includes(id) ? current.filter(x => x !== id) : [...current, id],
    );

  const addAndCheckIn = (name: string) => {
    const player = addSavedPlayer(name);
    setCheckedIn(current => [...current, player.id]);
    setAddOpen(false);
  };

  const pairLabel = pairs
    .map(([a, b]) =>
      [savedPlayers.find(p => p.id === a)?.name, savedPlayers.find(p => p.id === b)?.name]
        .filter(Boolean)
        .join(' + '),
    )
    .join(', ');

  const start = () => {
    startSession(checkedIn, courts);
    pairs.forEach(([a, b]) => lock(a, b));
    router.replace('/queue/session');
  };

  const managedPlayer = savedPlayers.find(p => p.id === managing);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <BackButton />

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4 }}>
          {t('openPlay.whosHere')}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 14 }}>
          {t('openPlay.whosHereDesc')}
        </Text>

        <Pressable
          onPress={() => setAddOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('openPlay.addName')}
          style={{
            marginHorizontal: 12,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${COURT.line}14`,
            justifyContent: 'center',
            paddingHorizontal: 14,
          }}
        >
          <Text style={{ color: COURT.inkMuted, fontSize: 16 }}>＋ {t('openPlay.addName')}</Text>
        </Pressable>

        {savedGroups.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12, paddingTop: 12 }}>
            {savedGroups.map(group => (
              <Pressable
                key={group.id}
                onPress={() => setCheckedIn(Array.from(new Set([...checkedIn, ...group.playerIds])))}
                accessibilityRole="button"
                accessibilityLabel={group.name}
                style={{
                  height: 38,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: `${COURT.line}14`,
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600' }}>{group.name}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {savedPlayers.length === 0 ? (
          <Text
            style={{
              color: COURT.inkMuted,
              fontSize: 15,
              lineHeight: 21,
              paddingHorizontal: 16,
              paddingTop: 20,
            }}
          >
            {t('openPlay.noSavedPlayers')}
          </Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 14, paddingTop: 14 }}>
            {savedPlayers.map(player => (
              <Paddle
                key={player.id}
                name={player.name}
                color={player.color}
                size="md"
                ghost={!checkedIn.includes(player.id)}
                note={partnerNameFor(player.id)}
                onPress={() => toggle(player.id)}
                onLongPress={() => setManaging(player.id)}
              />
            ))}
          </View>
        )}

        <ListGroup style={{ marginHorizontal: 12, marginTop: 20 }}>
          <ListRow
            label={t('openPlay.courts')}
            right={
              <Stepper
                value={courts}
                min={1}
                max={6}
                onChange={setCourts}
                accessibilityLabel={t('openPlay.courts')}
              />
            }
          />
          <ListRow
            label={t('openPlay.fixedPairs')}
            value={pairs.length > 0 ? pairLabel : t('openPlay.noPairs')}
            chevron
            onPress={() => {
              setPairingWith(null);
              setPairSheetOpen(true);
            }}
            disabled={checkedIn.length < 2}
            disabledReason={checkedIn.length < 2 ? t('openPlay.pairsHint') : undefined}
          />
          <ListRow label={t('openPlay.lateArrivals')} value={t('openPlay.lateArrivalsValue')} />
        </ListGroup>

        <Text
          style={{
            color: COURT.inkMuted,
            fontSize: 13,
            lineHeight: 19,
            paddingHorizontal: 18,
            paddingTop: 8,
          }}
        >
          {t('openPlay.lateArrivalsDesc')}
        </Text>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 30 }}>
        <CourtButton
          title={t('openPlay.start', { count: checkedIn.length })}
          onPress={start}
          disabled={checkedIn.length < 4}
          height={52}
        />
        {checkedIn.length < 4 && (
          <Text style={{ color: COURT.inkMuted, fontSize: 13, textAlign: 'center', paddingTop: 8 }}>
            {t('openPlay.startHint')}
          </Text>
        )}
      </View>

      <NameInputSheet
        visible={addOpen}
        title={t('openPlay.addName')}
        placeholder={t('openPlay.namePlaceholder')}
        confirmLabel={t('openPlay.addName')}
        onSubmit={addAndCheckIn}
        onClose={() => setAddOpen(false)}
      />

      <Sheet visible={managing !== null} onClose={() => setManaging(null)} title={managedPlayer?.name}>
        <CourtButton
          title={t('openPlay.removePlayer')}
          variant="dangerText"
          onPress={() => {
            if (managing) {
              deleteSavedPlayer(managing);
              setCheckedIn(current => current.filter(id => id !== managing));
              setPairs(current => current.filter(pair => !pair.includes(managing)));
            }
            setManaging(null);
          }}
        />
      </Sheet>

      <Sheet
        visible={pairSheetOpen}
        onClose={() => {
          setPairSheetOpen(false);
          setPairingWith(null);
        }}
        title={t('openPlay.pickPartner')}
      >
        <View style={{ gap: 8 }}>
          {checkedIn
            .filter(id => !pairedIds.has(id))
            .map(id => {
              const player = savedPlayers.find(p => p.id === id);
              if (!player) return null;
              return (
                <CourtButton
                  key={id}
                  title={player.name}
                  variant={pairingWith === id ? 'line' : 'deep'}
                  onPress={() => {
                    if (pairingWith === null) {
                      setPairingWith(id);
                      return;
                    }
                    setPairs(current => [...current, [pairingWith, id]]);
                    setPairingWith(null);
                    setPairSheetOpen(false);
                  }}
                />
              );
            })}
        </View>
      </Sheet>
    </SafeAreaView>
  );
}

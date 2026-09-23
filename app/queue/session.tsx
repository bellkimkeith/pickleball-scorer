import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CourtDiagram, CourtSlots } from '../../components/court/CourtDiagram';
import { FlightPlayer, PaddleFlight } from '../../components/court/PaddleFlight';
import { PaddleRack, RackPlayer } from '../../components/court/PaddleRack';
import { NameInputSheet } from '../../components/queue/NameInputSheet';
import { PlayerSheet } from '../../components/queue/PlayerSheet';
import { BackButton } from '../../components/ui/BackButton';
import { CourtButton } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { COURT } from '../../lib/theme/tokens';
import { availablePlayers, canUndo, pickNextMatch } from '../../lib/queue/engine';
import { Match, SessionPlayer } from '../../lib/types/queue';
import { useSessionStore } from '../../store/session-store';

function elapsed(from: number, now: number): string {
  const seconds = Math.max(0, Math.floor((now - from) / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function SessionScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const session = useSessionStore(state => state.activeSession);
  const matchDone = useSessionStore(state => state.matchDone);
  const addToSession = useSessionStore(state => state.addToSession);
  const undo = useSessionStore(state => state.undo);
  const finishSession = useSessionStore(state => state.finishSession);

  const [now, setNow] = useState(Date.now());
  const [addOpen, setAddOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [openPlayerId, setOpenPlayerId] = useState<string | null>(null);
  const [flight, setFlight] = useState<FlightPlayer[]>([]);

  // Measured at the moment a match is called, so the paddles can travel from
  // where they actually sit in the rack to where they land on the court.
  const rootRef = useRef<View>(null);
  const rackRef = useRef<View>(null);
  const courtRefs = useRef<Record<number, View | null>>({});

  const measure = (node: View | null) =>
    new Promise<{ x: number; y: number; width: number; height: number } | null>(resolve => {
      if (!node) return resolve(null);
      node.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
    });

  /** Fly the four who are next from the rack onto the court that just freed up. */
  const flyPaddlesToCourt = async (courtIndex: number, travelling: RackPlayer[]) => {
    const [root, rack, court] = await Promise.all([
      measure(rootRef.current),
      measure(rackRef.current),
      measure(courtRefs.current[courtIndex] ?? null),
    ]);
    if (!root || !rack || !court || travelling.length === 0) return;

    const slots = [
      { x: court.x + 14, y: court.y + 16 },
      { x: court.x + 14, y: court.y + court.height - 58 },
      { x: court.x + court.width - 62, y: court.y + 16 },
      { x: court.x + court.width - 62, y: court.y + court.height - 58 },
    ];

    setFlight(
      travelling.slice(0, 4).map((player, index) => ({
        id: player.id,
        name: player.name,
        color: player.color,
        games: player.games,
        from: { x: rack.x + 12 + index * 56 - root.x, y: rack.y + 20 - root.y },
        to: { x: slots[index].x - root.x, y: slots[index].y - root.y },
      })),
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Only the focused screen may redirect. A stale copy of this screen can stay
  // mounted in the stack, and it would otherwise send the user back to check-in
  // the moment a session ends.
  useFocusEffect(
    useCallback(() => {
      if (!useSessionStore.getState().activeSession) router.replace('/queue');
    }, [router]),
  );

  const rack = useMemo(() => {
    if (!session)
      return {
        next: [] as RackPlayer[],
        waiting: [] as RackPlayer[],
        resting: [] as RackPlayer[],
        pairs: [] as [string, string][],
      };

    const byId = new Map(session.players.map(p => [p.id, p]));
    const toRack = (player: SessionPlayer): RackPlayer => ({
      id: player.id,
      name: player.name,
      color: player.color,
      games: player.gamesPlayed,
      note: player.queueCount > player.gamesPlayed ? t('openPlay.late') : undefined,
    });

    const proposal = pickNextMatch(session, Date.now());
    const nextIds = proposal ? [...proposal.team1, ...proposal.team2] : [];
    const next = nextIds.map(id => byId.get(id)).filter((p): p is SessionPlayer => !!p).map(toRack);

    const waiting = availablePlayers(session)
      .filter(p => !nextIds.includes(p.id))
      .sort((a, b) => a.queueCount - b.queueCount || a.waitingSince - b.waitingSince)
      .map(toRack);

    // Sitting out stays on the rack, hollow: it is the only way back to their
    // sheet, and so to "Come back". The heading above the row says they are
    // sitting out, so the paddle does not repeat it.
    const resting = session.players.filter(p => p.status === 'sitting_out').map(toRack);

    const seen = new Set<string>();
    const pairs: [string, string][] = [];
    for (const player of session.players) {
      if (player.lockedWith && !seen.has(player.id)) {
        seen.add(player.id);
        seen.add(player.lockedWith);
        pairs.push([player.id, player.lockedWith]);
      }
    }

    return { next, waiting, resting, pairs };
  }, [session, t]);

  if (!session) return null;

  const activePlayers = session.players.filter(p => p.status !== 'left');
  const finishedGames = session.matches.filter(m => m.endedAt).length;
  const byId = new Map(session.players.map(p => [p.id, p]));

  const slotsFor = (match: Match): CourtSlots => {
    const slot = (id: string) => {
      const player = byId.get(id);
      return player ? { id: player.id, name: player.name, color: player.color } : null;
    };
    return [slot(match.team1[0]), slot(match.team1[1]), slot(match.team2[0]), slot(match.team2[1])];
  };

  const endSessionNow = () => {
    setEndOpen(false);
    finishSession();
    router.replace('/queue/summary');
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']} ref={rootRef} collapsable={false}>
      <StatusBar style="light" />

      {/* The Add player / Undo bar floats over the list, so the rack needs room
          to scroll clear of it — otherwise its last row can never be read. */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: 16, paddingTop: 6 }}>
          <BackButton onPress={() => router.replace('/')} />
          <Pressable onPress={() => setEndOpen(true)} accessibilityRole="button" accessibilityLabel={t('openPlay.end')} hitSlop={10}>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '600' }}>{t('openPlay.end')}</Text>
          </Pressable>
        </View>

        <Text style={{ color: COURT.ink, fontSize: 34, fontWeight: '700', paddingHorizontal: 16, paddingTop: 4 }}>
          {t('openPlay.title')}
        </Text>
        <Text style={{ color: COURT.inkMuted, fontSize: 15, paddingHorizontal: 16, paddingTop: 2, paddingBottom: 18 }}>
          {t('openPlay.meta', {
            players: t('openPlay.playersCount', { count: activePlayers.length }),
            courts: t('openPlay.courtsCount', { count: session.courtCount }),
            games: t('openPlay.gamesCount', { count: finishedGames }),
          })}
        </Text>

        <View style={{ paddingHorizontal: 12, gap: 20 }}>
          {session.courts.map((matchId, index) => {
            const match = matchId ? session.matches.find(m => m.id === matchId && !m.endedAt) : undefined;
            return (
              <View key={index}>
                <View ref={node => { courtRefs.current[index] = node; }} collapsable={false}>
                  <CourtDiagram
                    players={match ? slotsFor(match) : [null, null, null, null]}
                    courtLabel={t('openPlay.court', { number: index + 1 })}
                    clock={match ? elapsed(match.calledAt, now) : undefined}
                    emptyLabel={t('openPlay.waiting')}
                    animateEntry
                    onPlayerPress={match ? setOpenPlayerId : undefined}
                    style={{ marginTop: 12 }}
                  />
                </View>
                {match && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <CourtButton
                      title={t('openPlay.matchDone')}
                      onPress={() => {
                        const travelling = rack.next;
                        matchDone(match.id);
                        flyPaddlesToCourt(index, travelling);
                      }}
                      style={{ flex: 1 }}
                      height={48}
                    />
                    <CourtButton
                      title={t('openPlay.score')}
                      variant="outline"
                      onPress={() => router.push(`/(game)/doubles?sessionMatchId=${match.id}`)}
                      style={{ width: 100 }}
                      height={48}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 16, paddingTop: 22, paddingBottom: 8 }}>
          <Text style={{ color: COURT.ink, fontSize: 20, fontWeight: '700' }}>{t('openPlay.rack')}</Text>
          <Text style={{ color: COURT.inkMuted, fontSize: 13 }}>{t('openPlay.rackHint')}</Text>
        </View>

        <View style={{ paddingHorizontal: 12 }} ref={rackRef} collapsable={false}>
          <PaddleRack
            next={rack.next}
            waiting={rack.waiting}
            resting={rack.resting}
            restingLabel={t('openPlay.sittingOutSection')}
            lockedPairs={rack.pairs}
            onPlayerPress={setOpenPlayerId}
            emptyLabel={t('openPlay.rackEmpty')}
            notEnoughLabel={t('openPlay.notEnough')}
          />
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 30 }}>
        <CourtButton
          title={t('openPlay.addPlayer')}
          variant="deep"
          icon="add"
          onPress={() => setAddOpen(true)}
          style={{ flex: 1 }}
          height={52}
        />
        <CourtButton
          title={t('openPlay.undo')}
          variant="outline"
          icon="arrow-undo"
          onPress={undo}
          disabled={!canUndo(session)}
          style={{ width: 130 }}
          height={52}
        />
      </View>

      <NameInputSheet
        visible={addOpen}
        title={t('openPlay.addPlayer')}
        placeholder={t('openPlay.namePlaceholder')}
        confirmLabel={t('openPlay.addPlayer')}
        onSubmit={name => {
          addToSession(name);
          setAddOpen(false);
        }}
        onClose={() => setAddOpen(false)}
      />

      <PlayerSheet playerId={openPlayerId} onClose={() => setOpenPlayerId(null)} />

      <PaddleFlight players={flight} onDone={() => setFlight([])} />

      <Dialog
        visible={endOpen}
        title={t('openPlay.endTitle')}
        message={t('openPlay.endMessage')}
        confirmLabel={t('openPlay.endConfirm')}
        cancelLabel={t('openPlay.keepPlaying')}
        onConfirm={endSessionNow}
        onCancel={() => setEndOpen(false)}
        destructive
      />
    </SafeAreaView>
  );
}

import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { explainQueuePosition } from '../../lib/queue/engine';
import { COURT } from '../../lib/theme/tokens';
import { useSessionStore } from '../../store/session-store';
import { Paddle } from '../court/Paddle';
import { CourtButton } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { ListGroup, ListRow } from '../ui/ListGroup';
import { Sheet } from '../ui/Sheet';

export interface PlayerSheetProps {
  playerId: string | null;
  onClose: () => void;
}

function clockTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function PlayerSheet({ playerId, onClose }: PlayerSheetProps) {
  const { t } = useTranslation();
  const session = useSessionStore(state => state.activeSession);
  const sitOut = useSessionStore(state => state.sitOut);
  const comeBack = useSessionStore(state => state.comeBack);
  const removeFromSession = useSessionStore(state => state.removeFromSession);
  const lock = useSessionStore(state => state.lock);
  const unlock = useSessionStore(state => state.unlock);

  const [confirmRemove, setConfirmRemove] = useState(false);
  const [picking, setPicking] = useState(false);

  const player = session?.players.find(p => p.id === playerId) ?? null;

  const onCourt = useMemo(() => {
    if (!session || !playerId) return false;
    return session.matches.some(
      m => !m.endedAt && [...m.team1, ...m.team2].includes(playerId),
    );
  }, [session, playerId]);

  const why = session && playerId ? explainQueuePosition(session, playerId) : null;
  const partner = player?.lockedWith
    ? session?.players.find(p => p.id === player.lockedWith)
    : undefined;

  const lastPartnerName = why?.lastPartner
    ? session?.players.find(p => p.id === why.lastPartner)?.name
    : undefined;

  const lockCandidates = (session?.players ?? []).filter(
    p => p.id !== playerId && p.status === 'active' && !p.lockedWith,
  );

  if (!player || !session) {
    return <Sheet visible={false} onClose={onClose}>{null}</Sheet>;
  }

  const close = () => {
    setPicking(false);
    onClose();
  };

  return (
    <>
      <Sheet visible={playerId !== null} onClose={close} title={player.name}>
        <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center', paddingBottom: 4 }}>
          <Paddle name={player.name} color={player.color} games={player.gamesPlayed} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '600' }}>
              {t('openPlay.gamesPlayed', { count: player.gamesPlayed })}
            </Text>
            <Text style={{ color: COURT.inkMuted, fontSize: 15, marginTop: 2 }}>
              {t('openPlay.arrived', { time: clockTime(player.arrivedAt) })}
            </Text>
            {why?.joinedAtGroupLevel && (
              <Text
                style={{
                  color: '#dce8f5',
                  fontSize: 13,
                  marginTop: 8,
                  backgroundColor: `${COURT.line}12`,
                  padding: 8,
                  borderRadius: 8,
                  lineHeight: 18,
                }}
              >
                {t('openPlay.joinedAtGroupLevel', { count: why.queueCount })}
              </Text>
            )}
            {player.status === 'sitting_out' && (
              <Text style={{ color: COURT.inkMuted, fontSize: 13, marginTop: 6 }}>
                {t('openPlay.sittingOut')}
              </Text>
            )}
          </View>
        </View>

        <Text style={{ color: COURT.ink, fontSize: 17, fontWeight: '700', marginTop: 18, marginBottom: 8 }}>
          {t('openPlay.whyNext')}
        </Text>

        <ListGroup>
          <ListRow
            label={t('openPlay.fewestGames')}
            value={
              why?.isAtLowestCount
                ? t('openPlay.tiedAt', { count: why.queueCount })
                : t('openPlay.behindBy', { count: (why?.queueCount ?? 0) - (why?.lowestQueueCount ?? 0) })
            }
          />
          <ListRow label={t('openPlay.waitingSince')} value={clockTime(player.waitingSince)} />
          <ListRow
            label={t('openPlay.partneredWith')}
            value={lastPartnerName ?? t('openPlay.nobodyYet')}
          />
        </ListGroup>

        <View style={{ gap: 10, marginTop: 18, paddingBottom: 6 }}>
          {player.status === 'sitting_out' ? (
            <CourtButton
              title={t('openPlay.comeBack')}
              onPress={() => {
                comeBack(player.id);
                close();
              }}
            />
          ) : (
            <CourtButton
              title={t('openPlay.sitOut')}
              onPress={() => {
                sitOut(player.id);
                close();
              }}
              disabled={onCourt}
            />
          )}

          {partner ? (
            <CourtButton
              title={t('openPlay.unlockPartner', { name: partner.name })}
              variant="deep"
              onPress={() => {
                unlock(player.id);
                close();
              }}
            />
          ) : (
            <CourtButton
              title={t('openPlay.lockPartner')}
              variant="deep"
              onPress={() => setPicking(true)}
              disabled={lockCandidates.length === 0}
            />
          )}

          <CourtButton
            title={t('openPlay.removePlayer')}
            variant="dangerText"
            onPress={() => setConfirmRemove(true)}
            disabled={onCourt}
          />

          {onCourt && (
            <Text style={{ color: COURT.inkMuted, fontSize: 13, textAlign: 'center' }}>
              {t('openPlay.onCourt')}
            </Text>
          )}
        </View>
      </Sheet>

      <Sheet visible={picking} onClose={() => setPicking(false)} title={t('openPlay.pickPartner')}>
        <View style={{ gap: 8, paddingBottom: 8 }}>
          {lockCandidates.map(candidate => (
            <CourtButton
              key={candidate.id}
              title={candidate.name}
              variant="deep"
              onPress={() => {
                lock(player.id, candidate.id);
                setPicking(false);
                close();
              }}
            />
          ))}
        </View>
      </Sheet>

      <Dialog
        visible={confirmRemove}
        title={t('openPlay.removeTitle', { name: player.name })}
        message={t('openPlay.removeMessage')}
        confirmLabel={t('openPlay.removePlayer')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          removeFromSession(player.id);
          setConfirmRemove(false);
          close();
        }}
        onCancel={() => setConfirmRemove(false)}
        destructive
      />
    </>
  );
}

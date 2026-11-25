import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { canSaveScore, scoreInTeamOrder, suggestedWinnerPoints } from '../../lib/queue/quick-score';
import { COURT } from '../../lib/theme/tokens';
import { Match } from '../../lib/types/queue';
import { useGameStore } from '../../store/game-store';
import { CourtButton } from '../ui/Button';
import { Stepper } from '../ui/Controls';
import { Sheet } from '../ui/Sheet';

export interface QuickScoreSheetProps {
  /** The match being finished; null hides the sheet. */
  match: Match | null;
  courtNumber: number;
  /** Team 1, then team 2, e.g. "Ana & Ben". */
  teamNames: [string, string];
  onSave: (score: [number, number]) => void;
  onSkip: () => void;
  /** Leaves the match on court. */
  onClose: () => void;
}

/**
 * Two or three taps to record a finished game: who won, then the losing
 * team's points. The parent keys this by match id, so nothing picked for one
 * court carries over to the next.
 */
export function QuickScoreSheet({ match, courtNumber, teamNames, onSave, onSkip, onClose }: QuickScoreSheetProps) {
  const { t } = useTranslation();
  const settings = useGameStore(state => state.settings);

  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [loserPoints, setLoserPoints] = useState<number | null>(null);
  const [winnerPoints, setWinnerPoints] = useState<number>(settings.winningScore);
  // A winner's score set by hand sticks until another chip is chosen.
  const [winnerEdited, setWinnerEdited] = useState(false);

  const chooseLoserPoints = (points: number, fromChip: boolean) => {
    setLoserPoints(points);
    if (fromChip || !winnerEdited) {
      setWinnerEdited(false);
      setWinnerPoints(suggestedWinnerPoints(points, settings));
    }
  };

  const ready = winner !== null && loserPoints !== null && canSaveScore(winnerPoints, loserPoints);
  const chips = Array.from({ length: settings.winningScore }, (_, points) => points);

  return (
    <Sheet visible={match !== null} onClose={onClose}>
      <Text style={{ color: COURT.ink, fontSize: 24, fontWeight: '700', marginBottom: 14 }}>
        {t('standings.whoWon', { number: courtNumber })}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {([1, 2] as const).map(team => (
          <CourtButton
            key={team}
            title={teamNames[team - 1]}
            variant={winner === team ? 'line' : 'outline'}
            onPress={() => setWinner(team)}
            style={{ flex: 1 }}
            height={56}
          />
        ))}
      </View>

      <Text style={{ color: COURT.inkMuted, fontSize: 15, fontWeight: '600', marginTop: 20, marginBottom: 10 }}>
        {t('standings.losingPoints')}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {chips.map(points => {
          const selected = loserPoints === points;
          return (
            <Pressable
              key={points}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                chooseLoserPoints(points, true);
              }}
              accessibilityRole="button"
              accessibilityLabel={`${t('standings.losingPoints')}: ${points}`}
              accessibilityState={{ selected }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: selected ? COURT.line : `${COURT.line}14`,
              }}
            >
              <Text
                style={{
                  color: selected ? COURT.lineText : COURT.ink,
                  fontSize: 17,
                  fontWeight: '700',
                  fontVariant: ['tabular-nums'],
                }}
              >
                {points}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loserPoints !== null && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 20 }}>
          <Stepper
            value={winnerPoints}
            min={1}
            max={99}
            onChange={points => {
              setWinnerEdited(true);
              setWinnerPoints(points);
            }}
            accessibilityLabel={t('standings.winnerPoints')}
          />
          <Text style={{ color: COURT.ink, fontSize: 22, fontWeight: '700' }}>–</Text>
          <Stepper
            value={loserPoints}
            min={0}
            max={98}
            onChange={points => chooseLoserPoints(points, false)}
            accessibilityLabel={t('standings.losingPoints')}
          />
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 22 }}>
        <CourtButton
          title={t('standings.saveScore')}
          disabled={!ready}
          onPress={() => {
            if (winner === null || loserPoints === null) return;
            onSave(scoreInTeamOrder(winner, winnerPoints, loserPoints));
          }}
          style={{ flex: 1 }}
          height={52}
        />
        <CourtButton title={t('standings.skip')} variant="outline" onPress={onSkip} style={{ minWidth: 110 }} height={52} />
      </View>
    </Sheet>
  );
}

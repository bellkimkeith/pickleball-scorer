import { memo } from 'react';
import { Text, TextStyle, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPlusMinus, formatRecord, Standings, StandingRow } from '../../lib/queue/standings';
import { COURT, PADDLE_FACE } from '../../lib/theme/tokens';

export interface StandingsTableProps {
  standings: Standings;
  /** Extra note after a name, e.g. "arrived 7:40". */
  noteFor?: (playerId: string) => string | undefined;
}

const RANK_WIDTH = 22;
const RECORD_WIDTH = 46;
const PLUS_MINUS_WIDTH = 42;
const GAMES_WIDTH = 26;

const number: TextStyle = {
  color: COURT.ink,
  fontSize: 16,
  fontVariant: ['tabular-nums'],
  textAlign: 'right',
};

function StandingsTableComponent({ standings, noteFor }: StandingsTableProps) {
  const { t } = useTranslation();
  const missing = standings.finishedGames - standings.scoredGames;

  const label = (row: StandingRow) =>
    row.rank === null
      ? t('standings.unrankedA11y', { name: row.name, games: row.gamesPlayed })
      : t('standings.rowA11y', {
          rank: row.rank,
          name: row.name,
          wins: row.wins,
          losses: row.losses,
          plusMinus: formatPlusMinus(row.plusMinus),
          games: row.gamesPlayed,
        });

  const heading: TextStyle = { color: COURT.inkMuted, fontSize: 12, fontWeight: '600', textAlign: 'right' };

  return (
    <View>
      {missing > 0 && (
        <Text style={{ color: COURT.inkMuted, fontSize: 13, paddingHorizontal: 4, paddingBottom: 8 }}>
          {t('standings.captionPartial', {
            scored: standings.scoredGames,
            total: standings.finishedGames,
            missing,
          })}
        </Text>
      )}

      <View
        style={{
          borderRadius: 14,
          backgroundColor: `${COURT.line}0f`,
          borderWidth: 1,
          borderColor: `${COURT.line}14`,
          overflow: 'hidden',
        }}
      >
        <View
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 30 }}
        >
          <View style={{ flex: 1 }} />
          <Text style={[heading, { width: RECORD_WIDTH }]}>{t('standings.columnRecord')}</Text>
          <Text style={[heading, { width: PLUS_MINUS_WIDTH }]}>{t('standings.columnPlusMinus')}</Text>
          <Text style={[heading, { width: GAMES_WIDTH }]}>{t('standings.columnGames')}</Text>
        </View>

        {standings.rows.map(row => {
          const note = noteFor?.(row.playerId);
          const ranked = row.rank !== null;
          return (
            <View key={row.playerId}>
              <View style={{ height: 1, backgroundColor: `${COURT.line}14`, marginLeft: 14 }} />
              <View
                accessible
                accessibilityLabel={label(row)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, height: 48 }}
              >
                <Text style={[number, { width: RANK_WIDTH, fontWeight: '700', textAlign: 'left' }]}>
                  {ranked ? row.rank : ''}
                </Text>
                <View
                  style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: PADDLE_FACE[row.color] }}
                />
                <Text style={{ color: COURT.ink, fontSize: 16, flex: 1 }} numberOfLines={1}>
                  {row.name}
                </Text>
                {note && (
                  <Text style={{ color: COURT.inkMuted, fontSize: 13 }} numberOfLines={1}>
                    {note}
                  </Text>
                )}
                <Text style={[number, { width: RECORD_WIDTH, fontWeight: '700' }]}>
                  {ranked ? formatRecord(row) : '–'}
                </Text>
                <Text style={[number, { width: PLUS_MINUS_WIDTH, color: ranked ? COURT.ink : COURT.inkMuted }]}>
                  {ranked ? formatPlusMinus(row.plusMinus) : '–'}
                </Text>
                <Text style={[number, { width: GAMES_WIDTH, color: COURT.inkMuted }]}>{row.gamesPlayed}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export const StandingsTable = memo(StandingsTableComponent);

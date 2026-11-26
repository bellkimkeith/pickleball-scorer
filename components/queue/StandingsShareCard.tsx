import { forwardRef } from 'react';
import { Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatPlusMinus, formatRecord, shareRows, Standings } from '../../lib/queue/standings';
import { COURT } from '../../lib/theme/tokens';

export interface StandingsShareCardProps {
  standings: Standings;
  /** e.g. "Tue, Nov 25 · 2h 10m · 18 games · 2 courts" */
  meta: string;
}

/** Plates keep text off the court lines, as on the game share card. */
const PLATE = '#1f4b7d';
const PLATE_TEXT = '#dce8f5';
const PODIUM = '#ffffff1f';

/**
 * The night's standings drawn as a court seen from above, captured as an
 * image for the group chat. Shows the ranked players only, at most 16.
 */
export const StandingsShareCard = forwardRef<View, StandingsShareCardProps>(function StandingsShareCard(
  { standings, meta },
  ref,
) {
  const { t } = useTranslation();
  const { rows, more } = shareRows(standings);
  const missing = standings.finishedGames - standings.scoredGames;
  // Sixteen rows only fit in the 4:5 frame at a smaller size.
  const dense = rows.length > 10;
  const fontSize = dense ? 12 : 15;
  const rowPadding = dense ? 2 : 4;

  const cell = { color: COURT.ink, fontSize, fontVariant: ['tabular-nums' as const], textAlign: 'right' as const };

  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        aspectRatio: 4 / 5,
        borderRadius: 18,
        overflow: 'hidden',
        backgroundColor: COURT.inner,
        borderWidth: 3,
        borderColor: COURT.line,
      }}
    >
      {/* court seen from above: net across the middle */}
      <View style={{ position: 'absolute', left: 0, right: 0, top: '36%', bottom: '36%', backgroundColor: COURT.kitchen }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: '36%', height: 3, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: '36%', height: 3, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 3, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', left: '50%', top: 0, height: '36%', width: 3, backgroundColor: COURT.line }} />
      <View style={{ position: 'absolute', left: '50%', bottom: 0, height: '36%', width: 3, backgroundColor: COURT.line }} />

      <View style={{ flex: 1, justifyContent: 'space-between', padding: 14 }}>
        <View style={{ alignSelf: 'flex-start', backgroundColor: PLATE, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
          <Text style={{ color: COURT.ink, fontSize: 16, fontWeight: '800' }}>{t('standings.cardTitle')}</Text>
          <Text style={{ color: PLATE_TEXT, fontSize: 11, marginTop: 1 }} numberOfLines={1}>
            {meta}
          </Text>
        </View>

        <View style={{ backgroundColor: PLATE, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 6 }}>
          {rows.map(row => (
            <View
              key={row.playerId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: rowPadding,
                paddingHorizontal: 6,
                borderRadius: 6,
                backgroundColor: row.rank !== null && row.rank <= 3 ? PODIUM : 'transparent',
              }}
            >
              {/* 26pt fits a bold two-digit rank ("10" to "16") at 15pt; 20 wrapped it onto two lines. */}
              <Text style={[cell, { width: 26, fontWeight: '800', textAlign: 'left' }]} numberOfLines={1}>
                {row.rank}
              </Text>
              <Text style={{ color: COURT.ink, fontSize, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                {row.name}
              </Text>
              <Text style={[cell, { width: 44, fontWeight: '700' }]}>{formatRecord(row)}</Text>
              <Text style={[cell, { width: 40, color: PLATE_TEXT }]}>{formatPlusMinus(row.plusMinus)}</Text>
            </View>
          ))}
          {more > 0 && (
            <Text style={{ color: PLATE_TEXT, fontSize: 11, paddingHorizontal: 6, paddingTop: 2 }}>
              {t('standings.moreCount', { count: more })}
            </Text>
          )}
        </View>

        <View style={{ alignSelf: 'flex-start', backgroundColor: PLATE, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 }}>
          {missing > 0 && (
            <Text style={{ color: PLATE_TEXT, fontSize: 10 }}>
              {t('standings.captionPartial', { scored: standings.scoredGames, total: standings.finishedGames, missing })}
            </Text>
          )}
          <Text style={{ color: PLATE_TEXT, fontSize: 10, opacity: 0.8 }}>{t('home.title')}</Text>
        </View>
      </View>
    </View>
  );
});

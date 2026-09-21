import { createAudioPlayer } from 'expo-audio';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CustomSound, defaultSoundName, validateCustomSound } from '../../lib/audio/custom-sounds';
import { SOUNDS, SoundItem, SoundManager } from '../../lib/audio/SoundManager';
import { COURT, PADDLE_FACE, PADDLE_TEXT } from '../../lib/theme/tokens';
import { PaddleColor } from '../../lib/types/queue';
import { useGameStore } from '../../store/game-store';
import { Segmented } from '../ui/Controls';
import { ListGroup, ListRow } from '../ui/ListGroup';
import { Sheet } from '../ui/Sheet';

interface SoundboardModalProps {
  visible: boolean;
  onClose: () => void;
}

type Category = 'all' | 'hype' | 'classic' | 'meme' | 'mine';

const TILE_COLORS: PaddleColor[] = ['ochre', 'paper', 'sky', 'coral', 'lilac', 'carbon', 'sand', 'teal'];

/** Reads a clip's length so it can be checked against the 5-second limit. */
async function readDurationMs(uri: string): Promise<number> {
  const player = createAudioPlayer({ uri });
  try {
    for (let attempt = 0; attempt < 20; attempt++) {
      const seconds = player.duration;
      if (seconds && seconds > 0) return Math.round(seconds * 1000);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    return 0;
  } finally {
    player.release();
  }
}

export function SoundboardModal({ visible, onClose }: SoundboardModalProps) {
  const { t } = useTranslation();
  const settings = useGameStore(state => state.settings);
  const updateSettings = useGameStore(state => state.updateSettings);

  const customSounds = useMemo(() => settings.customSounds ?? [], [settings.customSounds]);
  const [category, setCategory] = useState<Category>('all');
  const [assigning, setAssigning] = useState<1 | 2 | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    SoundManager.setCustomSounds(customSounds);
    if (visible) SoundManager.preloadAll();
  }, [visible, customSounds]);

  const tiles: (SoundItem | CustomSound)[] = useMemo(() => {
    if (category === 'mine') return customSounds;
    if (category === 'all') return [...SOUNDS, ...customSounds];
    return SOUNDS.filter(sound => sound.category === category);
  }, [category, customSounds]);

  const addSound = async () => {
    setBusy(true);
    try {
      const picked = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (picked.canceled || !picked.assets?.[0]) return;
      const asset = picked.assets[0];

      const durationMs = await readDurationMs(asset.uri);
      const check = validateCustomSound({
        name: asset.name,
        durationMs,
        bytes: asset.size ?? 0,
        existingCount: customSounds.length,
      });

      if (!check.ok) {
        const message =
          check.reason === 'tooLong'
            ? t('soundboard.tooLong', { seconds: check.seconds, limit: check.limitSeconds })
            : check.reason === 'tooBig'
              ? t('soundboard.tooBig', { size: check.megabytes, limit: check.limitMegabytes })
              : check.reason === 'badFormat'
                ? t('soundboard.badFormat')
                : t('soundboard.tooMany', { limit: check.limit });
        Alert.alert(t('soundboard.cannotAdd'), message);
        return;
      }

      const id = `custom-${Date.now()}`;
      const extension = asset.name.split('.').pop()?.toLowerCase() ?? 'mp3';
      const destination = new File(Paths.document, `${id}.${extension}`);
      new File(asset.uri).copy(destination);

      updateSettings({
        customSounds: [
          ...customSounds,
          { id, name: defaultSoundName(asset.name), fileUri: destination.uri, durationMs },
        ],
      });
      setCategory('mine');
    } catch {
      Alert.alert(t('soundboard.cannotAdd'), t('soundboard.pickFailed'));
    } finally {
      setBusy(false);
    }
  };

  const removeSound = (sound: CustomSound) => {
    SoundManager.forget(sound.id);
    try {
      new File(sound.fileUri).delete();
    } catch {
      // Already gone; the entry still goes away.
    }
    updateSettings({
      customSounds: customSounds.filter(s => s.id !== sound.id),
      team1Sound: settings.team1Sound === sound.id ? undefined : settings.team1Sound,
      team2Sound: settings.team2Sound === sound.id ? undefined : settings.team2Sound,
    });
  };

  const confirmRemove = (sound: CustomSound) => {
    Alert.alert(sound.name, t('soundboard.removeSound'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('soundboard.remove'), style: 'destructive', onPress: () => removeSound(sound) },
    ]);
  };

  const onTilePress = (id: string) => {
    if (assigning) {
      SoundManager.setTeamSound(assigning, id);
      updateSettings(assigning === 1 ? { team1Sound: id } : { team2Sound: id });
      setAssigning(null);
      return;
    }
    SoundManager.play(id);
  };

  const nameOf = (id?: string) =>
    id
      ? (SOUNDS.find(s => s.id === id)?.name ?? customSounds.find(s => s.id === id)?.name ?? t('common.off'))
      : t('common.off');

  const tile = (sound: SoundItem | CustomSound, index: number) => {
    const color = TILE_COLORS[index % TILE_COLORS.length];
    const isCustom = 'fileUri' in sound;
    const available = !isCustom || SoundManager.isAvailable(sound.id);
    const assigned = settings.team1Sound === sound.id ? 1 : settings.team2Sound === sound.id ? 2 : undefined;

    return (
      <Pressable
        key={sound.id}
        onPress={() => available && onTilePress(sound.id)}
        onLongPress={isCustom ? () => confirmRemove(sound as CustomSound) : undefined}
        accessibilityRole="button"
        accessibilityLabel={sound.name}
        style={{ width: '31%' }}
      >
        <View
          style={{
            height: 84,
            borderRadius: 30,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
            backgroundColor: available ? PADDLE_FACE[color] : `${COURT.line}14`,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingBottom: 10,
            paddingHorizontal: 6,
            borderWidth: assigned ? 2 : 0,
            borderColor: COURT.line,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              color: available ? PADDLE_TEXT[color] : COURT.inkMuted,
              fontSize: 14,
              fontWeight: '700',
            }}
          >
            {sound.name}
          </Text>
          {assigned !== undefined && (
            <Text style={{ color: PADDLE_TEXT[color], fontSize: 10, fontWeight: '700', opacity: 0.75 }}>
              {t('soundboard.teamNumber', { number: assigned })}
            </Text>
          )}
          {!available && <Text style={{ color: COURT.inkMuted, fontSize: 10 }}>{t('soundboard.missing')}</Text>}
        </View>
      </Pressable>
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose} title={t('soundboard.title')}>
      <Segmented
        options={[
          { value: 'all', label: t('soundboard.all') },
          { value: 'hype', label: t('soundboard.hype') },
          { value: 'classic', label: t('soundboard.classic') },
          { value: 'meme', label: t('soundboard.meme') },
          { value: 'mine', label: t('soundboard.mine') },
        ]}
        value={category}
        onChange={setCategory}
        accessibilityLabel={t('soundboard.title')}
      />

      {assigning !== null && (
        <Text style={{ color: COURT.ink, fontSize: 15, fontWeight: '600', paddingTop: 12 }}>
          {t('soundboard.pickForTeam', { number: assigning })}
        </Text>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingTop: 14 }}>
        {tiles.map((sound, index) => tile(sound, index))}

        {(category === 'mine' || category === 'all') && (
          <Pressable
            onPress={addSound}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={t('soundboard.addSound')}
            style={{ width: '31%' }}
          >
            <View
              style={{
                height: 84,
                borderRadius: 30,
                borderBottomLeftRadius: 20,
                borderBottomRightRadius: 20,
                borderWidth: 1.5,
                borderColor: `${COURT.line}66`,
                borderStyle: 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: busy ? 0.5 : 1,
              }}
            >
              <Text style={{ color: COURT.ink, fontSize: 24, fontWeight: '300' }}>＋</Text>
              <Text style={{ color: COURT.inkMuted, fontSize: 11, fontWeight: '600' }}>
                {t('soundboard.addSound')}
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      {category === 'mine' && customSounds.length === 0 && (
        <Text style={{ color: COURT.inkMuted, fontSize: 14, lineHeight: 20, paddingTop: 14 }}>
          {t('soundboard.mineEmpty')}
        </Text>
      )}

      <ListGroup style={{ marginTop: 20, marginBottom: 10 }}>
        <ListRow
          label={t('soundboard.teamSound', { number: 1 })}
          value={nameOf(settings.team1Sound)}
          chevron
          onPress={() => setAssigning(1)}
        />
        <ListRow
          label={t('soundboard.teamSound', { number: 2 })}
          value={nameOf(settings.team2Sound)}
          chevron
          onPress={() => setAssigning(2)}
        />
      </ListGroup>
    </Sheet>
  );
}

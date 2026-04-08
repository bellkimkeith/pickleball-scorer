import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { memo, useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Modal } from '../common/Modal';
import { SoundButton } from './SoundButton';
import { SoundManager, FREE_SOUNDS, PRO_SOUNDS, SoundItem } from '../../lib/audio/SoundManager';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useTranslation } from 'react-i18next';

interface SoundboardModalProps {
  visible: boolean;
  onClose: () => void;
  isPro?: boolean;
  onUpgradePress?: () => void;
}

type Category = 'all' | 'hype' | 'classic' | 'meme';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'hype', label: 'Hype' },
  { key: 'classic', label: 'Classic' },
  { key: 'meme', label: 'Meme' },
];

function SoundboardModalComponent({
  visible,
  onClose,
  isPro = false,
  onUpgradePress,
}: SoundboardModalProps) {
  const { isDarkMode } = useDarkMode();
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [selectedTeam, setSelectedTeam] = useState<1 | 2 | null>(null);

  useEffect(() => {
    if (visible) {
      const soundsToLoad = isPro ? [...FREE_SOUNDS, ...PRO_SOUNDS] : FREE_SOUNDS;
      SoundManager.preloadSounds(soundsToLoad.map(s => s.id));
    }
  }, [visible, isPro]);

  const handleSoundPress = useCallback(async (soundId: string) => {
    await SoundManager.play(soundId);
  }, []);

  const handleLockPress = useCallback(() => {
    onClose();
    if (onUpgradePress) {
      onUpgradePress();
    }
  }, [onClose, onUpgradePress]);

  const filteredSounds = useCallback((): SoundItem[] => {
    const allSounds = isPro ? [...FREE_SOUNDS, ...PRO_SOUNDS] : FREE_SOUNDS;
    if (activeCategory === 'all') {
      return allSounds;
    }
    return allSounds.filter(s => s.category === activeCategory);
  }, [activeCategory, isPro]);

  const handleTeamSelect = useCallback((team: 1 | 2) => {
    setSelectedTeam(prev => prev === team ? null : team);
  }, []);

  const handleAssignSound = useCallback((soundId: string) => {
    if (selectedTeam) {
      SoundManager.setTeamSound(selectedTeam, soundId);
      setSelectedTeam(null);
    }
  }, [selectedTeam]);

  return (
    <Modal visible={visible} onClose={onClose} dismissable>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, isDarkMode ? styles.titleDark : styles.titleLight]}>
            {t('soundboard.title', 'Soundboard')}
          </Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#f3f4f6' : '#1f2937'} />
          </Pressable>
        </View>

        {/* Team Selection */}
        <View style={styles.teamSection}>
          <Text style={[styles.sectionLabel, isDarkMode ? styles.sectionLabelDark : styles.sectionLabelLight]}>
            {t('soundboard.assignTeam', 'Assign to Team')}
          </Text>
          <View style={styles.teamButtons}>
            <Pressable
              onPress={() => handleTeamSelect(1)}
              style={[
                styles.teamButton,
                selectedTeam === 1 && styles.teamButtonActive,
                selectedTeam === 1 && (isDarkMode ? styles.teamButtonActiveBorderDark : styles.teamButtonActiveBorderLight),
                isDarkMode ? styles.teamButtonDark : styles.teamButtonLight,
              ]}
            >
              <Text style={[
                styles.teamButtonText,
                selectedTeam === 1 && (isDarkMode ? styles.teamButtonTextActiveDark : styles.teamButtonTextActiveLight)
              ]}>
                Team 1
              </Text>
            </Pressable>
            <Pressable
              onPress={() => handleTeamSelect(2)}
              style={[
                styles.teamButton,
                selectedTeam === 2 && styles.teamButtonActive,
                selectedTeam === 2 && (isDarkMode ? styles.teamButtonActiveBorderDark : styles.teamButtonActiveBorderLight),
                isDarkMode ? styles.teamButtonDark : styles.teamButtonLight,
              ]}
            >
              <Text style={[
                styles.teamButtonText,
                selectedTeam === 2 && (isDarkMode ? styles.teamButtonTextActiveDark : styles.teamButtonTextActiveLight)
              ]}>
                Team 2
              </Text>
            </Pressable>
          </View>
          {selectedTeam && (
            <Text style={[styles.helperText, isDarkMode ? styles.helperTextDark : styles.helperTextLight]}>
              Tap a sound to assign to Team {selectedTeam}
            </Text>
          )}
        </View>

        {/* Category Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map(cat => (
            <Pressable
              key={cat.key}
              onPress={() => setActiveCategory(cat.key)}
              style={[
                styles.categoryTab,
                activeCategory === cat.key 
                  ? styles.categoryTabActive 
                  : (isDarkMode ? styles.categoryTabDark : styles.categoryTabLight),
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat.key 
                    ? styles.categoryTextActive 
                    : (isDarkMode ? styles.categoryTextDark : styles.categoryTextLight),
                ]}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Sound Grid */}
        <ScrollView
          style={styles.soundGrid}
          contentContainerStyle={styles.soundGridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.soundRow}>
            {filteredSounds().slice(0, 3).map(sound => {
              const assignedTeam = SoundManager.getTeamSound(1) === sound.id ? 1 : (SoundManager.getTeamSound(2) === sound.id ? 2 : undefined);
              return (
                <SoundButton
                  key={sound.id}
                  sound={sound}
                  onPress={selectedTeam ? handleAssignSound : handleSoundPress}
                  isLocked={!isPro && sound.isPro}
                  onLockPress={handleLockPress}
                  isSelected={selectedTeam 
                    ? SoundManager.getTeamSound(selectedTeam) === sound.id 
                    : assignedTeam !== undefined}
                  teamNumber={assignedTeam}
                />
              );
            })}
          </View>
          <View style={styles.soundRow}>
            {filteredSounds().slice(3, 6).map(sound => {
              const assignedTeam = SoundManager.getTeamSound(1) === sound.id ? 1 : (SoundManager.getTeamSound(2) === sound.id ? 2 : undefined);
              return (
                <SoundButton
                  key={sound.id}
                  sound={sound}
                  onPress={selectedTeam ? handleAssignSound : handleSoundPress}
                  isLocked={!isPro && sound.isPro}
                  onLockPress={handleLockPress}
                  isSelected={selectedTeam 
                    ? SoundManager.getTeamSound(selectedTeam) === sound.id 
                    : assignedTeam !== undefined}
                  teamNumber={assignedTeam}
                />
              );
            })}
          </View>
          {filteredSounds().length > 6 && (
            <View style={styles.soundRow}>
              {filteredSounds().slice(6, 9).map(sound => {
                const assignedTeam = SoundManager.getTeamSound(1) === sound.id ? 1 : (SoundManager.getTeamSound(2) === sound.id ? 2 : undefined);
                return (
                  <SoundButton
                    key={sound.id}
                    sound={sound}
                    onPress={selectedTeam ? handleAssignSound : handleSoundPress}
                    isLocked={!isPro && sound.isPro}
                    onLockPress={handleLockPress}
                    isSelected={selectedTeam 
                      ? SoundManager.getTeamSound(selectedTeam) === sound.id 
                      : assignedTeam !== undefined}
                    teamNumber={assignedTeam}
                  />
                );
              })}
            </View>
          )}
          {filteredSounds().length > 9 && (
            <View style={styles.soundRow}>
              {filteredSounds().slice(9, 12).map(sound => {
                const assignedTeam = SoundManager.getTeamSound(1) === sound.id ? 1 : (SoundManager.getTeamSound(2) === sound.id ? 2 : undefined);
                return (
                  <SoundButton
                    key={sound.id}
                    sound={sound}
                    onPress={selectedTeam ? handleAssignSound : handleSoundPress}
                    isLocked={!isPro && sound.isPro}
                    onLockPress={handleLockPress}
                    isSelected={selectedTeam 
                      ? SoundManager.getTeamSound(selectedTeam) === sound.id 
                      : assignedTeam !== undefined}
                    teamNumber={assignedTeam}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>

        {/* Pro Upgrade Banner */}
        {!isPro && (
          <Pressable
            onPress={onUpgradePress}
            style={styles.proBanner}
          >
            <View style={styles.proBannerContent}>
              <Ionicons name="star" size={20} color="#ffffff" />
              <Text style={styles.proBannerText}>
                {t('soundboard.upgrade', 'Upgrade to Pro for 30+ sounds!')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ffffff" />
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleLight: {
    color: '#1f2937',
  },
  titleDark: {
    color: '#f3f4f6',
  },
  closeButton: {
    padding: 4,
  },
  teamSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionLabelLight: {
    color: '#6b7280',
  },
  sectionLabelDark: {
    color: '#9ca3af',
  },
  teamButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  teamButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  teamButtonLight: {
    backgroundColor: '#f3f4f6',
  },
  teamButtonDark: {
    backgroundColor: '#374151',
  },
  teamButtonActive: {
    backgroundColor: '#16a34a',
  },
  teamButtonActiveBorderLight: {
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  teamButtonActiveBorderDark: {
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  teamButtonTextActiveLight: {
    color: '#1f2937',
  },
  teamButtonTextActiveDark: {
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  helperTextLight: {
    color: '#6b7280',
  },
  helperTextDark: {
    color: '#9ca3af',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryContent: {
    gap: 8,
    paddingRight: 16,
  },
  categoryTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryTabLight: {
    backgroundColor: '#f3f4f6',
  },
  categoryTabDark: {
    backgroundColor: '#374151',
  },
  categoryTabActive: {
    backgroundColor: '#15803d',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextLight: {
    color: '#374151',
  },
  categoryTextDark: {
    color: '#d1d5db',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  soundGrid: {
    maxHeight: 320,
  },
  soundGridContent: {
    paddingBottom: 8,
  },
  soundRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
    paddingHorizontal: 4,
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f59e0b',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  proBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proBannerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export const SoundboardModal = memo(SoundboardModalComponent);

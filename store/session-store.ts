import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { nextColorForRoster, sessionColor } from '../lib/queue/colors';
import {
  addPlayer,
  createSession,
  endSession,
  fillIdleCourts,
  finishMatch,
  lockPair,
  removePlayer,
  returnPlayer,
  setCourtCount,
  setSittingOut,
  undoLast,
  unlockPair,
} from '../lib/queue/engine';
import {
  PaddleColor,
  SavedGroup,
  SavedPlayer,
  Session,
  SessionPlayer,
} from '../lib/types/queue';

const MAX_SESSIONS_KEPT = 50;

interface SessionStore {
  savedPlayers: SavedPlayer[];
  savedGroups: SavedGroup[];
  activeSession: Session | null;
  openPlayHistory: Session[];
  defaultCourtCount: number;

  addSavedPlayer: (name: string) => SavedPlayer;
  renameSavedPlayer: (id: string, name: string) => void;
  deleteSavedPlayer: (id: string) => void;
  saveGroup: (name: string, playerIds: string[]) => void;
  deleteGroup: (id: string) => void;

  startSession: (playerIds: string[], courtCount: number) => void;
  matchDone: (matchId: string, score?: [number, number]) => void;
  addToSession: (name: string) => void;
  sitOut: (playerId: string) => void;
  comeBack: (playerId: string) => void;
  removeFromSession: (playerId: string) => void;
  lock: (a: string, b: string) => void;
  unlock: (playerId: string) => void;
  setCourts: (count: number) => void;
  undo: () => void;
  finishSession: () => void;
}

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => {
      /** Apply a change to the active session, doing nothing when there is none. */
      const onSession = (change: (session: Session, now: number) => Session) => {
        const { activeSession } = get();
        if (!activeSession) return;
        set({ activeSession: change(activeSession, Date.now()) });
      };

      return {
        savedPlayers: [],
        savedGroups: [],
        activeSession: null,
        openPlayHistory: [],
        defaultCourtCount: 2,

        addSavedPlayer: (name: string) => {
          const saved = get().savedPlayers;
          const player: SavedPlayer = {
            id: newId(),
            name: name.trim(),
            color: nextColorForRoster(saved),
          };
          set({ savedPlayers: [...saved, player] });
          return player;
        },

        renameSavedPlayer: (id, name) =>
          set({
            savedPlayers: get().savedPlayers.map(p =>
              p.id === id ? { ...p, name: name.trim() } : p,
            ),
          }),

        deleteSavedPlayer: id =>
          set({
            savedPlayers: get().savedPlayers.filter(p => p.id !== id),
            savedGroups: get().savedGroups.map(g => ({
              ...g,
              playerIds: g.playerIds.filter(pid => pid !== id),
            })),
          }),

        saveGroup: (name, playerIds) =>
          set({
            savedGroups: [...get().savedGroups, { id: newId(), name: name.trim(), playerIds }],
          }),

        deleteGroup: id => set({ savedGroups: get().savedGroups.filter(g => g.id !== id) }),

        startSession: (playerIds, courtCount) => {
          const now = Date.now();
          const saved = get().savedPlayers;
          const taken: PaddleColor[] = [];

          const players: SessionPlayer[] = playerIds.flatMap(id => {
            const player = saved.find(p => p.id === id);
            if (!player) return [];
            const color = sessionColor(player.color, taken);
            taken.push(color);
            return [
              {
                id: player.id,
                name: player.name,
                color,
                status: 'active' as const,
                gamesPlayed: 0,
                queueCount: 0,
                waitingSince: now,
                arrivedAt: now,
              },
            ];
          });

          set({
            activeSession: fillIdleCourts(createSession(players, courtCount, now), now),
            defaultCourtCount: courtCount,
          });
        },

        matchDone: (matchId, score) =>
          onSession((session, now) =>
            fillIdleCourts(finishMatch(session, matchId, now, score), now),
          ),

        addToSession: (name: string) => {
          const existing = get().savedPlayers.find(
            p => p.name.toLowerCase() === name.trim().toLowerCase(),
          );
          const player = existing ?? get().addSavedPlayer(name);
          onSession((session, now) => fillIdleCourts(addPlayer(session, player, now), now));
        },

        sitOut: playerId => onSession((session, now) => setSittingOut(session, playerId, now)),

        comeBack: playerId =>
          onSession((session, now) => fillIdleCourts(returnPlayer(session, playerId, now), now)),

        removeFromSession: playerId =>
          onSession((session, now) => removePlayer(session, playerId, now)),

        lock: (a, b) => onSession(session => lockPair(session, a, b)),

        unlock: playerId => onSession(session => unlockPair(session, playerId)),

        setCourts: count => {
          onSession((session, now) => fillIdleCourts(setCourtCount(session, count), now));
          set({ defaultCourtCount: count });
        },

        undo: () => onSession(session => undoLast(session)),

        finishSession: () => {
          const { activeSession, openPlayHistory } = get();
          if (!activeSession) return;
          const ended = endSession(activeSession, Date.now());
          set({
            activeSession: null,
            openPlayHistory: [ended, ...openPlayHistory].slice(0, MAX_SESSIONS_KEPT),
          });
        },
      };
    },
    {
      name: '@pickleball_open_play',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

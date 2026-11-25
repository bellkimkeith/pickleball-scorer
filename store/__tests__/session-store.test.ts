import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSessionStore } from '../session-store';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

function addPlayers(names: string[]): string[] {
  names.forEach(name => useSessionStore.getState().addSavedPlayer(name));
  return useSessionStore.getState().savedPlayers.map(p => p.id);
}

describe('session store', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    useSessionStore.setState({
      savedPlayers: [],
      savedGroups: [],
      activeSession: null,
      openPlayHistory: [],
      defaultCourtCount: 2,
    });
  });

  it('saves new players with distinct colors', () => {
    addPlayers(['Ana', 'Bea']);
    const saved = useSessionStore.getState().savedPlayers;
    expect(saved.map(p => p.name)).toEqual(['Ana', 'Bea']);
    expect(saved[0].color).not.toBe(saved[1].color);
  });

  it('starts a session and fills the courts', () => {
    const ids = addPlayers(['a', 'b', 'c', 'd', 'e']);
    useSessionStore.getState().startSession(ids, 1);
    const session = useSessionStore.getState().activeSession!;
    expect(session.players).toHaveLength(5);
    expect(session.matches).toHaveLength(1);
  });

  it('finishes a match, counts it, and calls the next one', () => {
    const ids = addPlayers(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']);
    useSessionStore.getState().startSession(ids, 1);
    const first = useSessionStore.getState().activeSession!.matches[0];
    useSessionStore.getState().matchDone(first.id, [11, 7]);

    const after = useSessionStore.getState().activeSession!;
    expect(after.matches[0].score).toEqual([11, 7]);
    expect(after.matches).toHaveLength(2);
    expect(after.players.filter(p => p.gamesPlayed === 1)).toHaveLength(4);
  });

  it('moves a finished session into history', () => {
    const ids = addPlayers(['a', 'b', 'c', 'd']);
    useSessionStore.getState().startSession(ids, 1);
    useSessionStore.getState().finishSession();
    expect(useSessionStore.getState().activeSession).toBeNull();
    expect(useSessionStore.getState().openPlayHistory).toHaveLength(1);
  });

  it('adds a late arrival to the running session', () => {
    const ids = addPlayers(['a', 'b', 'c', 'd']);
    useSessionStore.getState().startSession(ids, 1);
    useSessionStore.getState().addToSession('Zoe');
    const session = useSessionStore.getState().activeSession!;
    expect(session.players.map(p => p.name)).toContain('Zoe');
    expect(useSessionStore.getState().savedPlayers.map(p => p.name)).toContain('Zoe');
  });

  it('writes the session to storage so it survives a restart', async () => {
    const ids = addPlayers(['a', 'b', 'c', 'd']);
    useSessionStore.getState().startSession(ids, 1);
    await new Promise(resolve => setTimeout(resolve, 0));
    const raw = await AsyncStorage.getItem('@pickleball_open_play');
    expect(raw).toContain('"activeSession"');
  });
});

import { Stack } from 'expo-router';

export default function GameLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        // The textured court ground lives at the root; screens sit on it.
        contentStyle: { backgroundColor: 'transparent' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="singles" />
      <Stack.Screen name="doubles" />
    </Stack>
  );
}

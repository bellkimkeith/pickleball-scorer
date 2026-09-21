import { Stack } from 'expo-router';

export default function QueueLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="session" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}

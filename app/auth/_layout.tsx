import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create-account" />
      <Stack.Screen name="sign-in" />
    </Stack>
  );
}

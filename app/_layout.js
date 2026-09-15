import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { VehicleProvider } from '../src/context/VehicleContext';
import { LoyaltyProvider } from '../src/context/LoyaltyContext';
import { PrimaryButton } from '../src/components/AuthForm';
import { COLORS } from '../src/styles/colors';

function Routes() {
  const { user, initializing, initializationError, retryInitialization } = useAuth();
  if (initializing || initializationError) {
    return <View style={{ flex: 1, padding: 24, justifyContent: 'center', backgroundColor: COLORS.background }}>
      {initializing ? <><ActivityIndicator size="large" color={COLORS.primary} /><Text style={{ textAlign: 'center', marginTop: 16 }}>Abrindo sua conta…</Text></> :
        <><Text accessibilityRole="alert" style={{ color: COLORS.textPrimary, marginBottom: 20 }}>{initializationError}</Text><PrimaryButton title="Tentar novamente" onPress={retryInitialization} /></>}
    </View>;
  }
  return <VehicleProvider key={user?.id || 'guest'} accountId={user?.id}><LoyaltyProvider accountId={user?.id}><Stack screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
    <Stack.Protected guard={!user}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
    </Stack.Protected>
    <Stack.Protected guard={!!user}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="vehicle-history" />
      <Stack.Screen name="points-history" />
      <Stack.Screen name="my-redemptions" />
    </Stack.Protected>
  </Stack></LoyaltyProvider></VehicleProvider>;
}
export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({ FordScript: require('../assets/fonts/Fordscript.ttf') });
  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.background }}><ActivityIndicator color={COLORS.primary} /></View>;
  return <SafeAreaProvider><AuthProvider><Routes /></AuthProvider></SafeAreaProvider>;
}

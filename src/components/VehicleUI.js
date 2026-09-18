import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../styles/colors';
export const formatDate = value => value ? value.slice(0,10).split('-').reverse().join('/') : 'Não informada';
export const formatKm = value => value == null ? 'Não informada' : `${Number(value).toLocaleString('pt-BR')} km`;
export function Page({ children }) {
  const insets = useSafeAreaInsets();
  return <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }} keyboardShouldPersistTaps="handled"
    contentContainerStyle={{ padding: 20, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 130 }}>
    <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center' }}>{children}</View>
  </ScrollView>;
}
export function Card({ children }) { return <View style={vehicleStyles.card}>{children}</View>; }
export function Action({ label, onPress, disabled, danger = false }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => ({ paddingVertical: 12, paddingHorizontal: 8, opacity: pressed || disabled ? 0.5 : 1 })}>
    <Text style={{ color: danger ? '#B42318' : COLORS.primary, fontWeight: '700' }}>{label}</Text>
  </Pressable>;
}
export function LoadState({ loading, error, reload }) {
  if (loading) return <Card><ActivityIndicator color={COLORS.primary} /><Text style={vehicleStyles.subtitle}>Carregando veículos…</Text></Card>;
  if (error) return <Card><Text accessibilityRole="alert" style={{ color: '#B42318' }}>{error}</Text><Action label="Tentar novamente" onPress={reload} /></Card>;
  return null;
}
export const vehicleStyles = StyleSheet.create({
  title: { fontSize: 28, color: COLORS.primaryDark, fontWeight: '700', marginBottom: 8 },
  heading: { fontSize: 20, color: COLORS.primaryDark, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 22, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 20, marginTop: 18 },
  badge: { color: COLORS.primary, backgroundColor: '#E8F1FF', borderRadius: 8, padding: 7, alignSelf: 'flex-start', marginBottom: 10, fontSize: 12, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' },
});

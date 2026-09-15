import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../styles/colors';
export function AuthScreen({ children }) {
  return <SafeAreaView style={styles.safe}><KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}><View style={styles.form}>{children}</View></ScrollView>
  </KeyboardAvoidingView></SafeAreaView>;
}
export function FormField({ label, password = false, error, ...props }) {
  const [visible, setVisible] = useState(false);
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><View style={[styles.inputRow, error && styles.invalid]}>
    <TextInput {...props} accessibilityLabel={label} style={styles.input} placeholderTextColor={COLORS.textSecondary} secureTextEntry={password && !visible} />
    {password && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'} onPress={() => setVisible(v => !v)} style={styles.eye}>
      <Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} color={COLORS.primary} size={22} />
    </Pressable>}
  </View></View>;
}
export function FormMessage({ message }) {
  return message ? <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text> : null;
}
export function PrimaryButton({ title, busy, disabled, onPress }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled || !!busy, busy: !!busy }} disabled={disabled || busy} onPress={onPress}
    style={({ pressed }) => [styles.button, (pressed || busy || disabled) && { opacity: 0.7 }]}>
    {busy ? <ActivityIndicator color="white" accessibilityLabel="Aguarde" /> : <Text style={styles.buttonText}>{title}</Text>}
  </Pressable>;
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background }, content: { flexGrow: 1, padding: 20, paddingBottom: 40 },
  form: { width: '100%', maxWidth: 480, alignSelf: 'center' }, field: { marginBottom: 16 },
  label: { color: COLORS.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: 7 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border, borderRadius: 12 },
  invalid: { borderColor: '#B42318' }, input: { flex: 1, minWidth: 0, minHeight: 50, padding: 14, fontSize: 16, color: COLORS.textPrimary }, eye: { padding: 14 },
  error: { color: '#B42318', backgroundColor: '#FEECEB', borderRadius: 10, padding: 12, marginBottom: 16, lineHeight: 21 },
  button: { backgroundColor: COLORS.primary, borderRadius: 12, minHeight: 50, justifyContent: 'center', alignItems: 'center', padding: 14 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

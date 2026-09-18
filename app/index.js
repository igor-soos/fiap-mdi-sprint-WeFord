import { Image, Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { AuthScreen, FormField, FormMessage, PrimaryButton } from '../src/components/AuthForm';
import { globalStyles } from '../src/styles/globalStyles';
import { COLORS } from '../src/styles/colors';

export default function Login() {
  const { login, busy } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function submit() {
    setError('');
    try { await login(email, password); }
    catch (e) { setError(e.message || 'Não foi possível entrar. Tente novamente.'); }
  }
  return <AuthScreen>
    <Image source={require('../assets/icon.png')} style={{ width: 170, height: 170, resizeMode: 'contain', alignSelf: 'center' }} />
    <Text style={globalStyles.titleIndex}>WeFord</Text>
    <Text style={globalStyles.subtitleIndex}>Seu programa de fidelidade Ford</Text>
    <View style={{ marginTop: 30 }}>
      <FormField label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address"
        autoCapitalize="none" autoCorrect={false} autoComplete="email" editable={!busy} maxLength={254} />
      <FormField label="Senha" value={password} onChangeText={setPassword} password
        autoCapitalize="none" autoCorrect={false} autoComplete="current-password" editable={!busy}
        returnKeyType="done" onSubmitEditing={busy ? undefined : submit} />
      <FormMessage message={error} />
      <PrimaryButton title="Entrar" busy={busy} onPress={submit} />
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => router.push('/register')} style={{ padding: 18, alignItems: 'center' }}>
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Criar conta</Text>
      </Pressable>
      <Text style={{ color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 }}>Suas contas ficam salvas neste aparelho.</Text>
    </View>
  </AuthScreen>;
}

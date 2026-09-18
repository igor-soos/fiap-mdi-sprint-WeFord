import { Pressable, Text, View } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { AuthScreen, FormField, FormMessage, PrimaryButton } from '../src/components/AuthForm';
import { globalStyles } from '../src/styles/globalStyles';
import { COLORS } from '../src/styles/colors';

export default function Register() {
  const { register, busy } = useAuth();
  const [values, setValues] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState(null);
  const setField = field => value => { setValues(previous => ({ ...previous, [field]: value })); setError(null); };
  async function submit() {
    setError(null);
    try { await register(values); }
    catch (e) { setError({ message: e.message || 'Não foi possível criar a conta.', field: e.field }); }
  }
  const fieldProps = field => ({ value: values[field], onChangeText: setField(field), editable: !busy, error: error?.field === field });
  return <AuthScreen>
    <Text style={globalStyles.title}>Criar conta</Text>
    <Text style={globalStyles.subtitle}>Cadastre-se no programa WeFord Rewards</Text>
    <View style={{ marginTop: 28 }}>
      <FormField label="Nome" {...fieldProps('name')} autoCapitalize="words" autoComplete="name" maxLength={100} />
      <FormField label="E-mail" {...fieldProps('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email" maxLength={254} />
      <FormField label="Telefone com DDD (opcional)" {...fieldProps('phone')} keyboardType="phone-pad" autoComplete="tel" maxLength={20} />
      <FormField label="Senha (mínimo de 8 caracteres)" {...fieldProps('password')} password autoCapitalize="none" autoCorrect={false} autoComplete="new-password" maxLength={128} />
      <FormField label="Confirmar senha" {...fieldProps('confirmPassword')} password autoCapitalize="none" autoCorrect={false} autoComplete="new-password" maxLength={128} returnKeyType="done" onSubmitEditing={busy ? undefined : submit} />
      <FormMessage message={error?.message} />
      <PrimaryButton title="Criar conta" busy={busy} onPress={submit} />
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => router.replace('/')} style={{ padding: 18, alignItems: 'center' }}>
        <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Já possui conta? Entrar</Text>
      </Pressable>
      <Text style={{ color: COLORS.textSecondary, lineHeight: 20 }}>O cadastro fica disponível neste aparelho. Os dados do veículo serão informados na área Veículos.</Text>
    </View>
  </AuthScreen>;
}

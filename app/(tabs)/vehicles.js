import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { useVehicles } from '../../src/context/VehicleContext';
import { demoVehicles } from '../../src/services/vehicles';
import { FormField, FormMessage, PrimaryButton } from '../../src/components/AuthForm';
import { Page, Card, Action, LoadState, vehicleStyles as s, formatKm, formatDate } from '../../src/components/VehicleUI';

const blank = { model: '', modelYear: '', vin: '', km: '' };
export default function Vehicles() {
  const { items, primaryVehicle, loading, error, busy, reload, addManual, addDemo, setPrimary, remove } = useVehicles();
  const [mode, setMode] = useState(null);
  const [form, setForm] = useState(blank);
  const [failure, setFailure] = useState(null);
  const [success, setSuccess] = useState('');
  const [removeId, setRemoveId] = useState(null);
  const field = name => ({ value: form[name], onChangeText: value => { setForm(old => ({ ...old, [name]: value })); setFailure(null); }, editable: !busy, error: failure?.field === name });
  async function run(operation, message, close = false) {
    setFailure(null); setSuccess('');
    try { await operation(); setSuccess(message); setRemoveId(null); if (close) { setMode(null); setForm(blank); } }
    catch (e) { setFailure({ message: e.message || 'Não foi possível concluir a operação.', field: e.field }); }
  }
  const hasDemo = items.some(v => v.isDemo);
  return <Page>
    <Text style={s.title}>Meus veículos</Text>
    <Text style={s.subtitle}>Cadastre seu Ford ou explore um histórico de exemplo.</Text>
    <LoadState loading={loading} error={error} reload={reload} />
    {!loading && !error && <>
      <Card>
        <PrimaryButton title="Cadastrar meu veículo" disabled={busy} onPress={() => { setMode(mode === 'manual' ? null : 'manual'); setFailure(null); setSuccess(''); }} />
        {!hasDemo && <Action label="Escolher veículo de exemplo" disabled={busy} onPress={() => { setMode(mode === 'demo' ? null : 'demo'); setFailure(null); setSuccess(''); }} />}
      </Card>
      {busy && <Text accessibilityLiveRegion="polite" style={s.subtitle}>Salvando alteração…</Text>}
      <FormMessage message={failure?.message} />
      {!!success && <Text accessibilityLiveRegion="polite" style={[s.subtitle, { color: '#216B42' }]}>{success}</Text>}
      {mode === 'manual' && <Card>
        <Text style={s.heading}>Dados do veículo</Text>
        <FormField label="Modelo Ford" {...field('model')} placeholder="Ex.: Ranger" maxLength={80} />
        <FormField label="Ano do modelo" {...field('modelYear')} keyboardType="number-pad" maxLength={4} />
        <FormField label="VIN (chassi)" {...field('vin')} autoCapitalize="characters" autoCorrect={false} maxLength={17} />
        <FormField label="Quilometragem (opcional)" {...field('km')} keyboardType="number-pad" maxLength={7} placeholder="Ex.: 25000" />
        <Text style={[s.subtitle, { marginBottom: 16 }]}>Os dados são informados por você. O cadastro não consulta serviços da Ford nem comprova a propriedade do veículo.</Text>
        <PrimaryButton title="Salvar veículo" busy={busy} onPress={() => run(() => addManual(form), 'Veículo cadastrado.', true)} />
        <Action label="Cancelar" disabled={busy} onPress={() => { setMode(null); setFailure(null); }} />
      </Card>}
      {mode === 'demo' && !hasDemo && <Card>
        <Text style={s.heading}>Escolha um exemplo</Text>
        <Text style={s.subtitle}>Históricos fornecidos para o desafio acadêmico. O exemplo ficará associado à sua conta neste aparelho.</Text>
        {demoVehicles.map(v => <View key={v.id} style={{ borderTopWidth: 1, borderColor: '#E4EAF2', paddingTop: 14, marginTop: 14 }}>
          <Text style={s.heading}>Ford {v.model} {v.modelYear}</Text>
          <Text style={s.subtitle}>{v.history.length} manutenções registradas</Text>
          <Action label="Adicionar este exemplo" disabled={busy} onPress={() => run(() => addDemo(v.id), 'Veículo de exemplo adicionado.', true)} />
        </View>)}
        <Action label="Cancelar" disabled={busy} onPress={() => setMode(null)} />
      </Card>}
      {!items.length && !mode && <Card><Text style={s.heading}>Nenhum veículo cadastrado</Text><Text style={s.subtitle}>Adicione um veículo para vê-lo também na página inicial e no perfil.</Text></Card>}
      {items.map(v => <Card key={v.id}>
        <Text style={s.badge}>{v.isDemo ? 'VEÍCULO DE EXEMPLO' : 'CADASTRO MANUAL'}{primaryVehicle?.id === v.id ? ' · PRINCIPAL' : ''}</Text>
        <Text style={s.heading}>Ford {v.model} {v.modelYear}</Text>
        <Text style={s.subtitle}>{v.isDemo ? `Exemplo ${v.demoId} · VIN não disponibilizado` : `VIN: ${v.vin}`}</Text>
        <Text style={s.subtitle}>{v.isDemo ? 'Última quilometragem registrada' : 'Quilometragem informada'}: {formatKm(v.km)}</Text>
        {v.mileageDate && <Text style={s.subtitle}>Registro de {formatDate(v.mileageDate)}</Text>}
        <View style={s.row}>
          <Action label="Ver histórico" disabled={busy} onPress={() => router.push({ pathname: '/vehicle-history', params: { id: v.id } })} />
          {primaryVehicle?.id !== v.id && <Action label="Tornar principal" disabled={busy} onPress={() => run(() => setPrimary(v.id), 'Veículo principal atualizado.')} />}
          <Action label="Remover" danger disabled={busy} onPress={() => { setRemoveId(v.id); setFailure(null); setSuccess(''); }} />
        </View>
        {removeId === v.id && <View style={{ backgroundColor: '#FFF1EF', padding: 14, borderRadius: 12 }}>
          <Text>Remover este veículo da sua conta?</Text>
          <Action label="Confirmar remoção" danger disabled={busy} onPress={() => run(() => remove(v.id), 'Veículo removido.')} />
          <Action label="Manter veículo" disabled={busy} onPress={() => setRemoveId(null)} />
        </View>}
      </Card>)}
    </>}
  </Page>;
}

import { Text } from 'react-native';
import { router } from 'expo-router';
import { BalanceCard } from '../../src/components/LoyaltyUI';
import { useAuth } from '../../src/context/AuthContext';
import { useVehicles } from '../../src/context/VehicleContext';
import { Page, Card, Action, LoadState, vehicleStyles as s, formatDate, formatKm } from '../../src/components/VehicleUI';

export default function Home() {
  const { user } = useAuth();
  const { primaryVehicle: vehicle, loading, error, reload } = useVehicles();
  const latest = vehicle?.history[0];
  return <Page>
    <Text style={s.subtitle}>Bem-vindo de volta,</Text>
    <Text style={s.title}>{user?.name || 'Cliente'}</Text>
    <BalanceCard />
    <Action label="Ver extrato de pontos" onPress={() => router.push('/points-history')} />
    <LoadState loading={loading} error={error} reload={reload} />
    {!loading && !error && (vehicle ? <>
      <Card>
        <Text style={s.badge}>{vehicle.isDemo ? 'VEÍCULO PRINCIPAL · EXEMPLO' : 'VEÍCULO PRINCIPAL'}</Text>
        <Text style={s.heading}>Ford {vehicle.model} {vehicle.modelYear}</Text>
        <Text style={s.subtitle}>{vehicle.isDemo ? `Exemplo ${vehicle.demoId} · VIN não disponibilizado` : `VIN: ${vehicle.vin}`}</Text>
        <Text style={s.subtitle}>{vehicle.isDemo ? 'Última quilometragem registrada' : 'Quilometragem informada'}: {formatKm(vehicle.km)}</Text>
        {vehicle.mileageDate && <Text style={s.subtitle}>Registro de {formatDate(vehicle.mileageDate)}</Text>}
        <Action label="Gerenciar veículos" onPress={() => router.push('/(tabs)/vehicles')} />
      </Card>
      <Card>
        <Text style={s.heading}>Última manutenção registrada</Text>
        {latest ? <><Text style={s.subtitle}>{formatDate(latest.date)} · {formatKm(latest.km)}</Text><Text style={s.subtitle}>Concessionária: código {latest.dealerCode}</Text></> : <Text style={s.subtitle}>Nenhum histórico disponível para este veículo.</Text>}
        <Action label="Ver histórico completo" onPress={() => router.push({ pathname: '/vehicle-history', params: { id: vehicle.id } })} />
      </Card>
    </> : <Card><Text style={s.heading}>Adicione seu primeiro veículo</Text><Text style={s.subtitle}>Cadastre seu Ford ou escolha um exemplo para explorar o histórico de manutenção.</Text><Action label="Abrir meus veículos" onPress={() => router.push('/(tabs)/vehicles')} /></Card>)}
    <Text style={[s.heading, { marginTop: 28 }]}>Ofertas rápidas</Text>
    <Card><Text style={s.heading}>Benefícios WeFord</Text><Text style={s.subtitle}>Conheça as ofertas do programa de demonstração.</Text><Action label="Ver ofertas" onPress={() => router.push('/(tabs)/offers')} /></Card>
  </Page>;
}

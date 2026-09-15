import { Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useVehicles } from '../src/context/VehicleContext';
import { Page, Card, Action, LoadState, vehicleStyles as s, formatDate, formatKm } from '../src/components/VehicleUI';

export default function VehicleHistory() {
  const { id } = useLocalSearchParams();
  const { items, loading, error, reload } = useVehicles();
  const vehicle = items.find(v => v.id === id);
  return <Page>
    <Action label="Voltar aos veículos" onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/vehicles')} />
    <Text style={s.title}>Histórico de manutenção</Text>
    <LoadState loading={loading} error={error} reload={reload} />
    {!loading && !error && (!vehicle ? <Card><Text style={s.heading}>Veículo não encontrado nesta conta</Text><Action label="Abrir meus veículos" onPress={() => router.replace('/(tabs)/vehicles')} /></Card> : <>
      <Card>
        <Text style={s.badge}>{vehicle.isDemo ? 'HISTÓRICO DE EXEMPLO' : 'CADASTRO MANUAL'}</Text>
        <Text style={s.heading}>Ford {vehicle.model} {vehicle.modelYear}</Text>
        <Text style={s.subtitle}>{vehicle.isDemo ? 'Dados históricos do VIN Share fornecido para o desafio. Não representam uma consulta em tempo real.' : 'Veículo informado por você. Nenhum histórico foi associado automaticamente ao VIN.'}</Text>
        {!!vehicle.warrantyStartDate && <Text style={s.subtitle}>Início de garantia registrado: {formatDate(vehicle.warrantyStartDate)}</Text>}
      </Card>
      {!vehicle.history.length ? <Card><Text style={s.heading}>Nenhuma manutenção disponível</Text><Text style={s.subtitle}>Você pode adicionar um veículo de exemplo na área Veículos para explorar um histórico fornecido para o desafio.</Text></Card> : <>
        <Text style={[s.subtitle, { marginTop: 22 }]}>{vehicle.history.length} manutenções · mais recentes primeiro</Text>
        {vehicle.history.map(service => <Card key={service.id}>
          <Text style={s.badge}>CONCLUÍDA</Text>
          <Text style={s.heading}>{formatDate(service.date)}</Text>
          <Text style={s.subtitle}>Quilometragem: {formatKm(service.km)}</Text>
          <Text style={s.subtitle}>Concessionária: código {service.dealerCode}</Text>
          <Text style={s.subtitle}>Ordem de serviço: {service.sourceServiceOrder}</Text>
        </Card>)}
      </>}
    </>)}
  </Page>;
}

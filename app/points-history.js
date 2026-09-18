import { Text } from 'react-native';
import { router } from 'expo-router';
import { useLoyalty } from '../src/context/LoyaltyContext';
import { OFFERS } from '../src/services/loyaltyCore';
import { WalletStatus, points } from '../src/components/LoyaltyUI';
import { Page, Card, Action, formatDate, vehicleStyles as s } from '../src/components/VehicleUI';
export default function PointsHistory(){
  const {wallet,loading,error}=useLoyalty();const entries=[...(wallet?.entries??[])].reverse();
  return <Page><Action label="Voltar" onPress={()=>router.canGoBack()?router.back():router.replace('/(tabs)/rewards')}/><Text style={s.title}>Extrato de pontos</Text><WalletStatus/>
    {!loading&&!error&&(!entries.length?<Card><Text style={s.heading}>Nenhuma movimentação</Text><Text style={s.subtitle}>Adicione um veículo de exemplo para receber os pontos de seu histórico.</Text><Action label="Abrir veículos" onPress={()=>router.push('/(tabs)/vehicles')}/></Card>:entries.map(e=><Card key={e.id}>
      <Text style={[s.heading,{color:e.points>0?'#216B42':'#B42318'}]}>{e.points>0?'+':''}{points(e.points)} pontos</Text>
      <Text style={s.heading}>{e.kind==='credit'?`Manutenção · Ford ${e.model} ${e.modelYear}`:OFFERS.find(o=>o.id===e.offerId)?.title}</Text>
      {e.kind==='credit'&&<Text style={s.subtitle}>Manutenção de {formatDate(e.serviceDate)} · {e.demoId}</Text>}
      <Text style={s.subtitle}>{e.kind==='credit'?'Crédito':'Resgate'} registrado em {formatDate(e.date)}</Text>
      <Text style={s.subtitle}>Programa de demonstração</Text>
    </Card>))}
  </Page>;
}

import { Text } from 'react-native';
import { router } from 'expo-router';
import { useLoyalty } from '../../src/context/LoyaltyContext';
import { BalanceCard, points } from '../../src/components/LoyaltyUI';
import { Page, Card, Action, vehicleStyles as s } from '../../src/components/VehicleUI';
export default function Rewards(){
  const {summary,loading,error}=useLoyalty();
  return <Page><Text style={s.title}>Meus pontos</Text><Text style={s.subtitle}>Suas manutenções viram benefícios de demonstração.</Text><BalanceCard/>
    {!loading&&!error&&<>
      <Card><Text style={s.heading}>Sua trajetória</Text><Text style={s.subtitle}>Pontos ganhos: {points(summary.earned)}</Text><Text style={s.subtitle}>Pontos utilizados: {points(summary.spent)}</Text><Action label="Ver extrato completo" onPress={()=>router.push('/points-history')}/></Card>
      <Card><Text style={s.heading}>Use seus pontos</Text><Action label="Escolher uma oferta" onPress={()=>router.push('/(tabs)/offers')}/><Action label="Meus resgates" onPress={()=>router.push('/my-redemptions')}/></Card>
      <Card><Text style={s.heading}>Como funciona</Text><Text style={s.subtitle}>Cada manutenção elegível dos veículos de exemplo gera 1.000 pontos uma única vez por conta. Cadastrar um VIN manualmente não gera pontos.</Text><Text style={s.subtitle}>Bronze: até 2.999 · Silver: a partir de 3.000 · Gold: a partir de 5.000 · Platinum: a partir de 10.000 pontos ganhos.</Text><Text style={s.subtitle}>O nível usa os pontos ganhos e não diminui após um resgate. Remover um veículo não apaga seu extrato.</Text><Action label="Explorar veículos" onPress={()=>router.push('/(tabs)/vehicles')}/></Card>
    </>}
  </Page>;
}

import { Text } from 'react-native';
import { router } from 'expo-router';
import { useLoyalty } from '../src/context/LoyaltyContext';
import { OFFERS } from '../src/services/loyaltyCore';
import { WalletStatus, points } from '../src/components/LoyaltyUI';
import { Page, Card, Action, formatDate, vehicleStyles as s } from '../src/components/VehicleUI';
export default function MyRedemptions(){
  const {wallet,loading,error}=useLoyalty();const entries=(wallet?.entries??[]).filter(e=>e.kind==='redemption').reverse();
  return <Page><Action label="Voltar" onPress={()=>router.canGoBack()?router.back():router.replace('/(tabs)/offers')}/><Text style={s.title}>Meus resgates</Text><Text style={s.subtitle}>Comprovantes fictícios, sem validade na rede Ford.</Text><WalletStatus/>
    {!loading&&!error&&(!entries.length?<Card><Text style={s.heading}>Nenhum resgate ainda</Text><Action label="Explorar ofertas" onPress={()=>router.push('/(tabs)/offers')}/></Card>:entries.map(e=><Card key={e.id}>
      <Text style={s.badge}>RESGATE CONFIRMADO · DEMONSTRAÇÃO</Text><Text style={s.heading}>{OFFERS.find(o=>o.id===e.offerId)?.title}</Text><Text style={s.subtitle}>{points(-e.points)} pontos · {formatDate(e.date)}</Text>
      <Text selectable style={[s.subtitle,{fontWeight:'700',color:'#002060',marginTop:14}]}>{e.coupon}</Text>
      <Text style={s.subtitle}>Este código registra sua operação no app. Não pode ser utilizado em concessionárias.</Text>
    </Card>))}
  </Page>;
}

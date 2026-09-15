import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLoyalty } from '../../src/context/LoyaltyContext';
import { OFFERS } from '../../src/services/loyaltyCore';
import { newRedemptionId } from '../../src/services/loyalty';
import { BalanceCard, points } from '../../src/components/LoyaltyUI';
import { FormMessage, PrimaryButton } from '../../src/components/AuthForm';
import { Page, Card, Action, vehicleStyles as s } from '../../src/components/VehicleUI';
export default function Offers(){
  const {wallet,summary,loading,error,busy,redeem}=useLoyalty();
  const [preparing,setPreparing]=useState(false);
  const blocked=busy||preparing;
  const [confirm,setConfirm]=useState(null),[failure,setFailure]=useState(''),[success,setSuccess]=useState('');
  const request=useRef(null),sending=useRef(false);
  async function submit(offer){
    if(sending.current)return;sending.current=true;setPreparing(true);setFailure('');setSuccess('');
    try{request.current??=await newRedemptionId();await redeem(offer.id,request.current);setConfirm(null);request.current=null;setSuccess('Resgate salvo. Seu comprovante está em Meus resgates.');}
    catch(e){setFailure(e.message||'Não foi possível resgatar. Tente novamente.');}
    finally{sending.current=false;setPreparing(false);}
  }
  return <Page><Text style={s.title}>Ofertas WeFord</Text><Text style={s.subtitle}>Benefícios fictícios para o desafio acadêmico. Os cupons não são válidos em concessionárias.</Text><BalanceCard/>
    <Action label="Meus resgates" onPress={()=>router.push('/my-redemptions')}/>
    <FormMessage message={failure}/>{!!success&&<Text accessibilityLiveRegion="polite" style={[s.subtitle,{color:'#216B42'}]}>{success}</Text>}
    {!loading&&!error&&OFFERS.map(offer=>{
      const used=wallet?.entries.some(e=>e.offerId===offer.id);const enough=summary.balance>=offer.cost;
      return <Card key={offer.id}><Text style={s.badge}>{offer.benefit} · DEMONSTRAÇÃO</Text>
        <View style={{flexDirection:'row',alignItems:'center',gap:10}}><Ionicons name={offer.icon} size={24} color="#002060"/><Text style={[s.heading,{flex:1}]}>{offer.title}</Text></View>
        <Text style={s.subtitle}>{offer.description}</Text><Text style={[s.heading,{marginTop:14}]}>{points(offer.cost)} pontos</Text>
        {used?<><Text style={s.subtitle}>Resgatada nesta conta.</Text><Action label="Ver comprovante" onPress={()=>router.push('/my-redemptions')}/></>:
          confirm===offer.id?<View><Text style={[s.subtitle,{marginBottom:12}]}>Confirmar o uso de {points(offer.cost)} pontos? Saldo após o resgate: {points(summary.balance-offer.cost)}.</Text>
            <PrimaryButton title="Confirmar resgate" busy={blocked} disabled={!enough} onPress={()=>submit(offer)}/>
            <Action label="Cancelar" disabled={blocked} onPress={()=>{setConfirm(null);request.current=null;setFailure('');}}/>
          </View>:<PrimaryButton title={enough?'Resgatar oferta':`Faltam ${points(offer.cost-summary.balance)} pontos`} disabled={blocked||!enough} onPress={()=>{setConfirm(offer.id);request.current=null;setFailure('');setSuccess('');}}/>}
      </Card>;
    })}
  </Page>;
}

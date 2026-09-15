import {ActivityIndicator,Text,View} from 'react-native';
import {useLoyalty} from '../context/LoyaltyContext';
import {Card,Action,vehicleStyles as s} from './VehicleUI';
import {COLORS} from '../styles/colors';
export const points=n=>n.toLocaleString('pt-BR');
export function WalletStatus(){const {loading,error,reload}=useLoyalty();
  if(loading)return <Card><ActivityIndicator color={COLORS.primary}/><Text style={s.subtitle}>Atualizando pontos…</Text></Card>;
  if(error)return <Card><Text accessibilityRole="alert">{error}</Text><Action label="Tentar novamente" onPress={reload}/></Card>;
  return null;
}
export function BalanceCard(){const {summary,loading,error}=useLoyalty();
  if(loading||error)return <WalletStatus/>;
  return <View style={{backgroundColor:COLORS.primary,padding:24,borderRadius:26,marginTop:20}}>
    <Text style={{color:'#D6E4FF'}}>Saldo disponível · demonstração</Text>
    <Text style={{color:'#fff',fontSize:42,fontWeight:'700',marginTop:8}}>{points(summary.balance)} <Text style={{fontSize:18}}>pontos</Text></Text>
    <Text style={{color:'#D6E4FF',marginTop:8}}>Nível {summary.level}</Text>
    <View accessibilityLabel={`Progresso do nível: ${Math.round(summary.progress*100)}%`} style={{height:9,backgroundColor:'#37619C',borderRadius:9,overflow:'hidden',marginTop:16}}><View style={{height:'100%',width:`${summary.progress*100}%`,backgroundColor:'#fff'}}/></View>
    <Text style={{color:'#D6E4FF',marginTop:10}}>{summary.nextLevel?`Faltam ${points(summary.remaining)} pontos ganhos para ${summary.nextLevel}.`:'Você alcançou o nível Platinum.'}</Text>
  </View>;
}

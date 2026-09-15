import {createContext,useContext,useEffect,useRef,useState} from 'react';
import {useVehicles} from './VehicleContext';
import {loyalty,newRedemptionId} from '../services/loyalty';
import {summarize} from '../services/loyaltyCore';
const Context=createContext(null);
export function LoyaltyProvider({accountId,children}){
  const vehicleState=useVehicles();
  const signature=vehicleState.items.filter(v=>v.isDemo).map(v=>v.demoId).sort().join(',');
  const [wallet,setWallet]=useState(null),[loading,setLoading]=useState(!!accountId),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const mounted=useRef(true),inFlight=useRef(false),revision=useRef(0);
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;};},[]);
  async function reload(){
    if(!accountId)return;
    const version=++revision.current;setLoading(true);setError('');
    try{const result=await loyalty.sync(accountId);if(mounted.current&&version===revision.current)setWallet(result);}
    catch(e){if(mounted.current&&version===revision.current)setError(e.message||'Não foi possível carregar os pontos.');}
    finally{if(mounted.current&&version===revision.current)setLoading(false);}
  }
  useEffect(()=>{
    if(!accountId)return;
    if(vehicleState.loading){setLoading(true);return;}
    if(vehicleState.error){setError('Carregue seus veículos para consultar os pontos.');setLoading(false);return;}
    reload();
  },[accountId,signature,vehicleState.loading,vehicleState.error]);
  async function redeem(offerId,requestId){
    if(inFlight.current||loading||error)throw new Error('Aguarde a atualização dos pontos.');
    inFlight.current=true;setBusy(true);
    try{const result=await loyalty.redeem(accountId,offerId,requestId||await newRedemptionId());if(mounted.current)setWallet(result);return result;}
    finally{inFlight.current=false;if(mounted.current)setBusy(false);}
  }
  return <Context.Provider value={{wallet,summary:summarize(wallet),loading,error,busy,reload,redeem}}>{children}</Context.Provider>;
}
export function useLoyalty(){const value=useContext(Context);if(!value)throw new Error('useLoyalty requer LoyaltyProvider.');return value;}

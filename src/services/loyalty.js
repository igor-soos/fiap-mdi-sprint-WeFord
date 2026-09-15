import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import catalog from '../data/demoVehicles.json';
import { AUTH_KEY } from './authCore';
import { vehicles } from './vehicles';
import { createLoyaltyService } from './loyaltyCore';
export const newRedemptionId=async()=>Array.from(await Crypto.getRandomBytesAsync(16),b=>b.toString(16).padStart(2,'0')).join('');
export const loyalty=createLoyaltyService({storage:AsyncStorage,catalog,
  getDemoIds:async id=>(await vehicles.list(id)).items.filter(v=>v.isDemo).map(v=>v.demoId),
  getSessionAccountId:async()=>{const raw=await AsyncStorage.getItem(AUTH_KEY);return raw?JSON.parse(raw).sessionAccountId:null;},
});

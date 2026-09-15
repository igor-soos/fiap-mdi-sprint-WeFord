import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import catalog from '../data/demoVehicles.json';
import { AUTH_KEY } from './authCore';
import { createVehicleService } from './vehicleCore';

export const demoVehicles = catalog.vehicles;
export const vehicles = createVehicleService({
  storage: AsyncStorage, catalog,
  newId: async () => Array.from(await Crypto.getRandomBytesAsync(16), b => b.toString(16).padStart(2, '0')).join(''),
  getSessionAccountId: async () => {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).sessionAccountId : null;
  },
});

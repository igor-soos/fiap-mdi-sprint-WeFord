import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { pbkdf2Async } from '@noble/hashes/pbkdf2';
import { sha256 } from '@noble/hashes/sha256';
import { createAuthService } from './authCore';
import { createPasswordService } from './passwordCore';

const passwords = createPasswordService({
  randomBytes: size => Crypto.getRandomBytesAsync(size),
  derive: (password, salt, iterations) => pbkdf2Async(sha256, password, salt, { c: iterations, dkLen: 32, asyncTick: 8 }),
});
export const auth = createAuthService({
  storage: AsyncStorage, passwords,
  newId: async () => Array.from(await Crypto.getRandomBytesAsync(16), b => b.toString(16).padStart(2, '0')).join(''),
});

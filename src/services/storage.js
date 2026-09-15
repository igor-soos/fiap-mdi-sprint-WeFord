import AsyncStorage from '@react-native-async-storage/async-storage';
// Propagate failures so callers do not show success before data is saved.
export async function saveData(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
export async function getData(key) {
  const value = await AsyncStorage.getItem(key);
  return value === null ? null : JSON.parse(value);
}
export async function removeData(key) { await AsyncStorage.removeItem(key); }

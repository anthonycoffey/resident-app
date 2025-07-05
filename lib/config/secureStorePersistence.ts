import * as SecureStore from 'expo-secure-store';
import { Persistence } from 'firebase/auth';

export const getSecureStorePersistence = (): Persistence => {
  return {
    type: 'LOCAL',
    async _isAvailable(): Promise<boolean> {
      return await SecureStore.isAvailableAsync();
    },
    _set: (key: string, value: string) => {
      return SecureStore.setItemAsync(key, value);
    },
    _get: (key: string) => {
      return SecureStore.getItemAsync(key);
    },
    _remove: (key: string) => {
      return SecureStore.deleteItemAsync(key);
    },
  } as unknown as Persistence;
};

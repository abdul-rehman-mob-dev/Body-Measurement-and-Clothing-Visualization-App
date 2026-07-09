import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const ENCRYPTION_KEY_PREFIX = 'enc_';
const MEASUREMENTS_KEY = 'measurements';
const USER_DATA_KEY = 'userData';
const SENSITIVE_KEYS = ['token', 'refreshToken', 'email', 'userId'];
const STORED_KEYS_KEY = 'app_stored_keys';

export class SecureStorage {
  private static encryptionKey: string | null = null;

  static async initialize(): Promise<void> {
    this.encryptionKey = await this.getOrCreateEncryptionKey();
  }

  private static async getOrCreateEncryptionKey(): Promise<string> {
    const existingKey = await SecureStore.getItemAsync('app_encryption_key');
    if (existingKey) return existingKey;

    const newKey = Crypto.randomUUID();
    await SecureStore.setItemAsync('app_encryption_key', newKey);
    return newKey;
  }

  private static async getStoredKeys(): Promise<string[]> {
    const keysJson = await SecureStore.getItemAsync(STORED_KEYS_KEY);
    return keysJson ? JSON.parse(keysJson) : [];
  }

  private static async addStoredKey(key: string): Promise<void> {
    const keys = await this.getStoredKeys();
    if (!keys.includes(key)) {
      keys.push(key);
      await SecureStore.setItemAsync(STORED_KEYS_KEY, JSON.stringify(keys));
    }
  }

  private static async removeStoredKey(key: string): Promise<void> {
    const keys = await this.getStoredKeys();
    const filteredKeys = keys.filter(k => k !== key);
    await SecureStore.setItemAsync(STORED_KEYS_KEY, JSON.stringify(filteredKeys));
  }

  static async encrypt(data: string): Promise<string> {
    if (!this.encryptionKey) await this.initialize();

    const iv = Crypto.randomUUID();
    const encrypted = await this.xorEncrypt(data, this.encryptionKey!);
    return `${iv}:${encrypted}`;
  }

  static async decrypt(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) await this.initialize();

    const [, encrypted] = encryptedData.split(':');
    return this.xorEncrypt(encrypted, this.encryptionKey!);
  }

  private static async xorEncrypt(data: string, key: string): Promise<string> {
    let result = '';
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  }

  static async saveMeasurement(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      const encrypted = await this.encrypt(jsonValue);
      await SecureStore.setItemAsync(`${ENCRYPTION_KEY_PREFIX}${key}`, encrypted);
      await this.addStoredKey(`${ENCRYPTION_KEY_PREFIX}${key}`);
    } catch (error) {
      console.error('Failed to save measurement:', error);
      throw error;
    }
  }

  static async getMeasurement(key: string): Promise<any> {
    try {
      const encrypted = await SecureStore.getItemAsync(`${ENCRYPTION_KEY_PREFIX}${key}`);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get measurement:', error);
      return null;
    }
  }

  static async saveUserData(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      const encrypted = await this.encrypt(jsonValue);
      await SecureStore.setItemAsync(`${key}`, encrypted);
      await this.addStoredKey(key);
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  static async getUserData(key: string): Promise<any> {
    try {
      const encrypted = await SecureStore.getItemAsync(key);
      if (!encrypted) return null;

      const decrypted = await this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  static async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
      await this.removeStoredKey(key);
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const keys = await this.getStoredKeys();
      for (const key of keys) {
        if (key !== 'app_encryption_key' && key !== STORED_KEYS_KEY) {
          await SecureStore.deleteItemAsync(key);
        }
      }
      await SecureStore.setItemAsync(STORED_KEYS_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  static async exportUserData(): Promise<{ [key: string]: any }> {
    try {
      const keys = await this.getStoredKeys();
      const userData: { [key: string]: any } = {};

      for (const key of keys) {
        if (key !== 'app_encryption_key' && key !== STORED_KEYS_KEY) {
          const value = await SecureStore.getItemAsync(key);
          if (value) {
            try {
              userData[key] = JSON.parse(await this.decrypt(value));
            } catch {
              userData[key] = value;
            }
          }
        }
      }

      return userData;
    } catch (error) {
      console.error('Failed to export user data:', error);
      throw error;
    }
  }

  static async anonymizeData(): Promise<void> {
    try {
      const keys = await this.getStoredKeys();
      for (const key of keys) {
        if (SENSITIVE_KEYS.some(sensitiveKey => key.includes(sensitiveKey))) {
          await SecureStore.deleteItemAsync(key);
          await this.removeStoredKey(key);
        }
      }
    } catch (error) {
      console.error('Failed to anonymize data:', error);
      throw error;
    }
  }
}

export default SecureStorage;


import { generateEncryptionKey, exportKey, importKey, encryptData, decryptData } from './encryption';

// Interface for data items
export interface DataRecord {
  id: string;
  name?: string;
  source: string;
  type: string;
  extractedAt: string;
  data: any;
}

class SecureStorage {
  private dbName = 'fbDataVault';
  private storeName = 'extractedData';
  private keyStoreName = 'encryptionKeys';
  private db: IDBDatabase | null = null;
  private encryptionKey: CryptoKey | null = null;

  // Initialize database
  async init(): Promise<void> {
    if (this.db) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for extracted data
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('source', 'source', { unique: false });
          store.createIndex('extractedAt', 'extractedAt', { unique: false });
        }
        
        // Create object store for encryption keys
        if (!db.objectStoreNames.contains(this.keyStoreName)) {
          db.createObjectStore(this.keyStoreName, { keyPath: 'id' });
        }
      };
      
      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        this.initEncryptionKey().then(resolve).catch(reject);
      };
      
      request.onerror = (event) => {
        reject(new Error('Failed to open database'));
      };
    });
  }
  
  // Initialize or retrieve encryption key
  private async initEncryptionKey(): Promise<void> {
    try {
      // Try to retrieve existing key
      const storedKey = await this.getStoredEncryptionKey();
      
      if (storedKey) {
        // Use existing key
        this.encryptionKey = await importKey(storedKey);
      } else {
        // Generate new key
        this.encryptionKey = await generateEncryptionKey();
        const exportedKey = await exportKey(this.encryptionKey);
        await this.storeEncryptionKey(exportedKey);
      }
    } catch (error) {
      console.error('Error initializing encryption key:', error);
      throw error;
    }
  }
  
  // Store encryption key
  private async storeEncryptionKey(keyString: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.keyStoreName], 'readwrite');
      const store = transaction.objectStore(this.keyStoreName);
      
      const request = store.put({ id: 'mainKey', key: keyString });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store encryption key'));
    });
  }
  
  // Get stored encryption key
  private async getStoredEncryptionKey(): Promise<string | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.keyStoreName], 'readonly');
      const store = transaction.objectStore(this.keyStoreName);
      
      const request = store.get('mainKey');
      
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.key);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => reject(new Error('Failed to retrieve encryption key'));
    });
  }

  // Store data
  async storeData(data: DataRecord): Promise<void> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database or encryption key not initialized');
    }
    
    try {
      // Encrypt sensitive data
      const encryptedData = await encryptData(data.data, this.encryptionKey);
      
      // Create record with encrypted data
      const record = {
        ...data,
        data: encryptedData
      };
      
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        
        const request = store.put(record);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(new Error('Failed to store data'));
      });
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  }

  // Retrieve data by ID
  async getData(id: string): Promise<DataRecord | null> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database or encryption key not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.get(id);
      
      request.onsuccess = async () => {
        if (!request.result) {
          resolve(null);
          return;
        }
        
        try {
          const record = request.result;
          const decryptedData = await decryptData(record.data, this.encryptionKey!);
          
          resolve({
            ...record,
            data: decryptedData
          });
        } catch (error) {
          reject(new Error('Failed to decrypt data'));
        }
      };
      
      request.onerror = () => reject(new Error('Failed to retrieve data'));
    });
  }

  // Get all data
  async getAllData(): Promise<DataRecord[]> {
    if (!this.db || !this.encryptionKey) {
      throw new Error('Database or encryption key not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.getAll();
      
      request.onsuccess = async () => {
        try {
          const records: DataRecord[] = [];
          
          for (const record of request.result) {
            try {
              const decryptedData = await decryptData(record.data, this.encryptionKey!);
              records.push({
                ...record,
                data: decryptedData
              });
            } catch (error) {
              console.error(`Failed to decrypt record ${record.id}:`, error);
            }
          }
          
          resolve(records);
        } catch (error) {
          reject(new Error('Failed to process data'));
        }
      };
      
      request.onerror = () => reject(new Error('Failed to retrieve data'));
    });
  }

  // Delete data by ID
  async deleteData(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete data'));
    });
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      
      const request = store.clear();
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear data'));
    });
  }
}

// Singleton instance
const secureStorage = new SecureStorage();
export default secureStorage;

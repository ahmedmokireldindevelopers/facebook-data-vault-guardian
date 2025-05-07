
/**
 * Encryption utility functions using Web Crypto API.
 * This implementation uses AES-GCM for symmetric encryption.
 */

// Generate a random encryption key
export async function generateEncryptionKey(): Promise<CryptoKey> {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

// Export key to string format for storage
export async function exportKey(key: CryptoKey): Promise<string> {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return arrayBufferToBase64(exported);
}

// Import key from string format
export async function importKey(keyStr: string): Promise<CryptoKey> {
  const keyData = base64ToArrayBuffer(keyStr);
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// Encrypt data
export async function encryptData(data: object, key: CryptoKey): Promise<string> {
  // Generate initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Convert data to ArrayBuffer
  const dataString = JSON.stringify(data);
  const dataBuffer = new TextEncoder().encode(dataString);
  
  // Encrypt
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    dataBuffer
  );
  
  // Combine IV and encrypted data
  const result = {
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(encryptedData)
  };
  
  return JSON.stringify(result);
}

// Decrypt data
export async function decryptData<T = any>(encryptedStr: string, key: CryptoKey): Promise<T> {
  try {
    const { iv, data } = JSON.parse(encryptedStr);
    
    // Convert base64 strings back to ArrayBuffer
    const ivBuffer = base64ToArrayBuffer(iv);
    const dataBuffer = base64ToArrayBuffer(data);
    
    // Decrypt
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: ivBuffer
      },
      key,
      dataBuffer
    );
    
    // Convert ArrayBuffer to string and parse JSON
    const decryptedString = new TextDecoder().decode(decryptedBuffer);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error("Failed to decrypt data:", error);
    throw new Error("Decryption failed");
  }
}

// Helper: Convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper: Convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

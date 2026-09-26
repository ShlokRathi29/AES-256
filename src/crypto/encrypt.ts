import { bytesToBase64 } from "./encoding";

export interface EncryptionResult {
  key: string;
  encryptedData: string;
}

export async function encryptData(
  plaintext: string
): Promise<EncryptionResult> {
  // 1. Generate a random 256-bit AES key
  const cryptoKey = await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // 2. Generate a fresh 96-bit / 12-byte IV
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 3. Convert plaintext to UTF-8 bytes
  const encodedData = new TextEncoder().encode(plaintext);

  // 4. Encrypt using AES-256-GCM
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    encodedData
  );

  // 5. Export the raw 256-bit key
  const rawKey = await crypto.subtle.exportKey("raw", cryptoKey);

  // 6. Convert key to Base64
  const keyBase64 = bytesToBase64(new Uint8Array(rawKey));

  // 7. Package IV + ciphertext
  const encryptedPackage = {
    version: 1,
    algorithm: "AES-256-GCM",
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  };

  return {
    key: keyBase64,
    encryptedData: JSON.stringify(encryptedPackage),
  };
}
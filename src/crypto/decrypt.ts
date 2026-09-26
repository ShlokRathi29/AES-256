import { base64ToBytes } from "./encoding";

interface EncryptedPackage {
  version: number;
  algorithm: string;
  iv: string;
  ciphertext: string;
}

export async function decryptData(
  keyBase64: string,
  encryptedData: string
): Promise<string> {
  // Parse encrypted package
  const packageData: EncryptedPackage = JSON.parse(encryptedData);

  if (
    packageData.version !== 1 ||
    packageData.algorithm !== "AES-256-GCM"
  ) {
    throw new Error("Unsupported encrypted data format.");
  }

  // Convert key back to bytes
  const rawKey = base64ToBytes(keyBase64);

  if (rawKey.length !== 32) {
    throw new Error("Invalid AES-256 key.");
  }

  // Import key
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    rawKey,
    {
      name: "AES-GCM",
    },
    false,
    ["decrypt"]
  );

  // Convert IV and ciphertext back to bytes
  const iv = base64ToBytes(packageData.iv);
  const ciphertext = base64ToBytes(packageData.ciphertext);

  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    ciphertext
  );

  // Convert bytes back to text
  return new TextDecoder().decode(decrypted);
}
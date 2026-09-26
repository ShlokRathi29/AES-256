import { base64ToBytes } from "./encoding";

const decoder = new TextDecoder();

export async function decryptData(
  keyBase64: string,
  ciphertextBase64: string
): Promise<string> {
  if (!keyBase64.trim()) {
    throw new Error("Secret key is required.");
  }

  if (!ciphertextBase64.trim()) {
    throw new Error("Encrypted data is required.");
  }

  let keyBytes: Uint8Array;
  let combined: Uint8Array;

  try {
    keyBytes = base64ToBytes(keyBase64.trim());
  } catch {
    throw new Error(
      "Invalid secret key. Expected a valid Base64 string."
    );
  }

  try {
    combined = base64ToBytes(ciphertextBase64.trim());
  } catch {
    throw new Error(
      "Invalid encrypted data. Expected a valid Base64 string."
    );
  }

  // AES-GCM uses a 12-byte IV
  const IV_LENGTH = 12;

  if (combined.length <= IV_LENGTH) {
    throw new Error("Invalid encrypted data.");
  }

  // Extract IV
  const iv = combined.slice(0, IV_LENGTH);

  // Extract ciphertext + authentication tag
  const encryptedData = combined.slice(IV_LENGTH);

  try {
    const cryptoKey =
      await window.crypto.subtle.importKey(
        "raw",
        keyBytes.buffer as ArrayBuffer,
        {
          name: "AES-GCM",
        },
        false,
        ["decrypt"]
      );

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      encryptedData
    );

    return decoder.decode(decrypted);
  } catch {
    throw new Error(
      "Decryption failed. Check the secret key and encrypted data."
    );
  }
}
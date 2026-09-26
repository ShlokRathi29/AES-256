const decoder = new TextDecoder();

function base64ToUint8Array(base64: string): Uint8Array {
  try {
    const binary = atob(base64);

    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch {
    throw new Error("Invalid Base64 data.");
  }
}

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

  const keyBytes = base64ToUint8Array(
    keyBase64.trim()
  );

  const combined = base64ToUint8Array(
    ciphertextBase64.trim()
  );

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
        keyBytes,
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
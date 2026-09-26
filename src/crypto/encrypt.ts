import { bytesToBase64 } from "./encoding";

const encoder = new TextEncoder();

export async function encryptData(
  plaintext: string
): Promise<{
  key: string;
  ciphertext: string;
}> {
  // Generate a secure 256-bit AES key
  const cryptoKey = await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );

  // AES-GCM standard 96-bit / 12-byte IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    cryptoKey,
    encoder.encode(plaintext)
  );

  // Export the AES key
  const rawKey = await window.crypto.subtle.exportKey(
    "raw",
    cryptoKey
  );

  /*
   * Store:
   *
   * [12-byte IV][ciphertext + authentication tag]
   *
   * together as one binary value.
   */
  const combined = new Uint8Array(
    iv.length + encrypted.byteLength
  );

  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return {
    key: bytesToBase64(new Uint8Array(rawKey)),
    ciphertext: bytesToBase64(combined),
  };
}
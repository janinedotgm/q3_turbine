import * as crypto from "crypto";

const algorithm = "aes-256-gcm";
// Securely retrieve your encryption key.
// For demonstration purposes, we'll assume it's stored in an environment variable.
// Ensure that the key is 32 bytes (256 bits) for AES-256.
const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

console.log(`key length: ${key.length}`);

if (key.length !== 32) {
  throw new Error(
    "Encryption key must be 32 bytes (256 bits) long. KEY LENGTH: " + key.length
  );
}

export function encrypt(data: Uint8Array): {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
} {
  const iv = crypto.randomBytes(12); // AES-GCM standard IV size is 12 bytes
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return { encrypted, iv, authTag };
}

export function decrypt(
  encryptedData: Buffer,
  iv: Buffer,
  authTag: Buffer
): Uint8Array {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}

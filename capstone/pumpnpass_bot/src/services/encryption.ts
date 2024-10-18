import * as crypto from "crypto";

const algorithm = "aes-256-gcm";
// Securely retrieve your encryption key.
// For demonstration purposes, we'll assume it's stored in an environment variable.
// Ensure that the key is 32 bytes (256 bits) for AES-256.
const key = Buffer.from(process.env.ENCRYPTION_KEY || "", "hex");

if (key.length !== 32) {
  throw new Error(
    "Encryption key must be 32 bytes (256 bits) long. KEY LENGTH: " + key.length
  );
}

export function encrypt(data: Uint8Array): {
  encrypted: string; // Hex encoded
  iv: string;        // Hex encoded
  authTag: string;   // Hex encoded
} {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

export function decrypt(
  encryptedData: string, // Hex encoded
  iv: string,           // Hex encoded
  authTag: string       // Hex encoded
): Uint8Array {
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');
  const encryptedBuffer = Buffer.from(encryptedData, 'hex');

  if (authTagBuffer.length !== 16) {
    throw new Error("Invalid authentication tag length: " + authTagBuffer.length);
  }

  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  decipher.setAuthTag(authTagBuffer);

  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}
